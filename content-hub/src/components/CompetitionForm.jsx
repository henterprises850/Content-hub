import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";

const CompetitionForm = ({ onSuccess, editCompetition = null }) => {
  const [formData, setFormData] = useState({
    title: editCompetition?.title || "",
    description: editCompetition?.description || "",
    rules: editCompetition?.rules || "",
    category: editCompetition?.category || "",
    startDate: editCompetition?.startDate?.split("T")[0] || "",
    endDate: editCompetition?.endDate?.split("T")[0] || "",
    registrationDeadline:
      editCompetition?.registrationDeadline?.split("T")[0] || "",
    maxParticipants: editCompetition?.maxParticipants || "",
    status: editCompetition?.status || "upcoming",
  });
  const [prizes, setPrizes] = useState(
    editCompetition?.prizes || [{ position: "1st", description: "" }]
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePrizeChange = (index, field, value) => {
    const newPrizes = [...prizes];
    newPrizes[index][field] = value;
    setPrizes(newPrizes);
  };

  const addPrize = () => {
    setPrizes([...prizes, { position: "", description: "" }]);
  };

  const removePrize = (index) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const endpoint = editCompetition
        ? `/competitions/${editCompetition._id}`
        : "/competitions";
      const method = editCompetition ? "put" : "post";

      await api[method](endpoint, {
        ...formData,
        prizes: prizes.filter((p) => p.position && p.description),
      });

      toast.success(
        `Competition ${editCompetition ? "updated" : "created"} successfully!`
      );

      if (onSuccess) {
        onSuccess();
      }

      if (!editCompetition) {
        setFormData({
          title: "",
          description: "",
          rules: "",
          category: "",
          startDate: "",
          endDate: "",
          registrationDeadline: "",
          maxParticipants: "",
          status: "upcoming",
        });
        setPrizes([{ position: "1st", description: "" }]);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save competition"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {editCompetition ? "Edit Competition" : "Create New Competition"}
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
            required
          />
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rules *
          </label>
          <textarea
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Photography, Writing, Art"
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Deadline *
            </label>
            <input
              type="date"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Max Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Participants (Leave empty for unlimited)
          </label>
          <input
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            min="1"
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
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Prizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prizes
          </label>
          {prizes.map((prize, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={prize.position}
                onChange={(e) =>
                  handlePrizeChange(index, "position", e.target.value)
                }
                placeholder="Position"
                className="w-1/4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value={prize.description}
                onChange={(e) =>
                  handlePrizeChange(index, "description", e.target.value)
                }
                placeholder="Prize description"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {prizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePrize(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPrize}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Add Prize
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : editCompetition
            ? "Update Competition"
            : "Create Competition"}
        </button>
      </div>
    </form>
  );
};

export default CompetitionForm;
