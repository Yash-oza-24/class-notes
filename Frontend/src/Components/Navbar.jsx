import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Modal } from "antd";
import CreateClass from "../Models/Creatclass";
import Sidebar from "../Components/Sidebar";
import UploadMembersModal from "../Models/UploadMembersModal";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [classId, setClassId] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch user data and classId from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("USER");
    const storedClassId = localStorage.getItem("classId");

    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user data in localStorage:", error);
      }
    }

    if (storedClassId) {
      setClassId(storedClassId);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("USER");
    localStorage.removeItem("TOKEN");
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const openCreateClassModal = () => {
    setModalOpen(true);
    setDropdownOpen(false);
  };

  const closeCreateClassModal = () => {
    setModalOpen(false);
  };

  const openUploadMembersModal = () => {
    setUploadModalOpen(true);
    setDropdownOpen(false);
  };

  const closeUploadMembersModal = () => {
    setUploadModalOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const isClassPage = location.pathname.includes("class/");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <nav className="bg-white shadow-md  px-4 py-2  sm:px-6 sm:py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/home" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-500">
                ClassNotes
              </span>
            </Link>
          </div>

          <div className="relative flex items-center space-x-4">
            <button
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={toggleDropdown}
              aria-expanded={dropdownOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
            </button>

            <div
              ref={dropdownRef}
              className={`absolute top-full z-10 right-0 mt-2 w-48 bg-white rounded-md shadow-lg transform transition-all duration-200 ease-in-out origin-top-right ${
                dropdownOpen
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0 pointer-events-none"
              }`} 
            >
              <div className="py-2 z-auto">
                {userData.role === "teacher" ? (
                  <>
                    <button
                      onClick={openCreateClassModal}
                      className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                    >
                      Create Class
                    </button>
                    {isClassPage && (
                      <>
                        <button
                          onClick={openUploadMembersModal}
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                        >
                          Add Members
                        </button>
                        <button
                          onClick={() => navigate("/create-exam")}
                          className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                        >
                          Create Exam
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/student")}
                    className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  >
                    Start Exam
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <Modal
        title="Create a New Class"
        visible={modalOpen}
        onCancel={closeCreateClassModal}
        footer={null}
        destroyOnClose
      >
        <CreateClass onClose={closeCreateClassModal} />
      </Modal>

      <UploadMembersModal
        visible={uploadModalOpen}
        onClose={closeUploadMembersModal}
        classId={classId}
      />
    </>
  );
};

export default Navbar;
