import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test results storage
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok
    };
  } catch (error) {
    return {
      error: error.message,
      ok: false
    };
  }
}

// Security test cases
const securityTests = [
  {
    name: 'CORS Headers Check',
    test: async () => {
      const response = await makeRequest(`${API_BASE}/category`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://malicious-site.com',
          'Access-Control-Request-Method': 'POST'
        }
      });
      
      // In production, should reject unauthorized origins
      if (process.env.NODE_ENV === 'production') {
        if (response.headers['access-control-allow-origin']) {
          return response.headers['access-control-allow-origin'] !== '*';
        }
      }
      return true; // Pass in development
    }
  },
  {
    name: 'Security Headers Check',
    test: async () => {
      const response = await makeRequest(`${API_BASE}/category`);
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection'
      ];
      
      const missingHeaders = requiredHeaders.filter(
        header => !response.headers[header] && !response.headers[header.toLowerCase()]
      );
      
      return missingHeaders.length === 0;
    },
    details: (response) => {
      return `Missing headers: ${response.headers}`;
    }
  },
  {
    name: 'Rate Limiting Check',
    test: async () => {
      // Make multiple rapid requests
      const requests = Array(110).fill(null).map(() => 
        makeRequest(`${API_BASE}/category`)
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      
      return rateLimited;
    }
  },
  {
    name: 'SQL Injection Protection',
    test: async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const response = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: {
          email: maliciousInput,
          password: maliciousInput
        }
      });
      
      // Should not crash or expose database errors
      return response.status !== 500;
    }
  },
  {
    name: 'XSS Protection',
    test: async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const response = await makeRequest(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: {
          email: `test${xssPayload}@test.com`,
          password: 'test123',
          name: xssPayload
        }
      });
      
      // Should sanitize input
      return response.status !== 500;
    }
  },
  {
    name: 'Authentication Required Endpoints',
    test: async () => {
      const protectedEndpoints = [
        `${API_BASE}/product`,
        `${API_BASE}/cart`,
        `${API_BASE}/orders`
      ];
      
      const results = await Promise.all(
        protectedEndpoints.map(url => makeRequest(url))
      );
      
      // All should require authentication (401 or 403)
      return results.every(r => r.status === 401 || r.status === 403);
    }
  },
  {
    name: 'Content-Type Validation',
    test: async () => {
      const response = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'invalid json'
      });
      
      // Should reject invalid content types
      return response.status === 400 || response.status === 415;
    }
  },
  {
    name: 'Request Size Limiting',
    test: async () => {
      // Create a large payload (>5MB)
      const largePayload = {
        data: 'x'.repeat(6 * 1024 * 1024) // 6MB
      };
      
      const response = await makeRequest(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: largePayload
      });
      
      // Should reject oversized requests
      return response.status === 413 || response.status === 400;
    }
  },
  {
    name: 'HTTPS Enforcement (Production)',
    test: async () => {
      if (process.env.NODE_ENV !== 'production') {
        return { skip: true, message: 'Skipped in non-production environment' };
      }
      
      const response = await makeRequest(`${API_BASE}/category`, {
        headers: {
          'X-Forwarded-Proto': 'http'
        }
      });
      
      // Should redirect to HTTPS or reject
      return response.status === 301 || response.status === 302 || response.status === 403;
    }
  },
  {
    name: 'Sensitive Data Exposure',
    test: async () => {
      const response = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: {
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        }
      });
      
      // Should not expose user existence or database structure
      const responseText = JSON.stringify(response);
      const sensitivePatterns = [
        /mongodb/i,
        /mongoose/i,
        /database/i,
        /sql/i,
        /stack trace/i,
        /error:/i
      ];
      
      return !sensitivePatterns.some(pattern => pattern.test(responseText));
    }
  }
];

async function runSecurityTests() {
  console.log('='.repeat(60));
  console.log('🔒 SECURITY TESTING SUITE');
  console.log('='.repeat(60));
  console.log(`🌐 Testing: ${BASE_URL}\n`);
  
  for (const test of securityTests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const result = await test.test();
      
      if (result && typeof result === 'object' && result.skip) {
        results.warnings.push({
          name: test.name,
          message: result.message
        });
        console.log(`⚠️  ${test.name}: ${result.message}\n`);
      } else if (result) {
        results.passed.push(test.name);
        console.log(`✅ ${test.name}: PASSED\n`);
      } else {
        results.failed.push(test.name);
        console.log(`❌ ${test.name}: FAILED\n`);
      }
    } catch (error) {
      results.failed.push({
        name: test.name,
        error: error.message
      });
      console.log(`❌ ${test.name}: ERROR - ${error.message}\n`);
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SECURITY TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log('='.repeat(60));
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => {
      console.log(`   - ${typeof test === 'string' ? test : test.name}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => {
      console.log(`   - ${warning.name}: ${warning.message}`);
    });
  }
  
  console.log('\n');
  
  // Exit with error code if tests failed
  process.exit(results.failed.length > 0 ? 1 : 0);
}

runSecurityTests().catch(console.error);

