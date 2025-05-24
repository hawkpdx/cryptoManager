import fetch from 'node-fetch';

async function testPerformance() {
    const response = await fetch('http://localhost:3001/api/performance/XXRPZUSD');
    const data = await response.json();
    console.log(data);
}

testPerformance();
