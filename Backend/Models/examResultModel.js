const mongoose = require("mongoose");

const ExamResultSchema = new mongoose.Schema({
  mcqFormId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "mcqs",
    required: true,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
  },
  score: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ExamResult = mongoose.model("ExamResult", ExamResultSchema);
module.exports = ExamResult;
