const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const url = 'https://opensky-network.org/api/states/all';
const identUrl = 'https://opensky-network.org/api/users/identity';
const oldPass = "5JYaffT5R*8tya3";
const newSecret = "FtlUokEPaEcnq3ngvZQQVUmUlTWXtHF8";

const users = [
  'adarshmishra.modern@gmail.com',
  'adarshmishra.modern',
  'adarshmishra.modern@gmail.com-api-client'
];

async function test(user, pass) {
    process.stdout.write(`Testing [${user}] : [${pass.substring(0,4)}...] ... `);
    try {
        const res = await axios.get(identUrl, {
            auth: { username: user, password: pass },
            timeout: 8000
        });
        console.log(`✅ AUTH SUCCESS! Identity:`, JSON.stringify(res.data));
        return true;
    } catch (err) {
        console.log(`❌ ${err.response?.status || err.message}`);
        return false;
    }
}

async function run() {
    console.log("Starting Exhaustive Auth Check...\n");
    
    for (const u of users) {
        await test(u, oldPass);
        await test(u, newSecret);
    }
}

run();
