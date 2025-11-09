import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-toastify";
import { FiHeart, FiEdit2, FiTrash2, FiSend } from "react-icons/fi";
import { format } from "date-fns";

const CommentSection = ({ contentId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [contentId]);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/comments/content/${contentId}`);
      setComments(data.comments);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      toast.error("Please login to comment");
      return;
    }

    try {
      await api.post("/comments", {
        contentId,
        text: newComment,
        parentCommentId: null,
      });
      setNewComment("");
      fetchComments();
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const [editText, setEditText] = useState(comment.text);
    const [isEditing, setIsEditing] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplyForm, setShowReplyForm] = useState(false);

    const isOwner = user && user.id === comment.user._id;

    const handleEdit = async () => {
      try {
        await api.put(`/comments/${comment._id}`, { text: editText });
        setIsEditing(false);
        fetchComments();
        toast.success("Comment updated");
      } catch (error) {
        toast.error("Failed to update comment");
      }
    };

    const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this comment?"))
        return;

      try {
        await api.delete(`/comments/${comment._id}`);
        fetchComments();
        toast.success("Comment deleted");
      } catch (error) {
        toast.error("Failed to delete comment");
      }
    };

    const handleLike = async () => {
      if (!isAuthenticated) {
        toast.error("Please login to like comments");
        return;
      }

      try {
        await api.post(`/comments/${comment._id}/like`);
        fetchComments();
      } catch (error) {
        toast.error("Failed to like comment");
      }
    };

    const handleReplySubmit = async (e) => {
      e.preventDefault();
      if (!replyText.trim()) return;

      if (!isAuthenticated) {
        toast.error("Please login to reply");
        return;
      }

      try {
        await api.post("/comments", {
          contentId,
          text: replyText,
          parentCommentId: comment._id,
        });
        setReplyText("");
        setShowReplyForm(false);
        fetchComments();
        toast.success("Reply added successfully");
      } catch (error) {
        toast.error("Failed to add reply");
      }
    };

    return (
      <div className={`${isReply ? "ml-12" : ""} mb-4`}>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={comment.user.avatar}
                alt={comment.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900">
                  {comment.user.name}
                </h4>
                <p className="text-xs text-gray-500">
                  {format(new Date(comment.createdAt), "MMM dd, yyyy HH:mm")}
                  {comment.isEdited && <span className="ml-1">(edited)</span>}
                </p>
              </div>
            </div>

            {isOwner && !isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-1 bg-primary text-white rounded-lg hover:bg-opacity-90"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.text);
                  }}
                  className="px-4 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-3 text-gray-700">{comment.text}</p>

              <div className="flex items-center space-x-4 mt-3 text-sm">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition"
                >
                  <FiHeart />
                  <span>{comment.likesCount || 0}</span>
                </button>

                {!isReply && isAuthenticated && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-gray-500 hover:text-primary transition"
                  >
                    {showReplyForm ? "Cancel Reply" : "Reply"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && !isReply && (
          <form onSubmit={handleReplySubmit} className="ml-12 mt-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              autoFocus
            />
            <div className="flex space-x-2 mt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 flex items-center space-x-2"
              >
                <FiSend />
                <span>Reply</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

      {/* New Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows="4"
          />
          <button
            type="submit"
            className="mt-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 flex items-center space-x-2"
          >
            <FiSend />
            <span>Post Comment</span>
          </button>
        </form>
      ) : (
        <div className="bg-gray-100 rounded-lg p-4 mb-8 text-center">
          <p className="text-gray-600">Please login to comment</p>
        </div>
      )}

      {/* Comments List */}
      <div>
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
