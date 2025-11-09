import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/AdminDashboard";
import ContentEditor from "../components/ContentEditor";
import CompetitionForm from "../components/CompetitionForm";
import api from "../utils/api";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

const AdminPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [contents, setContents] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [editingContent, setEditingContent] = useState(null);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setActiveTab("content");
      fetchContentForEdit(editId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "content-list") {
      fetchContents();
    } else if (activeTab === "competitions-list") {
      fetchCompetitions();
    }
  }, [activeTab]);

  const fetchContentForEdit = async (id) => {
    setLoadingEdit(true);
    try {
      const { data } = await api.get(`/content/${id}?incrementView=false`);
      setEditingContent(data.content);
    } catch (error) {
      toast.error("Failed to load content for editing");
      setSearchParams({});
    } finally {
      setLoadingEdit(false);
    }
  };

  const fetchContents = async () => {
    try {
      const { data } = await api.get("/content", { params: { limit: 100 } });
      setContents(data.content);
    } catch (error) {
      toast.error("Failed to load contents");
    }
  };

  const fetchCompetitions = async () => {
    try {
      const { data } = await api.get("/competitions");
      setCompetitions(data.competitions);
    } catch (error) {
      toast.error("Failed to load competitions");
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?"))
      return;

    try {
      await api.delete(`/content/${id}`);
      toast.success("Content deleted successfully");
      fetchContents();
    } catch (error) {
      toast.error("Failed to delete content");
    }
  };

  const handleDeleteCompetition = async (id) => {
    if (!window.confirm("Are you sure you want to delete this competition?"))
      return;

    try {
      await api.delete(`/competitions/${id}`);
      toast.success("Competition deleted successfully");
      fetchCompetitions();
    } catch (error) {
      toast.error("Failed to delete competition");
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      await api.put(`/content/${id}`, { featured: !currentStatus });
      toast.success("Content updated successfully");
      fetchContents();
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setActiveTab("content");
    setSearchParams({ edit: content._id });
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "content", label: "Create Content" },
    { id: "content-list", label: "Manage Content" },
    { id: "competition", label: "Create Competition" },
    { id: "competitions-list", label: "Manage Competitions" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingContent(null);
                setEditingCompetition(null);
                setSearchParams({});
              }}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "dashboard" && <AdminDashboard />}

        {activeTab === "content" &&
          (loadingEdit ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading content...</div>
            </div>
          ) : (
            <ContentEditor
              editContent={editingContent}
              onSuccess={() => {
                setEditingContent(null);
                setActiveTab("content-list");
                setSearchParams({});
                fetchContents();
              }}
            />
          ))}

        {activeTab === "content-list" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">All Content</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contents.map((content) => (
                    <tr key={content._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {content.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary text-white">
                          {content.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            content.status === "published"
                              ? "bg-green-100 text-green-800"
                              : content.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {content.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {content.likesCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {content.views}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleToggleFeatured(content._id, content.featured)
                          }
                          className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                            content.featured
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {content.featured ? "Featured" : "Not Featured"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              window.open(`/content/${content._id}`, "_blank")
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditContent(content)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(content._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No content found
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "competition" && (
          <CompetitionForm
            editCompetition={editingCompetition}
            onSuccess={() => {
              setEditingCompetition(null);
              setActiveTab("competitions-list");
            }}
          />
        )}

        {activeTab === "competitions-list" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">All Competitions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {competitions.map((competition) => (
                    <tr key={competition._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {competition.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {competition.category}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            competition.status === "active"
                              ? "bg-green-100 text-green-800"
                              : competition.status === "upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : competition.status === "completed"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {competition.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {competition.participants.length}
                        {competition.maxParticipants &&
                          ` / ${competition.maxParticipants}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(
                          competition.registrationDeadline
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingCompetition(competition);
                              setActiveTab("competition");
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCompetition(competition._id)
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {competitions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No competitions found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
