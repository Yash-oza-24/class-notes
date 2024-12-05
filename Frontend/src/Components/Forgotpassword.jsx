import React, { useState } from "react";
import { forgotPassword } from "../Pages/Auth/Auth-api";
import toast from "react-hot-toast";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";

const ForgotPasswordPage = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const result = await forgotPassword(email, password, confirmPassword);
      toast.success(result.message);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      });
      onSwitch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-96 p-8 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Forgot Password
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 mb-2 font-medium"
          >
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div className="mb-4 relative">
          <label
            htmlFor="password"
            className="block text-gray-700 mb-2 font-medium"
          >
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-green-500 focus:outline-none"
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        <div className="mb-6 relative">
          <label
            htmlFor="confirmPassword"
            className="block text-gray-700 mb-2 font-medium"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-green-500 focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
        >
          Reset Password
        </button>
        <p className="mt-4 text-center text-gray-700">
          Remembered your password?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-green-500 hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
