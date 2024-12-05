import React, { useState } from "react";
import LoginPage from "../../Components/Login";
import ForgotPasswordPage from "../../Components/Forgotpassword";

const Auth = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const toggleForm = () => {
    setIsForgotPassword(!isForgotPassword);
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-100">
      {isForgotPassword ? (
        <ForgotPasswordPage onSwitch={toggleForm} />
      ) : (
        <LoginPage onSwitch={toggleForm} />
      )}
    </div>
  );
};

export default Auth;
