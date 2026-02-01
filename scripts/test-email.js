
import http from 'http';

function sendRequest(path, data) {
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => responseBody += chunk);
        res.on('end', () => {
            console.log(`\n[${path}] Status: ${res.statusCode}`);
            console.log(`Response: ${responseBody}`);
        });
    });

    req.on('error', (error) => {
        console.error(`\n[${path}] Error: ${error.message}`);
    });

    req.write(data);
    req.end();
}

// 1. Test New Recording Email
const newRecordingData = JSON.stringify({
    type: 'new_recording',
    to: 'test@diktalo.com', // Change to your email to test real send if Resend key is present
    payload: {
        userName: 'Diego',
        recordingTitle: 'Meeting with Team',
        duration: '45:00',
        date: new Date().toLocaleDateString(),
        dashboardUrl: 'http://localhost:5173/dashboard'
    }
});

console.log('Sending New Recording Email Request...');
sendRequest('/api/send-email', newRecordingData);

// 2. Test Welcome Email
const welcomeData = JSON.stringify({
    type: 'welcome',
    to: 'test@diktalo.com',
    payload: {
        userName: 'Diego',
        dashboardUrl: 'http://localhost:5173/dashboard'
    }
});

setTimeout(() => {
    console.log('Sending Welcome Email Request...');
    sendRequest('/api/send-email', welcomeData);
}, 1000);

