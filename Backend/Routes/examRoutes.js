const express = require("express");
const {
  getMcqForm,
  submitAnswers,
  submitMcqForm,
  getMcqFormsForStudent,
  storeExamResult,
  getExamResultsByClassId
} = require("../Controllers/examController");


const router = express.Router();

router.get("/get-mcq/:form_id", getMcqForm);
router.post("/submit-answers", submitAnswers);
router.post("/submit-mcq", submitMcqForm);
router.get("/mcq-forms/:classId", getMcqFormsForStudent);
router.post("/exam-results", storeExamResult);
router.get("/exam-results/:classId", getExamResultsByClassId);

module.exports = router;
