const express = require("express");
const { verifyToken } = require("../controllers/authController");
const {
    encryptNotes,
    decryptedNotes,
    updateNoteStatus,
    getNoteStatistics,
    deleteNote
} = require("../controllers/notesController");

const router = express.Router();

router.post("/notes", verifyToken, encryptNotes);
router.post("/notes/list", verifyToken, decryptedNotes);
router.put("/notes/:id/status", verifyToken, updateNoteStatus); 
router.get("/notes/statistics", verifyToken, getNoteStatistics);
router.delete("/notes/:id", verifyToken, deleteNote);

module.exports = router;