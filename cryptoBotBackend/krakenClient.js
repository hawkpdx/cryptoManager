const axios = require('axios');
const crypto = require('crypto');

class KrakenClient {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.apiUrl = 'https://api.kraken.com';
    }

    _getSignature(path, requestData, nonce) {
        const message = nonce + requestData;
        const secretBuffer = Buffer.from(this.apiSecret, 'base64');
        const hash = crypto.createHash('sha256').update(message).digest();
        const hmac = crypto.createHmac('sha512', secretBuffer);
        const pathBuffer = Buffer.from(path);
        const hmacMessage = Buffer.concat([pathBuffer, hash]);
        return hmac.update(hmacMessage).digest('base64');
    }

    async _privateRequest(path, params = {}) {
        const nonce = Date.now() * 1000;
        const requestData = new URLSearchParams({ nonce, ...params }).toString();
        const signature = this._getSignature(path, requestData, nonce);

        const headers = {
            'API-Key': this.apiKey,
            'API-Sign': signature,
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        console.log('Request Path:', path);
        console.log('Request Data:', requestData);
        console.log('Signature:', signature);
        console.log('Headers:', headers);

        try {
            const response = await axios.post(this.apiUrl + path, requestData, { headers });
            if (response.data.error && response.data.error.length) {
                throw new Error(response.data.error.join(', '));
            }
            return response.data.result;
        } catch (error) {
            console.error('Kraken API request failed:', error);
            throw new Error(`Kraken API error: ${error.message}`);
        }
    }

    async getBalance() {
        return this._privateRequest('/0/private/Balance');
    }

    async getTicker(pair) {
        const response = await axios.get(`${this.apiUrl}/0/public/Ticker?pair=${pair}`);
        if (response.data.error && response.data.error.length) {
            throw new Error(response.data.error.join(', '));
        }
        return response.data.result;
    }

    async getAssetPairs() {
        const response = await axios.get(`${this.apiUrl}/0/public/AssetPairs`);
        if (response.data.error && response.data.error.length) {
            throw new Error(response.data.error.join(', '));
        }
        return response.data.result;
    }
    async addOrder(pair, type, ordertype, volume, price = null) {
        const params = {
            pair,
            type, // buy or sell
            ordertype, // e.g., 'limit', 'market'
            volume,
        };
        if (price !== null) {
            params.price = price;
        }
        return this._privateRequest('/0/private/AddOrder', params);
    }
}

module.exports = KrakenClient;
