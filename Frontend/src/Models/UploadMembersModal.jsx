import React, { useState } from "react";
import { Modal, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";
import {fetchClassById} from "../Pages/Auth/Auth-api"
import { useParams } from "react-router-dom";
axios.defaults.baseURL = "http://localhost:5100/api";

const { Dragger } = Upload;

const UploadMembersModal = ({ visible, onClose, classId }) => {
  const { id } = useParams();
  const [fileList, setFileList] = useState([]);

  const handleUpload = async () => {
    if (!fileList.length) {
      message.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0]);
    formData.append("classId", classId); 
    console.log("classId", classId); 

    try {
      const response = await axios.post(
        "class/upload-members",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        message.success("Class members uploaded successfully");
        
        // Reset the fileList and close the modal
        setFileList([]);
        onClose();
        fetchClassById(id)
      }
    } catch (error) {
      console.error("Error uploading members:", error);
      message.error("Error uploading class members");
    }
  };

  const draggerProps = {
    name: "file",
    multiple: false,
    accept: ".xlsx, .xls, .csv", 
    onRemove: (file) => {
      setFileList([]); // Remove file from the file list
    },
    beforeUpload: (file) => {
      setFileList([file]); // Set the selected file
      return false;
    },
    fileList,
  };

  return (
    <Modal
      title="Upload Class Members"
      visible={visible}
      onCancel={onClose}
      onOk={handleUpload}
      okText="Upload"
      cancelText="Cancel"
    >
      <Dragger {...draggerProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single upload of Excel (.xlsx, .xls) or CSV files.
        </p>
      </Dragger>
    </Modal>
  );
};

export default UploadMembersModal;
