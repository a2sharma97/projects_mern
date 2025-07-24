const mongoose = require("mongoose");
require("dotenv").config();
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("connect to database");
  } catch (e) {
    console.log("connection error : ", e);
  }
};

connectDB();

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
    minLength: 3,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
    minLength: 3,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minLength: 8,
  },
  verifyOtp: {
    type: String,
    default: "",
  },
  verifyOtpExpireAt: {
    type: Number,
    default: 0,
  },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = {
  User,
};
