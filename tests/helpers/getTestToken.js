/**
 * Helper script to get a test token for testing
 * Usage: node tests/helpers/getTestToken.js <email> <password>
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

async function getTestToken(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      console.log('\n✅ Token obtained successfully!\n');
      console.log('Add this to your .env file:');
      console.log(`TEST_TOKEN=${data.token}\n`);
      return data.token;
    } else {
      console.error('❌ Failed to get token:', data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure the server is running on', BASE_URL);
    process.exit(1);
  }
}

// Get credentials from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node tests/helpers/getTestToken.js <email> <password>');
  console.log('\nExample:');
  console.log('  node tests/helpers/getTestToken.js user@example.com password123');
  process.exit(1);
}

getTestToken(email, password);

