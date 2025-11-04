import axios from "axios";
import { faker } from "@faker-js/faker";

// ✅ Configuration
const BASE_URL = "http://localhost:5000/api/users/register";
const TOTAL_USERS = 100;

// ✅ Helper: Create one fake user
async function createUser(index) {
  const username = faker.internet.username();
  const email = faker.internet.email();
  const password = faker.internet.password({ length: 10 });

  try {
    const res = await axios.post(BASE_URL, {
      username,
      email,
      password,
    });

    console.log(`✅ [User ${index}] Created: ${username} (${email})`);
  } catch (err) {
    console.error(
      `❌ [User ${index}] Failed:`,
      err.response?.data || err.message || err
    );
  }
}

// ✅ Main function
async function main() {
  console.log(`🚀 Creating ${TOTAL_USERS} fake users at ${BASE_URL}...`);

  const BATCH_SIZE = 5; // run 5 requests at once
  for (let i = 0; i < TOTAL_USERS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_USERS; j++) {
      batch.push(createUser(i + j + 1));
    }
    await Promise.all(batch);
  }

  console.log("✅ Done seeding users!");
}

main();
