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

// Performance benchmarks
const benchmarks = {
  responseTime: {
    excellent: 100,  // ms
    good: 200,
    acceptable: 500,
    poor: 1000
  },
  throughput: {
    excellent: 1000,  // requests/second
    good: 500,
    acceptable: 100,
    poor: 50
  },
  errorRate: {
    excellent: 0.01,  // 1%
    good: 0.05,       // 5%
    acceptable: 0.1,  // 10%
    poor: 0.2         // 20%
  }
};

function evaluatePerformance(metric, value) {
  const thresholds = benchmarks[metric];
  if (value <= thresholds.excellent) return { level: 'excellent', emoji: '🟢' };
  if (value <= thresholds.good) return { level: 'good', emoji: '🟡' };
  if (value <= thresholds.acceptable) return { level: 'acceptable', emoji: '🟠' };
  return { level: 'poor', emoji: '🔴' };
}

async function runPerformanceTest(endpoint, name) {
  console.log(`\n📊 Testing: ${name}`);
  console.log(`   Endpoint: ${endpoint}`);
  
  return new Promise((resolve, reject) => {
    const instance = autocannon({
      url: endpoint,
      connections: 10,
      pipelining: 1,
      duration: 30,
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}`,
        'Content-Type': 'application/json'
      }
    }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      const avgLatency = result.latency.mean;
      const rps = result.requests.average;
      const errorRate = result.errors / result.requests.total;
      
      const latencyEval = evaluatePerformance('responseTime', avgLatency);
      const throughputEval = evaluatePerformance('throughput', rps);
      const errorEval = evaluatePerformance('errorRate', errorRate);
      
      resolve({
        name,
        endpoint,
        latency: {
          value: avgLatency,
          ...latencyEval
        },
        throughput: {
          value: rps,
          ...throughputEval
        },
        errorRate: {
          value: errorRate * 100,
          ...errorEval
        },
        details: result
      });
    });
    
    autocannon.track(instance, {
      outputStream: process.stdout
    });
  });
}

async function runAllPerformanceTests() {
  console.log('='.repeat(60));
  console.log('⚡ PERFORMANCE TESTING SUITE');
  console.log('='.repeat(60));
  console.log(`🌐 Testing: ${BASE_URL}\n`);
  
  const endpoints = [
    { url: `${API_BASE}/category`, name: 'Get Categories' },
    { url: `${API_BASE}/product`, name: 'Get Products' },
    { url: `${API_BASE}/cart`, name: 'Get Cart' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await runPerformanceTest(endpoint.url, endpoint.name);
      results.push(result);
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error testing ${endpoint.name}:`, error.message);
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE TEST SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    console.log(`\n${result.name}:`);
    console.log(`   ${result.latency.emoji} Latency: ${result.latency.value.toFixed(2)}ms (${result.latency.level})`);
    console.log(`   ${result.throughput.emoji} Throughput: ${result.throughput.value.toFixed(2)} req/s (${result.throughput.level})`);
    console.log(`   ${result.errorRate.emoji} Error Rate: ${result.errorRate.value.toFixed(2)}% (${result.errorRate.level})`);
  });
  
  // Overall assessment
  const avgLatency = results.reduce((sum, r) => sum + r.latency.value, 0) / results.length;
  const avgThroughput = results.reduce((sum, r) => sum + r.throughput.value, 0) / results.length;
  const avgErrorRate = results.reduce((sum, r) => sum + r.errorRate.value, 0) / results.length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 OVERALL PERFORMANCE');
  console.log('='.repeat(60));
  console.log(`Average Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`Average Throughput: ${avgThroughput.toFixed(2)} req/s`);
  console.log(`Average Error Rate: ${avgErrorRate.toFixed(2)}%`);
  
  const overallLatency = evaluatePerformance('responseTime', avgLatency);
  const overallThroughput = evaluatePerformance('throughput', avgThroughput);
  const overallError = evaluatePerformance('errorRate', avgErrorRate / 100);
  
  console.log(`\nOverall Rating:`);
  console.log(`   ${overallLatency.emoji} Latency: ${overallLatency.level}`);
  console.log(`   ${overallThroughput.emoji} Throughput: ${overallThroughput.level}`);
  console.log(`   ${overallError.emoji} Error Rate: ${overallError.level}`);
  console.log('='.repeat(60));
  console.log('\n✨ Performance testing completed!\n');
}

runAllPerformanceTests().catch(console.error);

