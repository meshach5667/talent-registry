const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");
const { apiLimiter } = require("./middleware/rateLimiter.middleware");

// Import route modules
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const experienceRoutes = require("./routes/experience.routes");
const projectRoutes = require("./routes/project.routes");
const verificationRoutes = require("./routes/verification.routes");
const organizationRoutes = require("./routes/organization.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const contactRoutes = require("./routes/contact.routes");
const notificationRoutes = require("./routes/notification.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Database Connection Middleware for Serverless & Standalone
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[Database Connection Error]:", err.message);
    // Continue so healthcheck or error middleware can handle response
    next();
  }
});

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Dynamic & Robust CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Allow configured origins or any Vercel deployment
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      /^https:\/\/.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }

    // Default to allowing origin in production if client URL is not strictly locked
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting on API
app.use("/api/", apiLimiter);

// Static Uploads Directory
const uploadsDir = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsDir));

// Healthcheck & Root status
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Talent Registry API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Talent Registry API",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profiles", profileRoutes);
app.use("/api/v1/experiences", experienceRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/verifications", verificationRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/feedbacks", feedbackRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);

// Centralized Error Handling
app.use(errorHandler);

// Standalone Server Listener (guard for serverless / Vercel execution)
if (require.main === module && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(
      `[Talent Registry Backend] Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
