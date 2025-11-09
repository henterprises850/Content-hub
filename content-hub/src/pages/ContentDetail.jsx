import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import CommentSection from "../components/CommentSection";
import { toast } from "react-toastify";
import { FiHeart, FiEye, FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";
import { format } from "date-fns";

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const hasIncrementedView = useRef(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        // First fetch without incrementing view
        const { data } = await api.get(`/content/${id}?incrementView=false`);
        setContent(data.content);

        if (user && data.content.likes.includes(user.id)) {
          setLiked(true);
        }

        // Increment view only once
        if (!hasIncrementedView.current) {
          hasIncrementedView.current = true;
          // Increment view after a small delay to ensure single call
          setTimeout(async () => {
            try {
              const { data: updatedData } = await api.get(
                `/content/${id}?incrementView=true`
              );
              setContent((prevContent) => ({
                ...prevContent,
                views: updatedData.content.views,
              }));
            } catch (error) {
              console.error("Failed to increment view");
            }
          }, 500);
        }
      } catch (error) {
        toast.error("Failed to load content");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadContent();

    // Cleanup function
    return () => {
      hasIncrementedView.current = false;
    };
  }, [id, user, navigate]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to like content");
      return;
    }

    try {
      const { data } = await api.post(`/content/${id}/like`);
      setLiked(data.liked);
      setContent((prevContent) => ({
        ...prevContent,
        likesCount: data.likesCount,
      }));
    } catch (error) {
      toast.error("Failed to like content");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this content?"))
      return;

    try {
      await api.delete(`/content/${id}`);
      toast.success("Content deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete content");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!content) return null;

  const canEdit =
    user && (user.id === content.author._id || user.role === "admin");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary mb-6"
      >
        <FiArrowLeft />
        <span>Back to Home</span>
      </Link>

      {/* Main Content */}
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header Image */}
        {content.images && content.images.length > 0 && (
          <img
            src={content.images[0].url}
            alt={content.title}
            className="w-full h-96 object-cover"
          />
        )}

        <div className="p-8">
          {/* Meta Info */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white">
              {content.category}
            </span>

            {canEdit && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/admin?edit=${content._id}`)}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <FiEdit2 />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {content.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div className="flex items-center space-x-3">
              <img
                src={content.author.avatar}
                alt={content.author.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {content.author.name}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(content.publishedAt), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <FiEye />
                <span>{content.views}</span>
              </div>
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition ${
                  liked ? "text-red-500" : "hover:text-red-500"
                }`}
              >
                <FiHeart fill={liked ? "currentColor" : "none"} />
                <span>{content.likesCount}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-700 mb-6">{content.description}</p>

          {/* Body Content */}
          <div
            className="prose max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {content.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mt-8">
        <CommentSection contentId={id} />
      </div>
    </div>
  );
};

export default ContentDetail;
