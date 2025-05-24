const http = require('http');

http.get('http://localhost:4000/performance', (res) => {
    let data = '';
    res.on('data', chunk => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Raw response string:', data);
    });
}).on('error', (err) => {
    console.error('Error fetching:', err.message);
});
