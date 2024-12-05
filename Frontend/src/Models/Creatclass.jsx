/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { base_url, fetchClasses } from "../Pages/Auth/Auth-api";
import { Form, Input, Button, message } from "antd";

const CreateClass = ({ onClose }) => {
  const [userData, setUserData] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const storedUser = localStorage.getItem("USER");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const onFinish = async (values) => {
    try {
      const response = await axios.post(`${base_url}/class/create`, {
        ...values,
        emailId: userData?.emailId,
      });
      if (response.status === 201) {
        form.resetFields();
        message.success(response.data.message);
        fetchClasses(userData?._id);
        onClose();
      }
    } catch (err) {
      message.error("Failed to create class. Please try again.", err);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Class Name"
        name="name"
        rules={[{ required: true, message: "Please enter the class name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please enter the description" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        label="Subject"
        name="subject"
        rules={[{ required: true, message: "Please enter the subject" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create Class
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateClass;
