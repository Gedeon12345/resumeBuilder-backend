// const fs = require("fs");
// const path = require("path");
// const Resume = require("../models/Resume");
// const upload = require("../middlewares/uploadMiddleware");

// const uploadResumeImages = async (req, res) => {
//     try {
//         upload.fields([{ name: 'thumbnail' }, { name: 'profileImage' }])(req, res, async (err) => {
//             if (err) {
//                 return res.status(400).json({ message: "File upload failed", error: err.message });
//             }

//             const resumeId = req.params.id;
//             const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });

//             if (!resume) {
//                 return res.status(404).json({ message: "Resume not found or unauthorized" });
//             }

//             const uploadsFolder = path.join(__dirname, '..', 'uploads');
//             const baseUrl = `${req.protocol}://${req.get("host")}`;

//             const newThumbnail = req.files.thumbnail?.[0];
//             const newProfileImage = req.files.profileImage?.[0];

//             // If new thumbnail uploaded, delete old one
//             // If (newThumbnail && resume.thumbnal) {
//             if (newThumbnail) {
//                 if(resume.thumbnailLink){
//                     const oldThumbnail = path.join(uploadsFolder, path.basename(resume.thumbnailLink));
//                     if (fs.existsSync(oldThumbnail)) fs.unlinkSync(oldThumbnail);
//                 }
//                 resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`;
//             }

//             // If new profile image uploaded, delete old one
//             // if (newProfileImage && resume.profileInfo?.profilePreviewUrl) {
//             if (newProfileImage) {
//                 if (resume.profileInfo?.profilePreviewUrl) {
//                     const oldProfile = path.join(uploadsFolder, path.basename(resume.profileInfo.profilePreviewUrl));
//                     if (fs.existsSync(oldProfile)) fs.unlinkSync(oldProfile);
//                 }
//                 resume.profileInfo.profilePreviewUrl = `${baseUrl}/uploads/${newProfileImage.filename}`;
//             }

//             await resume.save();

//             res.status(200).json({
//                 message: "Image uploaded successfully",
//                 thumbnailLink: resume.thumbnailLink,
//                 profilePreviewUrl: resume.profileInfo.profilePreviewUrl,
//             });
//         });
//     } catch (err) {
//         console.error("Error uploading image:", err);
//         res.status(500).json({ message: "Failed to upload image", error: err.message });
//     }
// };

// module.exports = { uploadResumeImages };


const Resume = require("../models/Resume");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "resume_builder_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

const upload = multer({ storage });

// Wrap Multer in a promise for async/await
const uploadMiddleware = (req, res) =>
  new Promise((resolve, reject) => {
    upload.fields([{ name: "thumbnail" }, { name: "profileImage" }])(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const uploadResumeImages = async (req, res) => {
  try {
    await uploadMiddleware(req, res);

    const resumeId = req.params.id;
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) return res.status(404).json({ message: "Resume not found or unauthorized" });

    const newThumbnail = req.files.thumbnail?.[0];
    const newProfileImage = req.files.profileImage?.[0];

    // Replace old thumbnail
    if (newThumbnail) {
      if (resume.thumbnailLink) {
        const publicId = extractPublicId(resume.thumbnailLink);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      resume.thumbnailLink = newThumbnail.path;
    }

    // Replace old profile image
    if (newProfileImage) {
      if (resume.profileInfo?.profilePreviewUrl) {
        const publicId = extractPublicId(resume.profileInfo.profilePreviewUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      resume.profileInfo.profilePreviewUrl = newProfileImage.path;
    }

    await resume.save();

    res.status(200).json({
      message: "Images uploaded successfully",
      thumbnailLink: resume.thumbnailLink,
      profilePreviewUrl: resume.profileInfo.profilePreviewUrl,
    });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ message: "Failed to upload image", error: err.message });
  }
};

// Extract Cloudinary public_id from URL
function extractPublicId(url) {
  try {
    const parts = url.split("/");
    const filename = parts.pop().split(".")[0];
    const folder = parts.slice(parts.indexOf("upload") + 1, -1).join("/");
    return folder ? `${folder}/${filename}` : filename;
  } catch {
    return null;
  }
}

module.exports = { uploadResumeImages };
