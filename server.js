// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const path  = require("path");
// const connectDB = require("./config/db");
// const app = express();

// const authRoutes = require("./routes/authRoutes");
// const resumeRoutes = require("./routes/resumeRoutes")

// // Middleware to handle CORS
// app.use(
//     cors({
//         origin: process.env.CLIENT_URL || "*",
//         methods: ["GET", "POST", "PUT", "DELETE"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );

// // Connect Database
// connectDB();

// // Middleware 
// app.use(express.json());

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/resume", resumeRoutes);

// // Serve uploads folder
// app.use(
//     "/uploads",
//     express.static(path.join(__dirname, "uploads"), {
//         setHeaders: (res, path) => {
//             res.set("Access-Control-Allow-Origin", "http://localhost:5173");
//         },
//     })
// );

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Routes
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

// ✅ Connect to MongoDB Atlas
connectDB();

// ✅ Middleware
app.use(express.json());

// ✅ CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
