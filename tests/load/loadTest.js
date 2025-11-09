import autocannon from 'autocannon';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test configurations
const testConfigs = {
  light: {
    connections: 10,
    pipelining: 1,
    duration: 30,
    amount: undefined
  },
  medium: {
    connections: 50,
    pipelining: 2,
    duration: 60,
    amount: undefined
  },
  heavy: {
    connections: 100,
    pipelining: 3,
    duration: 120,
    amount: undefined
  }
};

// Get test type from command line argument
const testType = process.argv[2] || 'light';
const config = testConfigs[testType] || testConfigs.light;

console.log(`\n🚀 Starting ${testType} load test...`);
console.log(`📊 Configuration:`, config);
console.log(`🌐 Target: ${BASE_URL}\n`);

// Test scenarios
const scenarios = [
  {
    name: 'GET Products',
    url: `${API_BASE}/product`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}`,
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'GET Categories',
    url: `${API_BASE}/category`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}`,
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'GET Cart',
    url: `${API_BASE}/cart`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}`,
      'Content-Type': 'application/json'
    }
  }
];

async function runLoadTest(scenario) {
  console.log(`\n📈 Testing: ${scenario.name}`);
  console.log(`   URL: ${scenario.url}`);
  
  const instance = autocannon({
    url: scenario.url,
    method: scenario.method,
    headers: scenario.headers,
    connections: config.connections,
    pipelining: config.pipelining,
    duration: config.duration,
    amount: config.amount
  }, (err, result) => {
    if (err) {
      console.error(`❌ Error testing ${scenario.name}:`, err);
      return;
    }
    
    printResults(scenario.name, result);
  });

  // Track progress
  autocannon.track(instance, {
    outputStream: process.stdout
  });

  return instance;
}

function printResults(name, result) {
  console.log(`\n✅ Results for: ${name}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Requests: ${result.requests.total} total`);
  console.log(`⚡ Throughput: ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB/s`);
  console.log(`🔄 Latency:`);
  console.log(`   Average: ${result.latency.mean}ms`);
  console.log(`   Min: ${result.latency.min}ms`);
  console.log(`   Max: ${result.latency.max}ms`);
  console.log(`   p99: ${result.latency.p99}ms`);
  console.log(`   p95: ${result.latency.p95}ms`);
  console.log(`   p90: ${result.latency.p90}ms`);
  console.log(`📈 Status Codes:`);
  Object.entries(result.statusCodeStats).forEach(([code, count]) => {
    console.log(`   ${code}: ${count}`);
  });
  console.log(`❌ Errors: ${result.errors}`);
  console.log(`⏱️  Duration: ${result.duration}s`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🔥 LOAD TESTING SUITE');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const scenario of scenarios) {
    try {
      const instance = await runLoadTest(scenario);
      await instance;
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to run test for ${scenario.name}:`, error);
    }
  }
  
  console.log('\n✨ Load testing completed!\n');
}

// Run tests
runAllTests().catch(console.error);

