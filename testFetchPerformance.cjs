const fetch = require('node-fetch');

async function testPerformanceEndpoint() {
    try {
        const response = await fetch('http://localhost:3001/api/performance/XXRPZUSD');
        const text = await response.text();
        console.log('Raw response text:', text);
        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', json);
        } catch (err) {
            console.error('JSON parse error:', err.message);
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testPerformanceEndpoint();
