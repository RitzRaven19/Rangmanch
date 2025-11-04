// scripts/tester.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import https from "https";

// CONFIG
const API_URL = "http://localhost:5000/api/posts";
const TOTAL_REQUESTS = 100;
const USER_ID = 4; // change if needed
const WIDTH = 800;
const HEIGHT = 600;

// HTTPS agent (if needed for some hosts)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Ensure temp dir exists
const tempDir = path.resolve("./temp_images");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Create a unique picsum URL (no external faker image helper required)
function picsumUrl(seed, width = WIDTH, height = HEIGHT) {
  // Picsum supports /seed/<seed>/<width>/<height>
  // Using seed produces repeatable unique images
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}

// Download an image stream to a temp file and return filepath
async function downloadImageToTemp(url, index) {
  const filePath = path.join(tempDir, `image_${index}_${Date.now()}.jpg`);
  const writer = fs.createWriteStream(filePath);

  const response = await axios.get(url, {
    responseType: "stream",
    httpsAgent,
    timeout: 30000,
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", (err) => {
      writer.close();
      reject(err);
    });
  });
}

async function sendFakePost(index) {
  try {
    // generate random seed and URL
    const seed = faker.string.uuid(); // unique seed
    const imageUrl = picsumUrl(seed, WIDTH, HEIGHT);

    // download to temp
    const imagePath = await downloadImageToTemp(imageUrl, index);

    const form = new FormData();
    form.append("title", faker.lorem.sentence({ min: 3, max: 8 }));
    form.append("description", faker.lorem.paragraph());
    form.append("user_id", USER_ID);
    form.append("file", fs.createReadStream(imagePath));

    const response = await axios.post(API_URL, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      httpsAgent,
      timeout: 60000,
    });

    console.log(`✅ [${index}] Created post:`, response.data.post_id ?? response.data.post_id ?? response.data.id ?? "OK");

    // cleanup
    fs.unlink(imagePath, (err) => {
      if (err) console.warn(`⚠️ Could not delete temp image ${imagePath}:`, err.message);
    });
  } catch (err) {
    console.error(`❌ [${index}] Failed:`, err.response?.data || err.message || err);
  }
}

async function main() {
  console.log(`🚀 Sending ${TOTAL_REQUESTS} random posts to ${API_URL} ...`);

  const BATCH_SIZE = 5; // tune concurrency here
  for (let i = 0; i < TOTAL_REQUESTS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_REQUESTS; j++) {
      batch.push(sendFakePost(i + j + 1));
    }
    await Promise.all(batch);
  }

  console.log("✅ Done seeding posts!");
}

main().catch((err) => {
  console.error("Script error:", err);
});
