import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

console.log(userRoutes);
console.log(postRoutes);

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Allowed origins for CORS
const whitelist = [
  "http://localhost:5173",                   // Local dev
  "https://rangmanch-site.netlify.app",     // Netlify frontend
  "https://e91197d9fa22.ngrok-free.app"    // ngrok HTTPS URL (update if URL changes)
];

app.use(
  cors({
    origin: (origin, callback) => {
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

// Mount routes (use relative paths only)
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
