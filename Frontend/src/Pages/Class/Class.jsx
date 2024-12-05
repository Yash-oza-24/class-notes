import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipboardIcon } from "@heroicons/react/outline";
import { TrashIcon } from "@heroicons/react/outline";

import {
  Card,
  Spin,
  Alert,
  Button,
  Modal,
  message,
  Form,
  Input,
  Upload,
  Table,
  Skeleton,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { fetchClassById } from "../Auth/Auth-api";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import * as pdfjsLib from "pdfjs-dist";

axios.defaults.baseURL = "https://class-notes-j9yw.onrender.com/api";

const { Meta } = Card;

const Class = () => {
  const { id } = useParams(); // Get the class ID from the URL
  const [classData, setClassData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notesData, setNotesData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null); // To store the selected note for viewing
  const [pdf, setPdf] = useState({
    document: "",
  });
  const [mcqData, setMcqData] = useState(null);
  const [examResults, setExamResults] = useState([]); // State for exam results
  const [loadingResults, setLoadingResults] = useState(false);
  useEffect(() => {
    if (id) {
      localStorage.setItem("classId", id); // Save the class ID to localStorage
    }
  }, [id]);

  useEffect(() => {
    const storedUser = localStorage.getItem("USER");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const data = await fetchClassById(id);
        setClassData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  useEffect(() => {
    fetchNotes();
  }, []); // Fetch notes when the component is mounted

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`http://localhost:5100/api/note/${id}`); // Replaced with the new API endpoint
      const notesWithPreview = await Promise.all(
        res.data.notes.map(async (note) => {
          let thumbnail = null;
          if (note.document) {
            try {
              const pdfData = atob(note.document.split(",")[1]);
              thumbnail = await generatePdfThumbnail(pdfData);
            } catch (error) {
              console.error("Error generating PDF thumbnail:", error);
            }
          }
          return { ...note, thumbnail };
        })
      );
      setNotesData(notesWithPreview);
    } catch (error) {
      console.error("Error fetching notes:", error);
      message.error("Error fetching notes");
    }
  };

  const handleRemoveMember = async (classId, emailId) => {
    try {
      const res = await axios.delete(`/class/${classId}/remove-people`, {
        headers: {
          "Content-Type": "application/json",
        },
        data: { emailId },
      });

      // After removing a member, re-fetch the class data to update the UI
      if (res.data && res.data.class) {
        alert("Member removed successfully!");
        const data = await fetchClassById(id);
        setClassData(data);
      } else {
        throw new Error("Failed to remove member.");
      }
    } catch (error) {
      console.error("Error removing member:", error.message);
      alert("Failed to remove the member. Please try again.");
    }
  };

  useEffect(() => {
    const fetchMcqData = async () => {
      try {
        const classId = localStorage.getItem("classId"); // Fetch classId from localStorage
        const res = await axios.get(
          `http://localhost:5100/api/exam/mcq-forms/${classId}`
        );
        console.log(res.data);
        setMcqData(res.data); // Store the fetched MCQ data in state
      } catch (error) {
        console.error("Error fetching MCQ data:", error);
        message.error("Failed to fetch MCQ data.");
      }
    };
    fetchMcqData();
  }, []);

  useEffect(() => {
    const fetchExamResults = async () => {
      if (!id) return;
      setLoadingResults(true);
      try {
        const res = await axios.get(`/exam/exam-results/${id}`);
        console.log(res.data.examResults);
        setExamResults(res.data.examResults); // Save fetched results into state
      } catch (error) {
        console.error("Error fetching exam results:", error);
        message.error("Failed to fetch exam results.");
      } finally {
        setLoadingResults(false);
      }
    };

    fetchExamResults();
  }, [id]);

  const resultsColumns = [
    {
      title: "Email ID",
      dataIndex: "emailId",
      key: "emailId",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("YYYY-MM-DD"),
    },
  ];

  const generatePdfThumbnail = async (pdfData) => {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.2 }); // Adjust scale for thumbnail size
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL(); // Return base64 image data
  };

  const handleAddWorkClick = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedNote(null); // Reset selected note when modal is closed
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setIsModalVisible(true); // Open the modal when a note is clicked
  };

  const onFinish = async (values) => {
    try {
      const res = await axios.post(`/note/addnotes/${userData._id}/${id}`, {
        ...values,
        pdf,
        classId: classData._id,
      });
      message.success("Note added successfully!");
      fetchNotes(); // Refresh the notes list
      setIsModalVisible(false);
      return res.data;
    } catch (error) {
      console.error("There was an error uploading the note!", error);
      message.error("Failed to add note.");
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileUpload = async (e) => {
    try {
      const file = e.fileList[0].originFileObj;
      const base64 = await convertToBase64(file);
      setPdf({ ...pdf, document: base64 });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      message.error("Failed to upload file.");
    }
  };

  const props = {
    name: "file",
    accept: ".pdf",
    beforeUpload(file) {
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error("File must be smaller than 50MB!");
      }
      return isLt50M;
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-green-100">
        <Spin size="large" />
      </div>
    );
  }
  const modalWidth = selectedNote ? 900 : 600;

  if (error) {
    return (
      <div className="p-8 bg-green-200 text-gray-800">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }
  const handleDelete = async (noteId) => {
    console.log(noteId);
    try {
      const res = await axios.delete(`note/delete/${noteId}`);
      message.success(res.data.message);
      fetchNotes(); // Refresh the notes list after deletion
    } catch (error) {
      console.error("Error deleting note:", error);
      message.error("Failed to delete note.");
    }
  };
  console.log(classData.members);

  return (
    <div className="grid bg-green-50">
      <div className="p-8  mx-auto">
        <motion.div
          className="shadow-lg rounded-lg overflow-hidden bg-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            cover={
              <img
                alt={classData.name}
                src={
                  classData.image ||
                  "https://img.freepik.com/free-vector/empty-classroom-interior-school-college-class_107791-631.jpg?t=st=1733319884~exp=1733323484~hmac=c7d9a4e07583facab386dcdf97ff19fccfcc39dd97afed0f4f93c829af1e6c24&w=1380"
                }
                className="object-cover w-full h-64 rounded-lg  shadow-md"
              />
            }
            className="shadow-lg rounded-lg overflow-hidden"
          >
            <Meta
              title={classData.name}
              description={`Class Code: ${classData.code}`}
            />
            <div className="mt-4">
              <p className="text-gray-700 text-lg">
                <strong>Description:</strong>{" "}
                {classData.description || "No description available"}
              </p>
              <Button
                type="primary"
                className="mt-4 bg-green-500 hover:bg-green-600"
                onClick={handleAddWorkClick}
              >
                Add Work
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Members</h2>
          <ul className="divide-y divide-green-200 border border-green-300 rounded-lg bg-slate-50 shadow">
            {classData.members.map((member, index) => (
              <li
                key={index}
                className="flex items-center p-4 hover:bg-green-100 transition-colors"
              >
                {/* Member Avatar */}
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full border-2 border-green-300"
                    src={
                      member.avatar ||
                      "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1732955003~exp=1732958603~hmac=4f953333ae9e5afb60ee1c9ce09e86e2693a544558f9772c207e627c1d78684e&w=740"
                    }
                    alt={member.name || "User Avatar"}
                  />
                </div>

                {/* Member Details */}
                <div className="flex-grow ml-4">
                  <p className="text-sm font-semibold text-green-800">
                    {member.emailId}
                  </p>
                  <p className="text-sm text-green-600 italic">{member.role}</p>
                </div>

                {/* Remove Button */}
                {userData.role !== "student" && ( // Only show for non-students
                  <button
                    onClick={() => handleRemoveMember(id, member.emailId)} // Replace with your actual remove handler
                    className="ml-4 text-green-700 hover:text-red-500 transition-colors"
                    aria-label="Remove Member"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </motion.div>

      
        {userData.role === "teacher" && (
          <motion.div
            className="mt-8 bg-white p-6 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 pt-5  border-gray-300 mb-4">
          Exam Form Details
        </h2>
            {mcqData ? (
              <>
              <ul className="space-y-4">
  {mcqData.map((mcq, index) => (
    <li
      key={index}
      className="p-4 border border-green-300 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-green-50"
    >
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-green-700">
          <span className="text-green-600">Exam Form ID:</span>{" "}
          {mcq.form_id}
        </h4>
        <button
          className="bg-transparent text-green-500 p-2 rounded-md hover:text-green-600 hover:bg-green-100 transition-colors"
          onClick={() => {
            navigator.clipboard.writeText(mcq.form_id);
            alert("Form ID copied to clipboard!");
          }}
        >
          <ClipboardIcon className="h-6 w-6" />
        </button>
      </div>
      <p className="text-green-600 mt-1">
        <span className="font-medium text-green-700">Description:</span>{" "}
        {mcq.description}
      </p>
    </li>
  ))}
</ul>

              </>
            ) : (
              <p className="text-center text-gray-500">Loading...</p>
            )}
          </motion.div>
        )}

        {userData.role === "teacher" && (
          <div className="">
            <h2 className="text-2xl font-bold text-gray-800 pt-5  border-gray-300 mb-4">
              Exam Results
            </h2>
            {loadingResults ? (
              <div className="flex justify-center">
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ) : examResults.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Table
                  dataSource={examResults}
                  columns={resultsColumns}
                  rowKey="_id"
                  bordered
                  className="shadow rounded-md"
                />
              </motion.div>
            ) : (
              <p className="text-gray-500">No exam results available.</p>
            )}
          </div>
        )}

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notesData?.map((note) => (
              <motion.div
                key={note._id}
                className="shadow-md rounded-lg overflow-hidden bg-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  hoverable
                  className="shadow-md rounded-lg overflow-hidden"
                  onClick={() => handleNoteClick(note)}
                >
                  <div className="relative">
                    {note.thumbnail ? (
                      <img
                        src="https://img.freepik.com/premium-vector/google-sheets-logo_578229-309.jpg?ga=GA1.1.1116161684.1732954973&semt=ais_hybrid"
                        alt="PDF Thumbnail"
                        className="object-cover w-full h-40 rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-40 bg-white flex items-center justify-center rounded-t-lg">
                        <span>
                          <img
                            src="/src/assets/images.png"
                            alt=""
                            className="w-36"
                          />
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <p>
                        <strong>Created At:</strong>{" "}
                        {dayjs(note?.createdAt).format("YYYY-MM-DD")}
                      </p>
                      <h3 className="text-lg font-bold text-gray-800">
                        Topic:{" "}
                        <span className=" font-normal"> {note.topic}</span>
                      </h3>
                      <p className="text-gray-600 font-bold mt-2">
                        Description:
                        <span className=" font-normal">{note.description}</span>
                      </p>
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering onClick for the card
                          handleDelete(note._id); // Call the delete function with the note ID
                        }}
                        className="mt-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Modal
          title={selectedNote ? "" : "Note Details"}
          visible={isModalVisible && selectedNote !== null}
          onCancel={handleModalCancel}
          footer={null}
          width={modalWidth}
        >
          {selectedNote && (
            <div>
              <p>
                <strong>Created At:</strong>{" "}
                {dayjs(selectedNote.createdAt).format("YYYY-MM-DD")}
              </p>
              <h3 className="text-lg font-bold text-gray-800">
                Topic:{" "}
                <span className=" font-normal"> {selectedNote.topic}</span>
              </h3>
              <p className="text-gray-600 mt-2">
                Description:
                <span className=" font-normal">{selectedNote.description}</span>
              </p>
              {selectedNote.document && (
                <embed
                  src={`data:application/pdf;base64,${
                    selectedNote.document.split(",")[1]
                  }`}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                  className="mt-4"
                />
              )}
            </div>
          )}
        </Modal>

        <Modal
          title="Add Note"
          visible={isModalVisible && selectedNote === null}
          onCancel={handleModalCancel}
          footer={null}
        >
          <Form onFinish={onFinish}>
            <Form.Item
              name="topic"
              label="Topic"
              rules={[{ required: true, message: "Please input the topic!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="document"
              label="Upload Document"
              valuePropName="fileList"
              getValueFromEvent={({ fileList }) => fileList} // Ensure this returns the fileList correctly
            >
              <Upload
                {...props}
                onChange={handleFileUpload} // Call your upload handler here
              >
                <Button icon={<UploadOutlined />}>Upload PDF</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-green-500 hover:bg-green-600"
              >
                Add Note
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Class;
