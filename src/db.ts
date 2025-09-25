import * as mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let cachedDb: mongoose.Connection | null = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    cachedDb = db.connection;
    return cachedDb;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
export default connectToDatabase;
