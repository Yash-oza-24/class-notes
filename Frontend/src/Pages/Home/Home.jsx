import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateClass from "../../Models/Creatclass";
import { fetchClasses, deleteClass, getUserClasses } from "../Auth/Auth-api"; // Import getUserClasses
import { Card, Spin, Alert, Modal, Button } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Meta } = Card;

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("USER");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (userData) {
          if (userData.role === "student") {
            // Fetch classes for students
            const studentClasses = await getUserClasses(userData.emailId);
            setClasses(studentClasses);
          } else {
            // Fetch classes for non-student roles
            const classesData = await fetchClasses(userData._id);
            setClasses(classesData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  const handleCloseOptionsModal = () => {
    setIsOptionsModalVisible(false);
    setSelectedClassId(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  const handleFetchClasses = async () => {
    if (userData) {
      try {
        const classesData =
          userData.role === "student"
            ? await getUserClasses(userData._id)
            : await fetchClasses(userData._id);
        setClasses(classesData);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCardClick = (classId) => {
    navigate(`/class/${classId}`);
  };

  const handleDeleteClass = async () => {
    if (selectedClassId) {
      try {
        await deleteClass(selectedClassId);
        setClasses(classes.filter((cls) => cls._id !== selectedClassId));
        handleCloseOptionsModal();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEditClass = () => {
    if (selectedClassId) {
      navigate(`/edit-class/${selectedClassId}`);
      handleCloseOptionsModal();
    }
  };

  const showOptionsModal = (classId) => {
    setSelectedClassId(classId);
    setIsOptionsModalVisible(true);
  };

  const handleClassCreated = (newClass) => {
    setClasses([...classes, newClass]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto overflow-hidden ">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          Welcome,{" "}
          {userData?.role === "student" ? userData.emailId : userData.username}!
        </h1>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {classes.length > 0 ? (
            classes.map((cls) => (
              <motion.div
                key={cls._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  hoverable
                  cover={
                    <img
                      alt={cls.name}
                      src={
                        cls.image ||
                        "https://img.freepik.com/free-vector/empty-classroom-interior-school-college-class_107791-631.jpg?t=st=1733319884~exp=1733323484~hmac=c7d9a4e07583facab386dcdf97ff19fccfcc39dd97afed0f4f93c829af1e6c24&w=1380"
                      }
                      className="object-cover w-full h-40 cursor-pointer"
                      onClick={() => handleCardClick(cls._id)}
                    />
                  }
                  className="rounded-none"
                >
                  <Meta
                    title={cls.name}
                    description={`Class Code: ${cls.code}`}
                    onClick={() => handleCardClick(cls._id)}
                    className="cursor-pointer"
                  />
                  {userData.role == "teacher" ? (
                    <EllipsisOutlined
                      onClick={() => showOptionsModal(cls._id)}
                      className="absolute top-2 right-2 text-xl rounded-2xl p-1 bg-slate-200 cursor-pointer"
                    />
                  ) : null}
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="col-span-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white rounded-lg shadow-lg">
                <Meta
                  title="No classes found"
                  description="You have not created or joined any classes yet."
                />
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Options Modal */}
      <Modal
        title="Options"
        visible={isOptionsModalVisible}
        onCancel={handleCloseOptionsModal}
        footer={[
          <Button key="delete" type="primary  " onClick={handleDeleteClass}>
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this class?</p>
      </Modal>

      {/* Create Class Modal */}
      <Modal
        title="Create a New Class"
        visible={isCreateModalVisible}
        onCancel={handleCloseCreateModal}
        footer={null}
      >
        <CreateClass
          onClose={handleCloseCreateModal}
          onClassCreated={handleClassCreated}
        />
      </Modal>
    </>
  );
};

export default Home;
