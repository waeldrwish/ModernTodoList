import mongoose from "mongoose";

async function connectDB() {
  const uri = process.env.MONGOURI;
  if (!uri) throw new Error("MONGOURI is not defined in .env");
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
}

export default connectDB;
