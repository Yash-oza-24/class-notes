const mongoose = require("mongoose");
const Mcqformschema = new mongoose.Schema({
  form_id: {
    type: String,
  },
  description: {
    type: String,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  content: [    
    {
      question: {
        type: String,
      },
      option1: {
        type: String,
      },
      option2: {
        type: String,
      },
      option3: {
        type: String,
      },
      option4: {
        type: String,
      },
      correctAnswer: {
        type: String,
      },
    },
  ],
});

const mcqform = mongoose.model("mcqs", Mcqformschema);
module.exports = mcqform;
