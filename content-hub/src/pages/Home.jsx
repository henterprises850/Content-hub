import React, { useState, useEffect } from "react";
import api from "../utils/api";
import ContentCard from "../components/ContentCard";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";

const Home = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featured, setFeatured] = useState(false);

  const categories = [
    "all",
    "history",
    "fun",
    "memes",
    "festivals",
    "travel",
    "food",
    "culture",
    "other",
  ];

  useEffect(() => {
    fetchContents();
  }, [category, page, featured]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        category: category !== "all" ? category : undefined,
        featured: featured ? "true" : undefined,
        search: searchTerm || undefined,
      };

      const { data } = await api.get("/content", { params });
      setContents(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchContents();
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 md:p-12 mb-8 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to ContentHub
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Explore fascinating stories, fun facts, festivals, and more!
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex max-w-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for content..."
            className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none text-gray-900"
          />
          <button
            type="submit"
            className="bg-white text-primary px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100 transition flex items-center space-x-2"
          >
            <FiSearch />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Categories:</h2>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                category === cat
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => {
                setFeatured(e.target.checked);
                setPage(1);
              }}
              className="w-5 h-5 text-primary focus:ring-primary rounded"
            />
            <span className="text-gray-700 font-medium">
              Show Featured Only
            </span>
          </label>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading content...</div>
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600">No content found</p>
          <p className="text-gray-500 mt-2">
            Try adjusting your filters or search term
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {contents.map((content) => (
              <ContentCard key={content._id} content={content} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      page === i + 1
                        ? "bg-primary text-white"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
