import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

const app = express();

// ✅ Serve static uploads (for images)
app.use("/uploads", express.static("uploads"));

// ✅ CORS configuration — allow local + production
const whitelist = [
  "http://localhost:5173",
  "https://rangmanch-site.netlify.app",
  "https://e91197d9fa22.ngrok-free.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman)
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors()); // preflight support

app.use(express.json());
app.use(morgan("dev"));

// ✅ Mount routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
