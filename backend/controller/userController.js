import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters.",
        });
    }

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRES,
    });

    // Return user info (without password)
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "User registered successfully.",
    });
  } catch (err) {
    console.error("Register User Error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Both field are required" });
    }

    //Find by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    }

    //Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRES,
    });

    // Return user info (without password)
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "User logged in successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

//to get login user details
export const getCurrentUser = async(req, res)=>{
  try{
    const user = await User.findById(req.user.id).select('name email');
    if(!user){
      return res.status(404).json({success:false, message:'User not found'})
    }
    res.json({success:true, user})

  } catch(err){
    console.error(err);
    res.status(500).json({success:false, message:'Server error.'})
  }
}

//Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid name and email are required.'
      });
    }

    // Check if email is already used by another user
    const exist = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (exist) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use.'
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true, select: 'name email' }
    );

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

//Update Password
export const updatePassword = async(req, res)=>{
  try{
    const {currentPassword, newPassword} = req.body;
    if(!currentPassword || !newPassword || newPassword.length < 8){
      return res.status(400).json({success: false, message:'Password invalid or too short.'})
    }
      const user = await User.findById(req.user.id).select('password')
      if(!user){
        return res.status(404).json({success: false, message: 'User not found.'})
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if(!match){
        return res.status(401).json({success: false, message: 'Current password is incorrect.'})
      }
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.json({success: true, message:'Password changed.'})
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// Forgot Password - Send Email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with this email." });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and set reset token in DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiry

    await user.save();

    // Create reset URL (pointing to frontend)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please use the link below to reset your password: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'MoneyMap Password Reset',
        message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #0d9488; text-align: center;">🛡️ MoneyMap Password Reset</h2>
            <p>We received a request to reset your password. Click the button below to set a new one:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset My Password</a>
            </div>
            <p>This link is valid for **1 hour**. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 11px; color: #999; text-align: center;">If you're having trouble clicking the button, copy and paste this link into your browser:</p>
            <p style="font-size: 11px; color: #0d9488; text-align: center; word-break: break-all;">${resetUrl}</p>
          </div>
        `
      });

      res.status(200).json({ success: true, message: 'Reset email sent!' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error("Email Sending Error:", err);
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error occurred' });
  }
};

// Reset Password - Final Step
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    // Hash the token from the URL to compare with the one in DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'The reset link is invalid or has expired.' });
    }

    // Set new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Success! Your password has been reset. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error occurred during password reset.' });
  }
};
