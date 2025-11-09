import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiEye } from "react-icons/fi";
import { format } from "date-fns";

const ContentCard = ({ content }) => {
  const getCategoryColor = (category) => {
    const colors = {
      history: "bg-blue-100 text-blue-800",
      fun: "bg-yellow-100 text-yellow-800",
      memes: "bg-pink-100 text-pink-800",
      festivals: "bg-purple-100 text-purple-800",
      travel: "bg-green-100 text-green-800",
      food: "bg-red-100 text-red-800",
      culture: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {content.images && content.images.length > 0 && (
        <img
          src={content.images[0].url}
          alt={content.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
              content.category
            )}`}
          >
            {content.category}
          </span>
          {content.featured && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white">
              Featured
            </span>
          )}
        </div>

        <Link to={`/content/${content._id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary transition line-clamp-2">
            {content.title}
          </h3>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-3">{content.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <img
              src={content.author?.avatar}
              alt={content.author?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span>{content.author?.name}</span>
          </div>
          <span>{format(new Date(content.publishedAt), "MMM dd, yyyy")}</span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center space-x-1">
              <FiHeart size={18} />
              <span>{content.likesCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiEye size={18} />
              <span>{content.views || 0}</span>
            </div>
          </div>

          <Link
            to={`/content/${content._id}`}
            className="text-primary font-semibold hover:underline"
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
