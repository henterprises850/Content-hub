import Comment from "../models/Comment.js";
import Content from "../models/Content.js";

export const createComment = async (req, res) => {
  try {
    const { contentId, text, parentCommentId } = req.body;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const comment = await Comment.create({
      content: contentId,
      user: req.user.id,
      text,
      parentComment: parentCommentId || null,
    });

    await comment.populate("user", "name avatar");

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommentsByContent = async (req, res) => {
  try {
    const comments = await Comment.find({
      content: req.params.contentId,
      parentComment: null,
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate("user", "name avatar")
          .sort({ createdAt: 1 });
        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    res.json({
      success: true,
      comments: commentsWithReplies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment" });
    }

    comment.text = req.body.text;
    comment.isEdited = true;
    comment.updatedAt = Date.now();
    await comment.save();

    await comment.populate("user", "name avatar");

    res.json({
      success: true,
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Delete replies as well
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = comment.likes.includes(req.user.id);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== req.user.id
      );
      comment.likesCount -= 1;
    } else {
      comment.likes.push(req.user.id);
      comment.likesCount += 1;
    }

    await comment.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: comment.likesCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
