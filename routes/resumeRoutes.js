const express = require("express");
const {
    creatResume,
    getUserResumes, 
    getResumeById,
    updateResume,
    deleteResume,
} = require("../controllers/resumeController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadResumeImages } = require("../controllers/uploadImages");

const router = express.Router();

router.post("/", protect, creatResume); // Create Resume
router.get("/", protect, getUserResumes); // Get Resume
router.get("/:id", protect, getResumeById); // Get Resume by ID
router.put("/:id", protect, updateResume); // Update Resume
router.put("/:id/upload-images", protect, uploadResumeImages); 

router.delete("/:id", protect, deleteResume); // Delete Resume

module.exports = router;