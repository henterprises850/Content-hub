import Content from "../models/Content.js";
import { cloudinary } from "../middleware/upload.js";

export const createContent = async (req, res) => {
  try {
    const { title, description, body, category, tags, status } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload_stream(
          { folder: "content-hub" },
          (error, result) => {
            if (error) throw error;
            return result;
          }
        );

        file.stream.pipe(result);
        images.push({ url: result.secure_url, caption: "" });
      }
    }

    const content = await Content.create({
      title,
      description,
      body,
      category,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      images,
      author: req.user.id,
      status: status || "published",
    });

    await content.populate("author", "name avatar");

    res.status(201).json({
      success: true,
      content,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const featured = req.query.featured;

    let query = { status: "published" };

    if (category && category !== "all") {
      query.category = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const total = await Content.countDocuments(query);
    const content = await Content.find(query)
      .populate("author", "name avatar")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      content,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalContent: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContentById = async (req, res) => {
  try {
    // Get the content without incrementing views first
    const content = await Content.findById(req.params.id).populate(
      "author",
      "name avatar bio"
    );

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Check if this is a view increment request or just data fetch
    const shouldIncrementView = req.query.incrementView === "true";

    if (shouldIncrementView) {
      // Increment views only when explicitly requested
      await Content.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: false }
      );
      content.views += 1;
    }

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateContent = async (req, res) => {
  try {
    let content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Check if user is author or admin
    if (
      content.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this content" });
    }

    const { title, description, body, category, tags, status, featured } =
      req.body;

    content = await Content.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        body,
        category,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : content.tags,
        status,
        featured: req.user.role === "admin" ? featured : content.featured,
      },
      { new: true, runValidators: true }
    ).populate("author", "name avatar");

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (
      content.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this content" });
    }

    await content.deleteOne();

    res.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const alreadyLiked = content.likes.includes(req.user.id);

    if (alreadyLiked) {
      content.likes = content.likes.filter(
        (id) => id.toString() !== req.user.id
      );
      content.likesCount -= 1;
    } else {
      content.likes.push(req.user.id);
      content.likesCount += 1;
    }

    await content.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: content.likesCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContentStats = async (req, res) => {
  try {
    const totalContent = await Content.countDocuments();
    const totalViews = await Content.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalLikes = await Content.aggregate([
      { $group: { _id: null, total: { $sum: "$likesCount" } } },
    ]);
    const contentByCategory = await Content.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalContent,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        contentByCategory,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
