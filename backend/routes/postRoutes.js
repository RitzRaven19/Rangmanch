import express from "express";
import multer from "multer";
import path from "path";
import pool from "../config/db.js";
import fs from "fs";

const post_router = express.Router();

// ✅ Ensure uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Multer configuration (store files locally)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ POST route to create a post
post_router.post("/", upload.single("file"), async (req, res) => {
  console.log("📦 Received POST request:", req.body);
  console.log("📸 File details:", req.file);

  try {
    const { title, description, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Insert into DB
    const sql = `
      INSERT INTO posts (user_id, title, text_content, image_url, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.execute(sql, [
      user_id,
      title,
      description,
      imageUrl,
    ]);

    const newPost = {
      post_id: result.insertId,
      user_id,
      title,
      text_content: description,
      image_url: imageUrl,
      created_at: new Date(),
    };

    console.log("✅ Post created:", newPost);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

export default post_router;
