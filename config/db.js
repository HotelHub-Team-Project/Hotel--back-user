import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || "hotel-project";

if (!uri) {
  console.error("MongoDB URI (MONGO_URI or MONGODB_URI) is missing.");
  process.exit(1);
}

// Single shared connection for all models
export const dbConnection = mongoose.createConnection(uri, {
  serverSelectionTimeoutMS: 5000,
  dbName,
});

export const connectDB = async () => {
  try {
    await dbConnection.asPromise();
    console.log(`MongoDB connection ready (${dbName})`);
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};
