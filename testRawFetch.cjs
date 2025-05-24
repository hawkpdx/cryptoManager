const http = require('http');

http.get('http://localhost:3001/api/performance/XXRPZUSD', (res) => {
    const chunks = [];
    res.on('data', (chunk) => {
        chunks.push(chunk);
    });
    res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log('Raw response buffer:', buffer);
        console.log('Raw response string:', buffer.toString());
    });
}).on('error', (err) => {
    console.error('Error fetching:', err.message);
});
