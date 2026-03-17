import mongoose from "mongoose";

const connectDB = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("mongoDB connected");
  } catch (err) {
    console.log("DB Error:", err.message);
  }
};

export default connectDB;
