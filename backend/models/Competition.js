import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a competition title"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  rules: {
    type: String,
    required: true,
  },
  prizes: [
    {
      position: String,
      description: String,
    },
  ],
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  registrationDeadline: {
    type: Date,
    required: true,
  },
  maxParticipants: {
    type: Number,
    default: null,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  status: {
    type: String,
    enum: ["upcoming", "active", "completed", "cancelled"],
    default: "upcoming",
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      registeredAt: {
        type: Date,
        default: Date.now,
      },
      answers: mongoose.Schema.Types.Mixed,
      status: {
        type: String,
        enum: ["registered", "submitted", "winner"],
        default: "registered",
      },
    },
  ],
  customFields: [
    {
      fieldName: String,
      fieldType: String,
      required: Boolean,
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Competition", competitionSchema);
