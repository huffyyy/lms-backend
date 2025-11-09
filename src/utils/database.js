import mongoose from "mongoose";

export default function connectDB() {
  const DATABASE_URL = process.env.DATABASE_URL ?? "";

  try {
    mongoose.connect(DATABASE_URL);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;

  dbConnection.once("open", (_) => {
    console.log(`Database Connected ${DATABASE_URL}`);
  });

  dbConnection.on("error", (err) => {
    console.error(`Connection Error ${err}`);
  });
}
