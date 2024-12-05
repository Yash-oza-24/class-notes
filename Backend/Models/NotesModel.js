const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema({
    description: {
        type: String,
    },
    topic: {
        type: String,
    },
    document: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class', // Assuming you have a Class model
    }
}, { timestamps: true });

const Notes = mongoose.model('Notes', notesSchema);

module.exports = Notes;
