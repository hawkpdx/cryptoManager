const axios = require('axios');
const assert = require('assert');

const baseURL = 'http://localhost:3001';

async function testHealth() {
    const res = await axios.get(baseURL + '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'CryptoBot backend is running');
    console.log('Health check passed');
}

async function testBalance() {
    const res = await axios.get(baseURL + '/api/kraken/balance');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.balance);
    console.log('Balance fetch passed');
}

async function testBuyOrder() {
    try {
        const res = await axios.post(baseURL + '/api/kraken/order/buy', {
            pair: 'XXRPZUSD',
            ordertype: 'market',
            volume: '1',
        });
        assert.strictEqual(res.status, 200);
        assert.ok(res.data.result);
        console.log('Buy order passed');
    } catch (error) {
        console.error('Buy order failed:', error.response ? error.response.data : error.message);
    }
}

async function testSellOrder() {
    try {
        const res = await axios.post(baseURL + '/api/kraken/order/sell', {
            pair: 'XXRPZUSD',
            ordertype: 'market',
            volume: '1',
        });
        assert.strictEqual(res.status, 200);
        assert.ok(res.data.result);
        console.log('Sell order passed');
    } catch (error) {
        console.error('Sell order failed:', error.response ? error.response.data : error.message);
    }
}

async function testMinVolume() {
    const res = await axios.get(baseURL + '/api/kraken/pair/minvolume/XXRPZUSD');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.pair, 'XXRPZUSD');
    assert.ok(res.data.minVolume);
    console.log('Min volume fetch passed');
}

async function testTradingBotControl() {
    let res = await axios.post(baseURL + '/api/tradingbot/start');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'started');
    console.log('Trading bot start passed');

    res = await axios.post(baseURL + '/api/tradingbot/params', {
        pair: 'XXRPZUSD',
        buyThreshold: 0.9,
        sellThreshold: 1.1,
        tradeVolume: 1,
        checkInterval: 30000,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'params updated');
    console.log('Trading bot params update passed');

    res = await axios.post(baseURL + '/api/tradingbot/stop');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'stopped');
    console.log('Trading bot stop passed');
}

async function runTests() {
    try {
        await testHealth();
        await testBalance();
        await testBuyOrder();
        await testSellOrder();
        await testMinVolume();
        await testTradingBotControl();
        console.log('All backend tests completed');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

runTests();
