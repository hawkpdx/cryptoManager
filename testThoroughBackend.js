const axios = require('axios');

const baseUrl = 'http://localhost:3001/api/kraken';

async function testBalance() {
    try {
        const response = await axios.get(`${baseUrl}/balance`);
        console.log('Balance:', response.data);
    } catch (error) {
        console.error('Balance Error:', error.response ? error.response.data : error.message);
    }
}

async function testMinVolume(pair) {
    try {
        const response = await axios.get(`${baseUrl}/pair/minvolume/${pair}`);
        console.log(`Min volume for ${pair}:`, response.data);
    } catch (error) {
        console.error('MinVolume Error:', error.response ? error.response.data : error.message);
    }
}

async function testBuyOrder(pair, volume) {
    try {
        const response = await axios.post(`${baseUrl}/order/buy`, {
            pair,
            ordertype: 'market',
            volume,
        });
        console.log('Buy Order Response:', response.data);
    } catch (error) {
        console.error('Buy Order Error:', error.response ? error.response.data : error.message);
    }
}

async function testSellOrder(pair, volume) {
    try {
        const response = await axios.post(`${baseUrl}/order/sell`, {
            pair,
            ordertype: 'market',
            volume,
        });
        console.log('Sell Order Response:', response.data);
    } catch (error) {
        console.error('Sell Order Error:', error.response ? error.response.data : error.message);
    }
}

async function testInvalidOrder() {
    try {
        const response = await axios.post(`${baseUrl}/order/buy`, {
            pair: 'INVALIDPAIR',
            ordertype: 'market',
            volume: '0.1',
        });
        console.log('Invalid Order Response:', response.data);
    } catch (error) {
        console.error('Invalid Order Error:', error.response ? error.response.data : error.message);
    }
}

async function runTests() {
    await testBalance();
    await testMinVolume('XXRPZUSD');
    await testBuyOrder('XXRPZUSD', '2'); // minimum volume from previous test
    await testSellOrder('XXRPZUSD', '2');
    await testInvalidOrder();
}

runTests();
