const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
    },
    mobileNo: {
      type: String,
      //   required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
