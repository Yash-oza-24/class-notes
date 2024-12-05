import React, { useState } from "react";
import { Card, Space, Input, Button, Form, Radio, message } from "antd";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FrontPage = () => {
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", ""],
      correctAnswer: null, // This will hold the index of the correct answer
    },
  ]);

  const navigate = useNavigate();

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = value; // Set the correct answer as the selected radio button's value
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push(""); // Add a new option
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", ""], correctAnswer: null },
    ]);
  };

  const onFinish = async (values) => {
    const classId = localStorage.getItem("classId"); // Retrieve ClassId from local storage

    const formData = {
      form_id: uuidv4(), // Generate a unique form ID
      classId, // Add ClassId to the form data
      description: values.description,
      content: questions.map((q) => ({
        question: q.question,
        option1: q.options[0],
        option2: q.options[1],
        option3: q.options[2] || "",
        option4: q.options[3] || "",
        correctAnswer: `option${q.correctAnswer + 1}`, // Send the correct answer as option1, option2, etc.
      })),
    };

    try {
      const response = await axios.post(
        "http://localhost:5100/api/exam/submit-mcq",
        formData
      );
      message.success("Form submitted successfully!");
      // Clear the form after submission
      setQuestions([{ question: "", options: ["", ""], correctAnswer: null }]);
      navigate(-1);
    } catch (error) {
      console.error("Failed to submit form:", error);
      message.error("Failed to submit form.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 p-6">
      <Form
        name="basic"
        onFinish={onFinish}
        autoComplete="off"
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl"
      >
        <Space direction="vertical" size={16} className="w-full">
          <Card className="bg-green-100">
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please input the description!" }]}
            >
              <Input
                placeholder="Description"
                className="p-2 border-2 border-green-300 rounded-md w-full"
              />
            </Form.Item>
          </Card>

          {questions.map((q, qIndex) => (
            <Card
              key={qIndex}
              title={`Question ${qIndex + 1}`}
              className="mb-5 border-2 border-green-300 rounded-lg shadow-sm"
            >
              <Input
                placeholder="Enter your question here"
                value={q.question}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                className="p-2 border-2 border-green-300 rounded-md mb-3 w-full"
              />
              <Space direction="vertical" className="mt-4 w-full">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center">
                    <Radio
                      value={oIndex}
                      checked={q.correctAnswer === oIndex}
                      onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                      className="mr-2"
                    />
                    <Input
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      className="w-9/12"
                    />
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => addOption(qIndex)}
                  className="w-full border-green-500 text-green-500"
                >
                  Add Option
                </Button>
              </Space>
            </Card>
          ))}

          <Button
            type="primary"
            onClick={addQuestion}
            className="bg-green-500 text-white w-full h-10 rounded-md mt-3"
          >
            Add Question
          </Button>
        </Space>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-green-500 text-white w-full h-10 rounded-md mt-3"
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FrontPage;
