const axios = require('axios');
const qs = require('qs');
require('dotenv').config({ path: './server/.env' });

const clientId = process.env.OPENSKY_USERNAME;
const clientSecret = process.env.OPENSKY_PASSWORD;
const tokenUrl = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const statesUrl = 'https://opensky-network.org/api/states/all';

async function run() {
  console.log("Starting OpenSky OAuth2 Diagnostic...");
  console.log("Client ID:", clientId);
  
  try {
    console.log("\nAttempting to get OAuth2 Token...");
    const data = qs.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });

    const tokenRes = await axios.post(tokenUrl, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const token = tokenRes.data.access_token;
    console.log("✅ Token successfully obtained!");
    console.log("Token type:", tokenRes.data.token_type);
    console.log("Expires in:", tokenRes.data.expires_in);

    console.log("\nAttempting to use Token for States API...");
    const statesRes = await axios.get(statesUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("✅ States API Success! Status:", statesRes.status);
    console.log("Total aircraft tracked:", statesRes.data?.states?.length || 0);

  } catch (err) {
    console.log("❌ OAuth2 / API FAILED.");
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", JSON.stringify(err.response.data));
    } else {
      console.log("Error:", err.message);
    }
  }
}

run();
