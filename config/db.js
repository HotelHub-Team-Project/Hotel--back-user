import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  console.error("MongoDB URI(.env MONGO_URI 또는 MONGODB_URI)가 없습니다.");
  process.exit(1);
}

const buildConnection = (dbName, label) => {
  if (!dbName) {
    console.error(`${label} DB 이름이 없습니다. (.env에 MONGO_DB_${label.toUpperCase()} 설정)`);
    process.exit(1);
  }
  return mongoose.createConnection(uri, {
    dbName,
    serverSelectionTimeoutMS: 5000,
  });
};

export const userConnection = buildConnection(process.env.MONGO_DB_USER, "user");
export const businessConnection = buildConnection(
  process.env.MONGO_DB_BUSINESS || process.env.MONGO_DB_OWNER,
  "business"
);
export const serviceConnection = buildConnection(process.env.MONGO_DB_SERVICE, "service");

export const connectDB = async () => {
  try {
    await Promise.all([
      userConnection.asPromise(),
      businessConnection.asPromise(),
      serviceConnection.asPromise(),
    ]);
    console.log("MongoDB connections ready (user/business/service)");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};
