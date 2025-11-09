import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update all users without createdAt
    const result = await User.updateMany(
      { createdAt: { $exists: false } },
      {
        $set: {
          createdAt: new Date(),
          bio: "",
        },
      }
    );

    console.log(`Migration completed: ${result.modifiedCount} users updated`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateUsers();
