/* eslint-disable react/prop-types */
import { useState } from "react";
import { login } from "../Pages/Auth/Auth-api"; 
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";

const LoginPage = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    email: "",
    mobileNo: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { email, mobileNo, password } = formData;
      const result = await login(email, mobileNo, password);
      console.log(result);
      toast.success(result.message);
      console.log("Login Data Submitted:", result.user);
      setFormData({
        email: "",
        mobileNo: "",
        password: "",
      });
      localStorage.setItem("USER", JSON.stringify(result.user));
      localStorage.setItem("TOKEN", result.token);
      navigate("/home");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-96 p-8 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div className="mb-6 relative">
          <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-10 right-0  transform -translate-x-1/2 cursor-pointer"
          >
            {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-600" />
                )}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
        >
          Login
        </button>
        <p className="mt-4 text-center text-gray-700">
          If you forgot your password,{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-green-500 hover:underline"
          >
            Click Here
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
