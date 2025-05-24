const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const apiKey = process.env.KRAKEN_API_KEY;
const apiSecret = process.env.KRAKEN_API_SECRET;

function getSignature(path, requestData, nonce) {
    const message = nonce + requestData;
    const secretBuffer = Buffer.from(apiSecret, 'base64');
    const hash = crypto.createHash('sha256').update(message).digest();
    const hmac = crypto.createHmac('sha512', secretBuffer);
    const pathBuffer = Buffer.from(path);
    const hmacMessage = Buffer.concat([pathBuffer, hash]);
    return hmac.update(hmacMessage).digest('base64');
}

async function getBalance() {
    const path = '/0/private/Balance';
    const nonce = Date.now() * 1000;
    const requestData = `nonce=${nonce}`;

    const signature = getSignature(path, requestData, nonce);

    const headers = {
        'API-Key': apiKey,
        'API-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
        const response = await axios.post('https://api.kraken.com' + path, requestData, { headers });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

if (!apiKey || !apiSecret) {
    console.error('Please set KRAKEN_API_KEY and KRAKEN_API_SECRET in your environment variables.');
    process.exit(1);
}

getBalance();
