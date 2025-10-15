const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// Auth Routes
router.post("/register", registerUser); // Register User
router.post("/login", loginUser); // Login user
router.get("/profile", protect, getUserProfile); // Get User Profile

// router.post("/upload-image", upload.single("image"), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//     }
//     const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
//         req.file.filename}
//     `;
//     res.status(200).json({ imageUrl });
// });

// Upload/Update Profile Image
router.post("/upload-image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
  
      // Cloudinary URL
      const imageUrl = req.file.path;        // the actual URL of the uploaded image
      const publicId = req.file.filename;   // Cloudinary public_id for deletion or replacement
  
      // Optional: update user profile in DB
      // await User.findByIdAndUpdate(req.user._id, {
      //   profileImageUrl: imageUrl,
      //   profileImagePublicId: publicId
      // });
  
      res.status(200).json({ imageUrl, publicId });
    } catch (err) {
      console.error("Error uploading profile image:", err);
      res.status(500).json({ message: "Failed to upload image", error: err.message });
    }
  });
  

module.exports = router;

