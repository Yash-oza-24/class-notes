import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Auth from "./Pages/Auth/Auth";
import Home from "./Pages/Home/Home";
import Class from "./Pages/Class/Class";
import Navbar from "./Components/Navbar";
import CreateExam from "./Pages/Class/Createexam";
import AddPeople from "./Pages/Class/AddPeople";
import StudentPage from "./Pages/Class/Studentexam";
import RegistrationCard from "./Components/Register"; // Your Register Component
import ForgotPasswordPage from "./Components/Forgotpassword";


const AppContent = () => {
  const location = useLocation();

  // Hide Navbar for login and registration pages
  const shouldShowNavbar = !["/", "/regi" , "/forgot-password"].includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/class/:id" element={<Class />} />
        <Route path="/create-exam" element={<CreateExam />} />
        <Route path="/add-members" element={<AddPeople />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/regi" element={<RegistrationCard />} /> 
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
      <Toaster />
    </Router>
  );
};

export default App;
