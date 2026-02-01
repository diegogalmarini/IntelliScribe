
const http = require('http');

const data = JSON.stringify({
    email: 'test@example.com',
    legalAccepted: true
});

const options = {
    hostname: 'localhost',
    port: 5173,
    path: '/api/newsletter-subscribe',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('BODY START:');
        console.log(body);
        console.log('BODY END');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
