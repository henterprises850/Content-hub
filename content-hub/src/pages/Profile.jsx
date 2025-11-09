import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-toastify";
import { FiCamera, FiSave, FiUser, FiMail, FiEdit2 } from "react-icons/fi";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });
  const [previewImage, setPreviewImage] = useState(user?.avatar || "");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({
          ...formData,
          avatar: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.put("/auth/profile", formData);
      updateUser(data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      bio: user?.bio || "",
      avatar: user?.avatar || "",
    });
    setPreviewImage(user?.avatar || "");
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <p className="text-xl text-gray-600">
          Please login to view your profile
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary h-32"></div>

        <div className="px-8 pb-8">
          {/* Profile Picture */}
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
            <div className="relative">
              <img
                src={previewImage}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-opacity-90 transition">
                  <FiCamera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 flex items-center justify-center md:justify-start mt-1">
                <FiMail className="mr-2" />
                {user.email}
              </p>
              {user.role === "admin" && (
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                  Admin
                </span>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 md:mt-0 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition flex items-center space-x-2"
              >
                <FiEdit2 />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    !isEditing ? "bg-gray-50 text-gray-600" : ""
                  }`}
                  required
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="4"
                  placeholder="Tell us about yourself..."
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    !isEditing ? "bg-gray-50 text-gray-600" : ""
                  }`}
                  maxLength="500"
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FiSave />
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.createdAt && !isNaN(new Date(user.createdAt).getTime())
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not Available"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
