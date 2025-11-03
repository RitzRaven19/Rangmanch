import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Simple test route
export const testAPI = async (req, res) => {
  const { body_message } = req.body;

  try {
    res.status(201).json({ message: body_message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Register new user (local DB)
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if email already exists
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0)
      return res.status(400).json({ message: "Email already in use" });

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert into local MySQL
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hash]
    );

    res.status(201).json({
      id: result.insertId,
      username,
      email,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Login user (local auth)
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username exists
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0)
      return res.status(400).json({ message: "Username not found" });

    const user = rows[0];

    // Compare password with hash
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    // Sign token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};
