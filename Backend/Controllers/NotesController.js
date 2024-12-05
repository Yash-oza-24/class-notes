// const NotesModel = require("../Models/NotesModel");

// // Add Note
// const addNotes = async (req, res) => {
//   try {
//     const { userId, classId } = req.params;
//     const notesdata = new NotesModel({
//       description: req.body.description,
//       topic: req.body.topic,
//       document: req.body.pdf.document,
//       userId: userId,
//       classId: classId,
//     });
//     const notesresult = await notesdata.save();

//     return res.json({ success: 1, notesresult });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: 0, message: "Error adding note", error: error.message });
//   }
// };

// // Get Notes
// const getNotes = async (req, res) => {
//   try {
//     const { userId, classId } = req.params;
//     const getnotes = await NotesModel.find({
//       userId: userId,
//       classId: classId,
//     });
//     return res.json({ success: 1, getnotes });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({
//         success: 0,
//         message: "Error fetching notes",
//         error: error.message,
//       });
//   }
// };

// // Edit Note
// const editNote = async (req, res) => {
//   try {
//     const { noteId } = req.params;
//     const updates = req.body;

//     const updatedNote = await NotesModel.findByIdAndUpdate(noteId, updates, {
//       new: true,
//     });
//     if (!updatedNote) {
//       return res.status(404).json({ success: 0, message: "Note not found" });
//     }
//     return res.json({ success: 1, updatedNote });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({
//         success: 0,
//         message: "Error updating note",
//         error: error.message,
//       });
//   }
// };

// // Delete Note
// // const deleteNote = async (req, res) => {
// //     try {
// //         const { noteId } = req.params;
// //         console.log(noteId)
// //         const deletedNote = await NotesModel.findByIdAndDelete(noteId);
// //         if (!deletedNote) {
// //             return res.status(404).json({ success: 0, message: 'Note not found' });
// //         }

// //         return res.json({ success: 1, message: 'Note deleted successfully' });
// //     } catch (error) {
// //         console.error(error);
// //         return res.status(500).json({ success: 0, message: 'Error deleting note', error: error.message });
// //     }
// // };

// const deleteNote = async (req, res) => {
//   try {
//     const { noteId } = req.params;
//     const deletedNote = await NotesModel.findByIdAndDelete(noteId);
//     if (!deletedNote) {
//       return res.status(404).json({ success: 0, message: "Note not found" });
//     }
//     return res.json({ success: 1, message: "Note deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: 0, message: "Server error" });
//   }
// };

// module.exports = {
//   addNotes,
//   getNotes,
//   editNote,
//   deleteNote,
// };
const NotesModel = require("../Models/NotesModel");
const ClassModel = require("../Models/classModel"); // Assuming this is your Class model

// Add Note and push to the Class model
const addNotes = async (req, res) => {
  try {
    const { userId, classId } = req.params;

    // Create new note with the provided data
    const notesdata = new NotesModel({
      description: req.body.description,
      topic: req.body.topic,
      document: req.body.pdf.document, // Assuming you are uploading a PDF document
      userId: userId,
      classId: classId,
    });

    // Save the note to the database
    const notesresult = await notesdata.save();

    // Find the class by its ID
    const classToUpdate = await ClassModel.findById(classId);
    if (!classToUpdate) {
      return res.status(404).json({ success: 0, message: "Class not found" });
    }

    // Push the new note's ID to the notes array of the class
    classToUpdate.notes.push(notesresult._id);

    // Save the updated class document
    await classToUpdate.save();

    return res.json({ success: 1, notesresult, message: "Note added to class" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: 0, message: "Error adding note", error: error.message });
  }
};

// Get Notes
const getNotes = async (req, res) => {
  try {
    const { userId, classId } = req.params;
    // Fetch all notes for the specific class and user
    const getnotes = await NotesModel.find({
      userId: userId,
      classId: classId,
    });
    return res.json({ success: 1, getnotes });
  } catch (error) {
    console.error(error);  
    return res
      .status(500)
      .json({
        success: 0,
        message: "Error fetching notes",
        error: error.message,
      });
  }
};

const fetchNotesByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    console.log(classId)
    // Fetch all notes associated with the class ID
    const notes = await NotesModel.find({ classId });
    if (!notes.length) {
      return res.status(404).json({ success: 0, message: "No notes found for this class" });
    }

    return res.json({ success: 1, notes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: 0,
      message: "Error fetching notes by class ID",
      error: error.message,
    });
  }
};


// Edit Note
const editNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const updates = req.body;

    // Find the note by its ID and update it
    const updatedNote = await NotesModel.findByIdAndUpdate(noteId, updates, {
      new: true,
    });

    // Check if the note exists
    if (!updatedNote) {
      return res.status(404).json({ success: 0, message: "Note not found" });
    }

    return res.json({ success: 1, updatedNote });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: 0,
        message: "Error updating note",
        error: error.message,
      });
  }
};

// Delete Note
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    // Find and delete the note by its ID
    const deletedNote = await NotesModel.findByIdAndDelete(noteId);

    // Check if the note exists
    if (!deletedNote) {
      return res.status(404).json({ success: 0, message: "Note not found" });
    }

    // Find the class and remove the note's ID from the notes array
    const classToUpdate = await ClassModel.findOne({ notes: noteId });
    if (classToUpdate) {
      classToUpdate.notes.pull(noteId);
      await classToUpdate.save();
    }

    return res.json({ success: 1, message: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: 0, message: "Server error" });
  }
};

module.exports = {
  addNotes,
  getNotes,
  editNote,
  deleteNote,
  fetchNotesByClassId
};
