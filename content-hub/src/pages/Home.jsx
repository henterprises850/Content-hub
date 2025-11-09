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

  // Helper function to render pagination numbers smartly
  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisible =
      window.innerWidth < 640 ? 3 : window.innerWidth < 768 ? 5 : 7;

    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Show first page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setPage(1)}
          className="px-3 py-2 sm:px-4 rounded-lg bg-white hover:bg-gray-50 text-sm sm:text-base"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="px-2">
            ...
          </span>
        );
      }
    }

    // Show page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-2 sm:px-4 rounded-lg text-sm sm:text-base ${
            page === i ? "bg-primary text-white" : "bg-white hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className="px-3 py-2 sm:px-4 rounded-lg bg-white hover:bg-gray-50 text-sm sm:text-base"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
          Welcome to ContentHub
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 leading-relaxed opacity-95">
          Explore fascinating stories, fun facts, festivals, and more!
        </p>

        {/* Search Bar - Optimized for Mobile */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for content..."
              className="flex-1 px-4 py-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-white text-gray-900 text-base placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="bg-white text-primary px-6 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg font-semibold hover:bg-gray-100 active:bg-gray-200 transition flex items-center justify-center space-x-2 min-h-[48px] shadow-sm"
            >
              <FiSearch className="text-lg" />
              <span className="text-base">Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="mb-6 sm:mb-8">
        {/* Categories - Horizontal Scroll on Mobile */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Categories:
          </h2>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap min-h-[44px] text-sm sm:text-base ${
                    category === cat
                      ? "bg-primary text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Filter - Touch Friendly */}
        <div>
          <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => {
                setFeatured(e.target.checked);
                setPage(1);
              }}
              className="w-5 h-5 sm:w-6 sm:h-6 text-primary focus:ring-primary rounded"
            />
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Show Featured Only
            </span>
          </label>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-base sm:text-lg text-gray-600">
            Loading content...
          </div>
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4">
          <p className="text-lg sm:text-xl text-gray-600">No content found</p>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Try adjusting your filters or search term
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {contents.map((content) => (
              <ContentCard key={content._id} content={content} />
            ))}
          </div>

          {/* Pagination - Mobile Optimized */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 pb-4">
              {/* Previous Button */}
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="w-full sm:w-auto px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base min-h-[44px]"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                {renderPaginationNumbers()}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="w-full sm:w-auto px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm sm:text-base min-h-[44px]"
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
