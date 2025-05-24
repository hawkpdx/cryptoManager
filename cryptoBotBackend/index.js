const KrakenClient = require('./krakenClient');
const TradingBot = require('./tradingBot');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize Kraken client with environment variables or placeholders
const krakenApiKey = process.env.KRAKEN_API_KEY || 'ZLkKVbdhpgAPfRIMR4tdRJR/hwpt20+qICTwhSO/en5ELLu6mm0tzvN5';
const krakenApiSecret = process.env.KRAKEN_API_SECRET || 'iMOjVf+6RDPaYMDD8kcaVECkbEX4ZX7ujiHKrURcqozMyrqDr/LplqzdizlCAoSLayJ28hRDQio5vTRwk7tFUQ==';
const krakenClient = new KrakenClient(krakenApiKey, krakenApiSecret);

const tradingBot = new TradingBot(krakenClient);

tradingBot.on('trade', (info) => {
    console.log('Trade executed:', info);
});

tradingBot.on('error', (error) => {
    console.error('Trading bot error:', error);
});

tradingBot.on('started', () => {
    console.log('Trading bot started');
});

tradingBot.on('stopped', () => {
    console.log('Trading bot stopped');
});

tradingBot.on('paramsUpdated', (params) => {
    console.log('Trading bot parameters updated:', params);
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'CryptoBot backend is running' });
});

// Kraken balance endpoint
app.get('/api/kraken/balance', async (req, res) => {
    try {
        const balance = await krakenClient.getBalance();
        console.log('Balance fetched:', balance);
        res.json({ balance });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Kraken buy order endpoint
app.post('/api/kraken/order/buy', async (req, res) => {
    const { pair, ordertype, volume, price } = req.body;
    try {
        const result = await krakenClient.addOrder(pair, 'buy', ordertype, volume, price);
        res.json({ result });
    } catch (error) {
        console.error('Error placing buy order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Kraken sell order endpoint
app.post('/api/kraken/order/sell', async (req, res) => {
    const { pair, ordertype, volume, price } = req.body;
    try {
        const result = await krakenClient.addOrder(pair, 'sell', ordertype, volume, price);
        res.json({ result });
    } catch (error) {
        console.error('Error placing sell order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get minimum order volume for a trading pair
app.get('/api/kraken/pair/minvolume/:pair', async (req, res) => {
    const pair = req.params.pair;
    try {
        const assetPairs = await krakenClient.getAssetPairs();
        if (!assetPairs[pair]) {
            return res.status(404).json({ error: 'Trading pair not found' });
        }
        const minVolume = assetPairs[pair].ordermin;
        res.json({ pair, minVolume });
    } catch (error) {
        console.error('Error fetching asset pairs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Trading bot control endpoints
app.post('/api/tradingbot/start', (req, res) => {
    tradingBot.start();
    res.json({ status: 'started' });
});

app.post('/api/tradingbot/stop', (req, res) => {
    try {
        tradingBot.stop();
        res.json({ status: 'stopped' });
    } catch (error) {
        console.error('Error stopping trading bot:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tradingbot/params', (req, res) => {
    const newParams = req.body;
    tradingBot.updateParams(newParams);
    res.json({ status: 'params updated', params: tradingBot.params });
});

app.get('/api/performance/:pair', (req, res) => {
    const pair = req.params.pair;

    const performanceData = [
        { date: "2023-06-01", value: 100 },
        { date: "2023-06-02", value: 102 },
        { date: "2023-06-03", value: 101 },
        { date: "2023-06-04", value: 105 },
        { date: "2023-06-05", value: 110 },
        { date: "2023-06-06", value: 108 },
        { date: "2023-06-07", value: 115 }
    ];

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(performanceData));
});

app.get('/api/kraken/ticker/:pair', async (req, res) => {
    const pair = req.params.pair;
    try {
        const tickerData = await krakenClient.getTicker(pair);
        res.json(tickerData);
    } catch (error) {
        console.error(`Error fetching ticker for ${pair}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

const pricesCache = {
    data: null,
    timestamp: 0,
    ttl: 60000 // cache time-to-live in ms (1 minute)
};

app.get('/api/kraken/prices', async (req, res) => {
    try {
        const now = Date.now();
        if (pricesCache.data && (now - pricesCache.timestamp) < pricesCache.ttl) {
            return res.json(pricesCache.data);
        }

        const assetPairs = Object.keys(await krakenClient.getAssetPairs());
        const prices = {};
        // Limit to first 20 pairs to reduce load
        const pairsToFetch = assetPairs.slice(0, 20);

        for (const pair of pairsToFetch) {
            try {
                const tickerData = await krakenClient.getTicker(pair);
                const pairKey = Object.keys(tickerData)[0];
                if (pairKey && tickerData[pairKey] && Array.isArray(tickerData[pairKey].c)) {
                    prices[pair] = parseFloat(tickerData[pairKey].c[0]);
                }
            } catch (err) {
                console.error(`Failed to fetch ticker for ${pair}:`, err.message);
            }
        }

        pricesCache.data = prices;
        pricesCache.timestamp = now;

        res.json(prices);
    } catch (error) {
        console.error('Error fetching asset prices:', error.message);
        res.status(500).json({ error: 'Failed to fetch asset prices' });
    }
});

app.listen(port, () => {
    console.log(`CryptoBot backend listening at http://localhost:${port}`);
});
