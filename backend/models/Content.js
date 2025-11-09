import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
    maxlength: 500,
  },
  body: {
    type: String,
    required: [true, "Please provide content body"],
  },
  category: {
    type: String,
    required: [true, "Please select a category"],
    enum: [
      "history",
      "fun",
      "memes",
      "festivals",
      "travel",
      "food",
      "culture",
      "other",
    ],
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  images: [
    {
      url: String,
      caption: String,
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likesCount: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "published",
  },
  featured: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
contentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better search performance
contentSchema.index({
  title: "text",
  description: "text",
  body: "text",
  tags: "text",
});
contentSchema.index({ category: 1, publishedAt: -1 });
contentSchema.index({ featured: 1, publishedAt: -1 });

export default mongoose.model("Content", contentSchema);
