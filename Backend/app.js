require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./DB/Connect");
const bodyParser = require("body-parser");
const userRoutes = require("./Routes/userRoutes");
const classRoutes = require("./Routes/classRoutes");
const notesRoutes = require("./Routes/notesRoutes");
const examRoutes = require("./Routes/examRoutes");
const morgan = require("morgan");
  
const PORT = process.env.PORT || 5100;
app.use(bodyParser.json({ limit: "50mb" })); // Increase the limit to 50MB or as needed
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello, server Connected");
});
app.use("/api/user", userRoutes);
app.use("/api/class", classRoutes);
app.use("/api/note", notesRoutes);
app.use("/api/exam", examRoutes);
const start = async () => {
  try {
    await db;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

start();
