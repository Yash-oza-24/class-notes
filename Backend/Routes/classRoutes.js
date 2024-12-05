const express = require("express");
const router = express.Router();
const classController = require("../Controllers/classController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/create", classController.createClass);

router.post("/add-peoples", classController.addPeoples);

router.post("/join-class", classController.joinClass);

router.get("/:userId/getallclasses", classController.getAllClasses);

router.get("/:id", classController.getClassDetails);

router.get("/code/:code", classController.getClassDetails);

router.put("/:classId/updateclass", classController.updateClass);

router.delete("/:classId/remove-people", classController.removePeople);

router.delete("/:classId", classController.deleteClass);

router.post(
  "/upload-members",
  upload.single("file"),
  classController.uploadClassMembers
);

router.get("/user-classes/:emailId", classController.getUserClasses);

module.exports = router;
