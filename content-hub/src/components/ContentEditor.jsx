import React, { useState } from "react";
import ReactQuill from "react-quill";
import { toast } from "react-toastify";
import api from "../utils/api";

const ContentEditor = ({ onSuccess, editContent = null }) => {
  const [formData, setFormData] = useState({
    title: editContent?.title || "",
    description: editContent?.description || "",
    body: editContent?.body || "",
    category: editContent?.category || "other",
    tags: editContent?.tags?.join(", ") || "",
    status: editContent?.status || "published",
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    "history",
    "fun",
    "memes",
    "festivals",
    "travel",
    "food",
    "culture",
    "other",
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBodyChange = (value) => {
    setFormData({
      ...formData,
      body: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const endpoint = editContent ? `/content/${editContent._id}` : "/content";
      const method = editContent ? "put" : "post";

      await api[method](endpoint, formData);

      toast.success(
        `Content ${editContent ? "updated" : "created"} successfully!`
      );

      if (onSuccess) {
        onSuccess();
      }

      if (!editContent) {
        setFormData({
          title: "",
          description: "",
          body: "",
          category: "other",
          tags: "",
          status: "published",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {editContent ? "Edit Content" : "Create New Content"}
      </h2>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter content title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Brief description of the content"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., historical, ancient, monument"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Body *
          </label>
          <ReactQuill
            value={formData.body}
            onChange={handleBodyChange}
            modules={modules}
            className="bg-white"
            placeholder="Write your content here..."
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Saving..."
            : editContent
            ? "Update Content"
            : "Create Content"}
        </button>
      </div>
    </form>
  );
};

export default ContentEditor;
