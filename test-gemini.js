import fs from 'fs';
import path from 'path';
import https from 'https';

// Read .env file
const envPath = path.resolve(process.cwd(), '.env');
let apiKey = '';

try {
    console.log('📄 Reading .env file...');
    const envContent = fs.readFileSync(envPath, 'utf-8');

    // Try to find GEMINI_API_KEY or GOOGLE_API_KEY
    // Matches: GEMINI_API_KEY=..., VITE_GEMINI_API_KEY=..., export GEMINI_API_KEY=...
    // Handles optional spaces around =
    const geminiMatch = envContent.match(/^(?:export\s+)?(?:VITE_)?GEMINI_API_KEY\s*=\s*(.*)$/m);
    const googleMatch = envContent.match(/^(?:export\s+)?(?:VITE_)?GOOGLE_API_KEY\s*=\s*(.*)$/m);

    const match = geminiMatch || googleMatch;

    if (match) {
        apiKey = match[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
        console.log(`✅ Found key variable: ${geminiMatch ? 'GEMINI_API_KEY' : 'GOOGLE_API_KEY'}`);
    } else {
        console.log('⚠️ No matching API key variable found in .env');
        // Debug: print all keys found (names only)
        const keys = envContent.match(/^[^=#\s]+/gm);
        if (keys) {
            console.log('Keys found in .env:', keys.join(', '));
        }
    }
} catch (error) {
    console.error('Error reading .env file:', error.message);
}

if (!apiKey) {
    console.error('❌ Could not find GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env');
    process.exit(1);
}

console.log(`🔑 Found API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}...`);

    const data = JSON.stringify({
        contents: [{
            parts: [{ text: "Hello, world!" }]
        }]
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ Success! ${modelName} is working.`);
                    resolve(true);
                } else {
                    console.error(`❌ Error for ${modelName}: ${res.statusCode}`);
                    try {
                        const json = JSON.parse(body);
                        console.error(JSON.stringify(json, null, 2));
                    } catch (e) {
                        console.error(body);
                    }
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Request failed: ${error.message}`);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    await testModel('gemini-1.5-flash');
    await testModel('gemini-2.5-flash');
}

run();
