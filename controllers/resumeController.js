// const fs = require("fs");
// const path = require("node:path");
const Resume = require("../models/Resume");
const cloudinary = require("../config/cloudinary");

// @desc    Create a new resume
// @route   POST /api/resumes
// @access  Private
const creatResume = async (req, res) => {
    try {

        const { title } = req.body;

        // Default template
        const defaultResumeData = {
            profileInfo: {
                profileImg: null,
                previewUrl: "",
                fullName: "",
                designation: "",
                summary: "",
            },
            contactInfo: {
                email: "",
                phone: "",
                location: "",
                linkedin: "",
                github: "",
                website: "",
            },
            workExperience: [
                {
                    company: "",
                    role: "",
                    startDate: "",
                    endDate: "",
                    description: "", 
                },
            ],
            education: [
                {
                    degree: "",
                    institution: "",
                    startDate: "",
                    endDate: "",
                },
            ],
            skills: [
                {
                    name: "",
                    progress: 0,
                },
            ],
            projects: [
                {
                    title: "",
                    description: "",
                    github: "",
                    liveDemo: "",
                },
            ],
            certifications: [
                {
                    title: "",
                    issuer: "",
                    year: "",
                },
            ],
            languages: [
                {
                    name: "",
                    progress: 0,
                },
            ],
            interests: [""],
        };

        const newResume = await Resume.create({
            userId: req.user._id,
            title,
            ...defaultResumeData,
        });

        res.status(201).json(newResume);

    } catch (error) {
        res 
            .status(500)
            .json({ message: "Failed to create resume", error: error.message });
    }
};

// @desc    Get all resumes for logged-in user
// @route   GET /api/resumes
// @access  Private
const getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user._id }).sort({
            updatedAt: -1,
        });
        console.log(resumes)
        res.json(resumes);
    } catch (error) {
        res.status(500).json({ message: "Failed to get resumes", error: error.message });
    }
};

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        res.json(resume);
    } catch (error) {
        res.status(500).json({ message: "Failed to get resumes", error: error.message });
    }
};

// @desc    Update a resume
// @route   PUT /api/resumes/:id
// @access  Private
const updateResume = async (req, res) => {
    try {
        console.log('Donnée reçues:', JSON.stringify(req.body, null, 2));
        console.log('Contact reçues:', req.body.contactInfo);

        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found or unauthorized" });
        };

        // Merge updates from req.body into existting resume
        Object.assign(resume, req.body);

        // Save updated resume
        const savedResume = await resume.save();

        res.json(savedResume);
    } catch (error) {
        res.status(500).json({ message: "Failed to get resumes", error: error.message });
    }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private

// const deleteResume = async (req, res) => {
//     try {
//         const resume = await Resume.findOne({
//             _id: req.params.id,
//             userId: req.user._id,
//         });

//         if (!resume) {
//             return res.status(404).json({ message: "Resume not found or unauthorized" });
//         }

//         // Delete thumbnailLink and profilePreviewUrl images from uploads folder
//         const uploadsFolder = path.join(__dirname, '..', 'uploads');
//         const baseUrl = `${req.protocol}://${req.get("host")}`;

//         if (resume.thumbnailLink) {
//             const oldThumbnail = path.join(uploadsFolder, path.basename(resume.thumbnailLink));
//             if (fs.existsSync(oldThumbnail)) fs.unlinkSync(oldThumbnail);
//         }

//         if (resume.profileInfo?.profilePreviwUrl){
//             const oldProfile = path.join(uploadsFolder, path.basename(resume.profileInfo.profilePreviwUrl));
//             if (fs.existsSync(oldProfile)) fs.unlink(oldProfile);
//         }

//         const deleted = await Resume.findOneAndDelete({
//             _id: req.params.id,
//             userId: req.user._id,
//         });

//         if (!deleted) {
//             return res.status(404).json({ message: "Resume not found or unauthorized" });
//         }

//         res.json({ message: "Resume deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Failed to get resumes", error: error.message });
//     }
// };

const deleteResume = async (req, res) => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });
  
      if (!resume) {
        return res.status(404).json({ message: "Resume not found or unauthorized" });
      }
  
      // Delete images from Cloudinary
      if (resume.thumbnailLink) {
        const publicId = extractPublicId(resume.thumbnailLink);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
  
      if (resume.profileInfo?.profilePreviewUrl) {
        const publicId = extractPublicId(resume.profileInfo.profilePreviewUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
  
      // Delete resume document
      await Resume.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
      });
  
      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resume", error: error.message });
    }
  };

//   Helper: Extract Cloudinary public_id from URL
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

module.exports = {
    creatResume,
    getUserResumes,
    getResumeById,
    updateResume,
    deleteResume,
};