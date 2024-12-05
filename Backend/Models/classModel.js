const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    members: [
      {
        emailId: { type: String, required: true },
        role: { type: String, enum: ["teacher", "student"], required: true },
        password: { type: String, required: true, default: "1000" },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notes", // Referencing the Notes model
      },
    ],
  },
  { timestamps: true }
);

const Class = mongoose.models.Class || mongoose.model("Class", classSchema);
module.exports = Class;
