import React, { useState, useEffect } from 'react';
import { Card, Space, Radio, Button, Form, Input, message } from 'antd';
import axios from 'axios';

const StudentPage = () => {
    const [formId, setFormId] = useState('');
    const [questions, setQuestions] = useState([]);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(null);
    const [examEnded, setExamEnded] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const fetchQuestions = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5100/api/exam/get-mcq/${id}`);
            const mcqForm = response.data;
            setQuestions(mcqForm.content || []);
            setStudentAnswers({});
            setScore(null);
            setExamEnded(false);
            setFormSubmitted(true);
        } catch (error) {
            message.error('Failed to load questions.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormIdSubmit = () => {
        if (!formId) {
            message.error('Please enter a valid form ID.');
            return;
        }
        fetchQuestions(formId);
    };

    const handleAnswerChange = (qIndex, value) => {
        setStudentAnswers({ ...studentAnswers, [qIndex]: value });
    };

    const onSubmit = async () => {
        const submissionData = {
            form_id: formId,
            answers: Object.entries(studentAnswers).map(([qIndex, answer]) => ({
                questionIndex: parseInt(qIndex),
                selectedOption: answer,
            })),
        };

        try {
            // Get email from localStorage
            const userData = JSON.parse(localStorage.getItem('USER'));
            const emailId = userData.emailId;

            if (!emailId) {
                message.error('Email ID not found in localStorage.');
                return;
            }

            // Post the answers along with email ID and form ID
            const response = await axios.post('http://localhost:5100/api/exam/submit-answers', submissionData);
            const { score } = response.data;
            setScore(score);
            message.success(`Your score is ${score}`);
            setExamEnded(true);

            // Save results to the exam-results API
            const resultData = {
                emailId: emailId,
                form_id: formId,
                score: score,
            };
            await axios.post('http://localhost:5100/api/exam/exam-results', resultData);
            message.success('Your exam results have been saved.');
        } catch (error) {
            message.error('Failed to submit answers.');
        }
    };

    const handleVisibilityChange = () => {
        if (document.hidden && formSubmitted && !examEnded) {
            onSubmit();
        }
    };

    const handleKeyPress = () => {
        if (formSubmitted && !examEnded) {
            onSubmit();
        }
    };

    useEffect(() => {
        if (formSubmitted) {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('keydown', handleKeyPress);
        }
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [formSubmitted, examEnded]);

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#e9f5e6',
        padding: '20px',
    };

    const formStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 128, 0, 0.2)',
        width: '100%',
        maxWidth: '600px',
        fontFamily: "'Roboto', sans-serif",
        border: '2px solid #28a745',
    };

    const inputStyle = {
        padding: '12px',
        fontSize: '18px',
        fontWeight: 'bold',
        borderRadius: '5px',
        border: '2px solid #28a745',
        marginBottom: '15px',
    };

    const buttonStyle = {
        backgroundColor: '#28a745',
        color: 'white',
        width: '100%',
        height: '45px',
        borderRadius: '5px',
        fontSize: '18px',
        fontWeight: 'bold',
    };

    const cardStyle = {
        marginBottom: '20px',
        border: '1px solid #d4edda',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 128, 0, 0.2)',
    };

    const questionTextStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#155724',
    };

    const radioStyle = {
        fontSize: '16px',
        fontWeight: '500',
        color: '#155724',
    };

    const scoreTextStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#28a745',
        textAlign: 'center',
    };

    return (
        <div style={containerStyle}>
            <Form name="studentExam" autoComplete="off" style={formStyle}>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    {!formSubmitted && (
                        <>
                            <Input
                                placeholder="Enter Form ID"
                                value={formId}
                                onChange={(e) => setFormId(e.target.value)}
                                style={inputStyle}
                            />
                            <Button type="primary" onClick={handleFormIdSubmit} style={buttonStyle}>
                                Start Exam
                            </Button>
                        </>
                    )}

                    {loading && <p>Loading questions...</p>}

                    {formSubmitted && !examEnded && (
                        <>
                            {questions.length === 0 ? (
                                <p>No questions available.</p>
                            ) : (
                                questions.map((q, qIndex) => (
                                    <Card key={qIndex} title={`Question ${qIndex + 1}`} style={cardStyle}>
                                        <p style={questionTextStyle}>{q.question}</p>
                                        <Radio.Group
                                            onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                            value={studentAnswers[qIndex]}
                                            style={{ marginTop: '10px' }}
                                        >
                                            <Radio value="option1" style={radioStyle}>{q.option1}</Radio>
                                            <Radio value="option2" style={radioStyle}>{q.option2}</Radio>
                                            <Radio value="option3" style={radioStyle}>{q.option3}</Radio>
                                            <Radio value="option4" style={radioStyle}>{q.option4}</Radio>
                                        </Radio.Group>
                                    </Card>
                                ))
                            )}
                            <Button type="primary" onClick={onSubmit} style={buttonStyle}>
                                Submit
                            </Button>
                        </>
                    )}

                    {examEnded && <p style={scoreTextStyle}>Your score is: {score}</p>}
                </Space>
            </Form>
        </div>
    );
};

export default StudentPage;
