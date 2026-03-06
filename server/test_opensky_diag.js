const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const url = 'https://opensky-network.org/api/states/all';
const pass = process.env.OPENSKY_PASSWORD;

const users = [
  'adarshmishra.modern@gmail.com',
  'adarshmishra.modern',
  'adarshmishra.modern@gmail.com-api-client'
];

async function run() {
  console.log("Starting OpenSky Authentication Diagnostics...");
  console.log("Target URL:", url);
  console.log("Password length:", pass ? pass.length : 0);

  // Test 0: Anonymous
  console.log("\nTesting Anonymous Access...");
  try {
    const res = await axios.get(url, { timeout: 10000 });
    console.log("✅ Anonymous check: SUCCESS. Status:", res.status);
    console.log("States returned:", res.data?.states?.length || 0);
  } catch (err) {
    console.log("❌ Anonymous check: FAILED. Status:", err.response?.status || err.message);
  }

  for (const user of users) {
    console.log(`\nTesting Basic Auth with user: [${user}]...`);
    try {
      const res = await axios.get(url, {
        auth: { username: user, password: pass },
        timeout: 10000
      });
      console.log(`✅ SUCCESS for ${user}! Status:`, res.status);
    } catch (err) {
      console.log(`❌ FAILED for ${user}! Status:`, err.response?.status || err.message);
    }
  }
}

run();
