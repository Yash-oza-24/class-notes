const Mcqform = require("../Models/examModel");
const ExamResult = require("../Models/examResultModel")
const mongoose = require("mongoose"); 

// Fetch a specific MCQ form by form_id
exports.getMcqForm = async (req, res) => {
  try {
    const formId = req.params.form_id;
    const mcqForm = await Mcqform.findOne({ form_id: formId });
    if (!mcqForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.status(200).json(mcqForm);
  } catch (error) {
    console.error("Error fetching the form:", error);
    res.status(500).json({ error: "Failed to fetch the form." });
  }
};

// Submit student answers and calculate the score
exports.submitAnswers = async (req, res) => {
  try {
    const { form_id, answers } = req.body;

    const mcqForm = await Mcqform.findOne({ form_id: form_id });
    if (!mcqForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    let score = 0;
    answers.forEach((answer) => {
      const questionIndex = answer.questionIndex;
      const selectedOption = answer.selectedOption;

      const correctAnswer = mcqForm.content[questionIndex].correctAnswer;

      if (selectedOption === correctAnswer) {
        score += 1;
      }
    });

    res.status(200).json({ score });
  } catch (error) {
    console.error("Error submitting answers:", error);
    res.status(500).json({ error: "Failed to submit answers." });
  }
};

// Submit a new MCQ form
exports.submitMcqForm = async (req, res) => {
  try {
    const { form_id, description, content, classId } = req.body;

    // Validate the classId
    if (!classId) {
      return res.status(400).json({ error: "classId is required." });
    }

    const newMcqForm = new Mcqform({
      form_id,
      description,
      classId, 
      content,
    });

    await newMcqForm.save();

    res.status(200).json({ 
      message: "MCQ form submitted successfully!",
      form_id: newMcqForm.form_id // Include form_id in the response
    });
  } catch (error) {
    console.error("Error submitting the form:", error);
    res.status(500).json({ error: "Failed to submit the form." });
  }
};


exports.getMcqFormsForStudent = async (req, res) => {
  try {
    const { classId } = req.params; // Assume classId is passed as a query parameter

    if (!classId) {
      return res.status(400).json({ error: "classId is required to fetch MCQ forms." });
    }

    const mcqForms = await Mcqform.find({ classId });

    if (!mcqForms.length) {
      return res.status(404).json({ message: "No MCQ forms found for the specified class." });
    }

    res.status(200).json(mcqForms);
  } catch (error) {
    console.error("Error fetching MCQ forms for the student:", error);
    res.status(500).json({ error: "Failed to fetch MCQ forms for the student." });
  }
};


exports.storeExamResult = async (req, res) => {
  try {
    const { form_id, emailId, score } = req.body;

    // Validate form_id exists in the mcqs collection
    const mcqForm = await Mcqform.findOne({ form_id });
    if (!mcqForm) {
      return res.status(404).json({ message: "Form ID not found." });
    }

    // Create a new exam result entry
    const examResult = new ExamResult({
      mcqFormId: mcqForm._id, // Reference the ObjectId of the mcqs document
      emailId,
      score,
    });

    // Save the result in the database
    await examResult.save();

    return res.status(201).json({ message: "Exam result stored successfully.", examResult });
  } catch (error) {
    console.error("Error storing exam result:", error);
    return res.status(500).json({ message: "Server error.", error });
  }
};


// Controller to fetch exam results by classId
exports.getExamResultsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;

    // Find all mcqs with the specified classId
    const mcqForms = await Mcqform.find({ classId });

    if (!mcqForms.length) {
      return res.status(404).json({ message: "No MCQ forms found for the specified class ID." });
    }

    // Extract the IDs of the mcqs
    const mcqFormIds = mcqForms.map((form) => form._id);

    // Find all exam results related to those mcqFormIds
    const examResults = await ExamResult.find({ mcqFormId: { $in: mcqFormIds } });

    if (!examResults.length) {
      return res.status(404).json({ message: "No exam results found for the specified class ID." });
    }

    return res.status(200).json({  examResults });
  } catch (error) {
    console.error("Error fetching exam results by class ID:", error);
    return res.status(500).json({ message: "Server error.", error });
  }
};