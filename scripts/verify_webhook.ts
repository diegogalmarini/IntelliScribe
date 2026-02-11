
import 'dotenv/config';

async function testWebhook() {
    const url = process.env.SOCIAL_WEBHOOK_URL || "https://hook.eu1.make.com/jee1wehpjjx2cd2hn9i4m1tu7ay3a2ke";

    console.log(`🔍 Testing Webhook URL: ${url}`);

    const payload = {
        title: "DEBUG_TEST_ARTIFACT",
        url: "https://diktalo.com/blog/debug-test",
        image_url: "https://via.placeholder.com/150",
        linkedin_text: "This is a connectivity test payload from the Diktalo developer."
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log(`📝 Response Body: ${text}`);

        if (response.ok) {
            console.log("✅ Make.com acknowledged receipt (200 OK).");
            console.log("👉 Please check your Make.com scenario history/input bundle for 'DEBUG_TEST_ARTIFACT'.");
        } else {
            console.error("❌ Make.com rejected the request.");
        }
    } catch (error) {
        console.error("❌ Network Error:", error);
    }
}

testWebhook();
