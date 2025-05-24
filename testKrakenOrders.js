const axios = require('axios');

const baseUrl = 'http://localhost:3001/api/kraken/order';

async function testBuyOrder() {
    try {
        const response = await axios.post(`${baseUrl}/buy`, {
            pair: 'XXRPZUSD',
            ordertype: 'market',
            volume: '1.0',
        });
        console.log('Buy Order Response:', response.data);
    } catch (error) {
        console.error('Buy Order Error:', error.response ? error.response.data : error.message);
    }
}

async function testSellOrder() {
    try {
        const response = await axios.post(`${baseUrl}/sell`, {
            pair: 'XXRPZUSD',
            ordertype: 'market',
            volume: '1.0',
        });
        console.log('Sell Order Response:', response.data);
    } catch (error) {
        console.error('Sell Order Error:', error.response ? error.response.data : error.message);
    }
}

async function runTests() {
    console.log('Testing Buy Order...');
    await testBuyOrder();
    console.log('Testing Sell Order...');
    await testSellOrder();
}

runTests();
