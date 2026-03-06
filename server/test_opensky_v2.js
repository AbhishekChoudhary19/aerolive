const axios = require('axios');
const prefix = 'adarshmishra.modern';
const full = 'adarshmishra.modern@gmail.com';
const password = '5JYaffT5R*8tya3';

const test = async (user) => {
    console.log(`Testing with user: ${user}...`);
    try {
        const response = await axios.get('https://opensky-network.org/api/states/all', {
            auth: { username: user, password },
            params: { lamin: 40, lomin: -10, lamax: 60, lomax: 20 },
            timeout: 5000
        });
        console.log(`✅ SUCCESS for ${user}! States found: ${response.data.states.length}`);
        return true;
    } catch (err) {
        console.error(`❌ FAILED for ${user}! Status: ${err.response ? err.response.status : err.message}`);
        return false;
    }
};

const run = async () => {
    const successFull = await test(full);
    if (!successFull) {
        await test(prefix);
    }
};

run();
