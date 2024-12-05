const express = require("express");
const router = express.Router();
const notescontroller = require("../Controllers/NotesController");

router.post("/addnotes/:userId/:classId", notescontroller.addNotes);
router.get("/getnotes/:userId/:classId", notescontroller.getNotes);
router.put("/updatenotes/:noteId", notescontroller.getNotes);
router.delete("/delete/:noteId", notescontroller.deleteNote);
router.get("/:classId", notescontroller.fetchNotesByClassId);

module.exports = router;
