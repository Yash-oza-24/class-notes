import axios from "axios";

export const base_url = "http://localhost:5100/api";

export const login = async (emailId, mobileNo, password) => {
  try {
    const res = await axios.post(`${base_url}/user/login`, {
      emailId: emailId,
      mobileNo,
      password,
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const registerUser = async (username, email, mobileNo, password) => {
  try {
    const response = await axios.post(`${base_url}/user/register`, {
      username,
      emailId: email,
      mobileNo,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

export const fetchClasses = async (userId) => {
  try {
    const response = await axios.get(
      `${base_url}/class/${userId}/getallclasses`
    );
    return response.data.classes;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch classes");
  }
};

export const fetchClassById = async (classId) => {
  try {
    const response = await axios.get(`${base_url}/class/${classId}`);
    return response.data.class;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch class");
  }
};

export const deleteClass = async (id) => {
  try {
    console.log(id);
    const response = await axios.delete(`${base_url}/class/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error deleting class");
  }
};

export const getUserClasses = async (emailId) => {
  try {
    const response = await axios.get(
      `${base_url}/class/user-classes/${emailId}`
    );
    return response.data.classes; // Assuming response contains classes in `data.classes`
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch user classes"
    );
  }
};

// New forgotPassword function
export const forgotPassword = async (emailId, password, confirmPassword) => {
  try {
    const response = await axios.post(`${base_url}/user/forgot-password`, {
      emailId,
      password,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to reset password"
    );
  }
};
