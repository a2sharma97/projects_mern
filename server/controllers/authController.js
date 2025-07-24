const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../config/mongodb");
const { userSchema } = require("../types/types.js");
const { transporter } = require("../config/nodemailer.js");
const { success } = require("zod");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

const register = async (req, res) => {
  const payload = req.body;
  const parsedPayload = userSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    const user = await User.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: hashedPassword,
    });
    const userId = user._id;
    const token = jwt.sign(
      {
        userId,
      },
      JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    //sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: payload.email,
      subject: "Welcome USER",
      text: `Welcome user. Your account has been created with email id: ${payload.email}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const payload = req.body;
  const parsedPayload = userSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return res.json({
      success: false,
      message: "Email and Password are required",
    });
  }

  try {
    const user = await User.findOne({ email: payload.email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(payload.password, user.password);

    if (!isMatch) {
      res.json({ success: false, message: "Invalid password" });
    }

    const userId = user._id;
    const token = jwt.sign(
      {
        userId,
      },
      JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
    };
    await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      message: "Verification OTP sent on Email",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//check if user is authenticated
const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//send password reset OTP
const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
    };
    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Reset User Password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
};
