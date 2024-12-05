const Class = require("../Models/classModel");
const User = require("../Models/userModel");
const crypto = require("crypto");
const path = require("path");
const xlsx = require("xlsx");
const bcrypt = require("bcrypt");

const generateCode = (length = 8) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charactersLength;
    result += characters[randomIndex];
  }
  return result;
};

const createClass = async (req, res) => {
  try {
    const { name, description, emailId, subject } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let code;
    let uniqueCode = false;

    while (!uniqueCode) {
      code = generateCode();
      const existingClass = await Class.findOne({ code });
      if (!existingClass) {
        uniqueCode = true;
      }
    }

    // Default role for the creator is 'teacher' with default password '1000'
    const newClass = new Class({
      name,
      description,
      code,
      members: [{ emailId, role: "teacher", password: "1000" }], // Default password
      createdBy: user._id,
      subject,
    });

    await newClass.save();
    res
      .status(201)
      .json({ message: "Class created successfully", class: newClass });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const addPeoples = async (req, res) => {
  try {
    const { classId, emailId, role } = req.body;
    const classUpdate = await Class.findById(classId);

    if (!classUpdate) {
      return res.status(404).json({ message: "Class not found" });
    }

    const isMember = classUpdate.members.some(
      (member) => member.emailId === emailId
    );
    if (isMember) {
      return res
        .status(400)
        .json({ message: "User already a member of this class" });
    }

    // Add new member with default password '1000'
    classUpdate.members.push({
      emailId,
      role: role || "student",
      password: "1000",
    });
    await classUpdate.save();

    res
      .status(200)
      .json({ message: "People added successfully", class: classUpdate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const joinClass = async (req, res) => {
  try {
    const { code, emailId } = req.body;
    const classJoin = await Class.findOne({ code });
    if (!classJoin) {
      return res.status(404).json({ message: "Class not found" });
    }
    const isMember = classJoin.members.some(
      (member) => member.emailId === emailId
    );
    if (isMember) {
      return res
        .status(400)
        .json({ message: "Already a member of this class" });
    }

    // Add new student with default password '1000'
    classJoin.members.push({ emailId, role: "student", password: "1000" });
    await classJoin.save();

    res
      .status(200)
      .json({ message: "Joined class successfully", class: classJoin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getClassDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "No ID provided" });
    }

    const classDetails = await Class.findById(id);

    if (!classDetails) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ class: classDetails });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllClasses = async (req, res) => {
  try {
    const { userId } = req.params;
    const classes = await Class.find({ createdBy: userId });
    if (classes.length === 0) {
      return res.status(404).json({ message: "No classes found" });
    }
    res.status(200).json({ classes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const updateData = req.body;

    const updatedClass = await Class.findByIdAndUpdate(classId, updateData, {
      new: true,
    });
    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res
      .status(200)
      .json({ message: "Class updated successfully", class: updatedClass });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const removePeople = async (req, res) => {
  try {
    const { classId } = req.params;
    const { emailId } = req.body;

    const classUpdate = await Class.findById(classId);

    if (!classUpdate) {
      return res.status(404).json({ message: "Class not found" });
    }
    classUpdate.members = classUpdate.members.filter(
      (member) => member.emailId !== emailId
    );
    await classUpdate.save();

    res
      .status(200)
      .json({ message: "People removed successfully", class: classUpdate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const classToDelete = await Class.findById(classId);

    if (!classToDelete) {
      return res.status(404).json({ message: "Class not found" });
    }

    await Class.findByIdAndDelete(classId);
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error in deleteClass:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Helper function to parse the uploaded Excel file
const parseExcelFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  let members = [];

  sheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    sheetData.slice(1).forEach((row) => {
      const userId = row[0];
      const password = row[1];

      if (userId && password) {
        members.push({
          emailId: userId, // Assuming userId is the email
          password: "1000", // Default password
          role: "student", // Set default role as 'student'
        });
      }
    });
  });

  return members;
};
const uploadClassMembers = async (req, res) => {
  try {
    const { classId } = req.body; // Extract classId from request body
    const file = req.file;

    // Check if a file was uploaded
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check if classId is provided
    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    // // Validate ObjectId format
    // if (!mongoose.Types.ObjectId.isValid(classId)) {
    //   return res.status(400).json({ message: "Invalid classId" });
    // }

    // Define the file path for the uploaded file
    const filePath = path.join(__dirname, "..", "uploads", file.filename);

    // Parse the Excel file to get the list of members
    const parsedMembers = parseExcelFile(filePath);

    if (!parsedMembers.length) {
      return res
        .status(400)
        .json({ message: "No valid data in the Excel file" });
    }

    // Find the class by the provided classId
    const classToUpdate = await Class.findById(classId);
    if (!classToUpdate) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Proceed with adding members as before
    const addedMembers = [];
    const newUsers = [];

    for (const member of parsedMembers) {
      const { emailId } = member;

      // Check if the user already exists
      let user = await User.findOne({ emailId });

      if (!user) {
        const newUser = new User({
          emailId,
          password: await bcrypt.hash("1000", 10),
          role: "student",
        });

        await newUser.save();
        newUsers.push(newUser.emailId);
      }

      // Check if user is already a member of the class
      const isMember = classToUpdate.members.some((m) => m.emailId === emailId);

      if (!isMember) {
        classToUpdate.members.push({
          emailId,
          password: "1000",
          role: "student",
        });

        addedMembers.push(emailId);
      }
    }

    await classToUpdate.save();

    res.status(200).json({
      message: "Class members uploaded successfully",
      addedMembers,
      newUsers,
    });
  } catch (error) {
    console.error("Error in uploadClassMembers:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
const getUserClasses = async (req, res) => {
  try {
    const { emailId } = req.params; // Extract the emailId from the request parameters
    // Validate if emailId is provided
    if (!emailId) {
      return res.status(400).json({ message: "Email ID is required" });
    }
    // Find classes where the user is a member
    const userClasses = await Class.find({ "members.emailId": emailId });
    if (!userClasses.length) {
      return res
        .status(404)
        .json({ message: "No classes found for this user" });
    }
    res.status(200).json({ classes: userClasses });
  } catch (error) {
    console.error("Error in getUserClasses:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createClass,
  addPeoples,
  joinClass,
  getClassDetails,
  getAllClasses,
  updateClass,
  removePeople,
  deleteClass,
  uploadClassMembers,
  getUserClasses,
};
