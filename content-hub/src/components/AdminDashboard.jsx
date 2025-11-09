import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { FiFileText, FiEye, FiHeart, FiTrendingUp } from "react-icons/fi";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/content/stats");
      setStats(data.stats);
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FiFileText}
          title="Total Content"
          value={stats?.totalContent || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={FiEye}
          title="Total Views"
          value={stats?.totalViews || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={FiHeart}
          title="Total Likes"
          value={stats?.totalLikes || 0}
          color="bg-red-500"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Engagement Rate"
          value={
            stats?.totalContent > 0
              ? `${
                  Math.round((stats?.totalLikes / stats?.totalContent) * 10) /
                  10
                }`
              : "0"
          }
          color="bg-purple-500"
        />
      </div>

      {/* Content by Category */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Content by Category</h3>
        <div className="space-y-3">
          {stats?.contentByCategory?.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">{item._id}</span>
              <div className="flex items-center space-x-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(item.count / stats.totalContent) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-gray-900 font-semibold w-12 text-right">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
