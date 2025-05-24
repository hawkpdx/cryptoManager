const fetch = require('node-fetch');

async function testPerformance() {
    const response = await fetch('http://localhost:3001/api/performance/XXRPZUSD');
    const text = await response.text();
    console.log(text);
}

testPerformance();
