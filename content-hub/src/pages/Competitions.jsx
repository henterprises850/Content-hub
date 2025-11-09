import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-toastify";
import { FiCalendar, FiUsers, FiAward, FiClock } from "react-icons/fi";
import { format } from "date-fns";

const Competitions = () => {
  const { user, isAuthenticated } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({});

  useEffect(() => {
    fetchCompetitions();
  }, [filter]);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const { data } = await api.get("/competitions", { params });
      setCompetitions(data.competitions);
    } catch (error) {
      toast.error("Failed to load competitions");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (competitionId) => {
    if (!isAuthenticated) {
      toast.error("Please login to register");
      return;
    }

    try {
      await api.post(`/competitions/${competitionId}/register`, {
        answers: registrationData,
      });
      toast.success("Successfully registered for competition!");
      setShowRegistrationModal(false);
      setRegistrationData({});
      fetchCompetitions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const CompetitionCard = ({ competition }) => {
    const isRegistered =
      user &&
      competition.participants.some(
        (p) => p.user === user.id || p.user._id === user.id
      );
    const isFull =
      competition.maxParticipants &&
      competition.participants.length >= competition.maxParticipants;
    const isDeadlinePassed =
      new Date() > new Date(competition.registrationDeadline);

    const getStatusColor = (status) => {
      const colors = {
        upcoming: "bg-blue-100 text-blue-800",
        active: "bg-green-100 text-green-800",
        completed: "bg-gray-100 text-gray-800",
        cancelled: "bg-red-100 text-red-800",
      };
      return colors[status] || colors.upcoming;
    };

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
        {competition.image && (
          <img
            src={competition.image}
            alt={competition.title}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                competition.status
              )}`}
            >
              {competition.status}
            </span>
            <span className="text-sm text-gray-600">
              {competition.category}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {competition.title}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-3">
            {competition.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600 text-sm">
              <FiCalendar className="mr-2" />
              <span>
                {format(new Date(competition.startDate), "MMM dd")} -{" "}
                {format(new Date(competition.endDate), "MMM dd, yyyy")}
              </span>
            </div>

            <div className="flex items-center text-gray-600 text-sm">
              <FiClock className="mr-2" />
              <span>
                Registration deadline:{" "}
                {format(
                  new Date(competition.registrationDeadline),
                  "MMM dd, yyyy"
                )}
              </span>
            </div>

            <div className="flex items-center text-gray-600 text-sm">
              <FiUsers className="mr-2" />
              <span>
                {competition.participants.length} participants
                {competition.maxParticipants &&
                  ` / ${competition.maxParticipants} max`}
              </span>
            </div>
          </div>

          {/* Prizes */}
          {competition.prizes && competition.prizes.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <FiAward className="mr-2" />
                Prizes
              </div>
              <div className="space-y-1">
                {competition.prizes.map((prize, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <span className="font-semibold">{prize.position}:</span>{" "}
                    {prize.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Register Button */}
          <button
            onClick={() => {
              setSelectedCompetition(competition);
              setShowRegistrationModal(true);
            }}
            disabled={
              isRegistered ||
              isFull ||
              isDeadlinePassed ||
              competition.status === "completed"
            }
            className={`w-full py-3 rounded-lg font-semibold transition ${
              isRegistered
                ? "bg-green-100 text-green-800 cursor-default"
                : isFull ||
                  isDeadlinePassed ||
                  competition.status === "completed"
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-primary text-white hover:bg-opacity-90"
            }`}
          >
            {isRegistered
              ? "Already Registered"
              : isFull
              ? "Competition Full"
              : isDeadlinePassed
              ? "Registration Closed"
              : competition.status === "completed"
              ? "Competition Ended"
              : "Register Now"}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading competitions...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 md:p-12 mb-8 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Competitions</h1>
        <p className="text-lg md:text-xl">
          Participate in exciting competitions and win amazing prizes!
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          {["all", "upcoming", "active", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Competitions Grid */}
      {competitions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg">
          <p className="text-xl text-gray-600">No competitions found</p>
          <p className="text-gray-500 mt-2">
            Check back later for new competitions
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => (
            <CompetitionCard key={competition._id} competition={competition} />
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedCompetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Register for Competition</h2>
              <p className="text-gray-600 mt-2">{selectedCompetition.title}</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">
                  Competition Rules
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedCompetition.rules}
                </p>
              </div>

              {selectedCompetition.customFields &&
                selectedCompetition.customFields.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-lg">
                      Additional Information
                    </h3>
                    {selectedCompetition.customFields.map((field, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.fieldName} {field.required && "*"}
                        </label>
                        {field.fieldType === "textarea" ? (
                          <textarea
                            value={registrationData[field.fieldName] || ""}
                            onChange={(e) =>
                              setRegistrationData({
                                ...registrationData,
                                [field.fieldName]: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            rows="4"
                            required={field.required}
                          />
                        ) : (
                          <input
                            type={field.fieldType}
                            value={registrationData[field.fieldName] || ""}
                            onChange={(e) =>
                              setRegistrationData({
                                ...registrationData,
                                [field.fieldName]: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

              <div className="flex space-x-4">
                <button
                  onClick={() => handleRegister(selectedCompetition._id)}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
                >
                  Confirm Registration
                </button>
                <button
                  onClick={() => {
                    setShowRegistrationModal(false);
                    setRegistrationData({});
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Competitions;
