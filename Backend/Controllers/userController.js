const User = require("../Models/userModel");
const Class = require("../Models/classModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateAuthToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// const loginUser = async (req, res) => {
//   try {
//     const { emailId, mobileNo, password } = req.body;
//     // Find the user by either emailId or mobileNo
//     const user = await User.findOne({
//       $or: [{ emailId }, { mobileNo }],
//     });
    
//     // console.log(user)

//     if (!user) {
//       return res.status(400).json({ error: "User not found" });
//     }

//     // Compare passwords using bcrypt 
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(401).json({ error: "Invalid Password" });
//     }

//     // Check if user is part of any class~
//     const isMember = await Class.findOne({
//       "members.emailId": user.emailId,
//     });

//     if (!isMember) {
//       return res
//         .status(403)
//         .json({ error: "Access denied. User is not a member of any class." });
//     }

//     // Generate token
//     const token = generateAuthToken(user);
//     return res.status(200).json({
//       message: "Login Successful",
//       user: {
//         _id: user._id,
//         username: user.username,
//         emailId: user.emailId,
//         mobileNo: user.mobileNo,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };
const loginUser = async (req, res) => {
  const { emailId, password } = req.body;
  // console.log(emailId)
  try {
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login Successful",
      user: {
        _id: user._id,
        emailId: user.emailId,
        role: user.role,
        username: user.username
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, mobileNo, emailId, password } = req.body;

    // Check if a user with the same email or mobile number already exists
    const existingUser = await User.findOne({
      $or: [{ emailId }, { mobileNo }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      mobileNo,
      emailId,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();
    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { emailId, password, confirmPassword } = req.body;

  // Check if all required fields are provided
  if (!emailId || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if password and confirmPassword match
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password and confirm password must match." });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password in the User model
    const updatedUser = await User.findOneAndUpdate(
      { emailId },
      { password: hashedPassword },
      { new: true }
    );

    // Check if user with emailId exists
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Password updated successfully.",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

module.exports = {
  loginUser,
  generateAuthToken,
  registerUser,
  forgotPassword
};
