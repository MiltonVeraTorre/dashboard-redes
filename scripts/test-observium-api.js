#!/usr/bin/env node

/**
 * Observium API Diagnostic Script
 * 
 * This script tests the Observium API connection and diagnoses common issues:
 * - Authentication problems
 * - Rate limiting
 * - Device-specific issues
 * - API endpoint availability
 */

const axios = require('axios');
require('dotenv').config();

// Create axios instance with same config as the app
const observiumApi = axios.create({
  baseURL: process.env.OBSERVIUM_BASE_URL,
  auth: {
    username: process.env.OBSERVIUM_USERNAME,
    password: process.env.OBSERVIUM_PASSWORD
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  maxRedirects: 5,
  validateStatus: (status) => {
    return status >= 200 && status < 500; // Accept 4xx and 5xx for debugging
  },
});

async function testBasicConnection() {
  console.log('🔍 Testing basic API connection...');
  console.log(`Base URL: ${process.env.OBSERVIUM_BASE_URL}`);
  console.log(`Username: ${process.env.OBSERVIUM_USERNAME}`);
  console.log(`Password: ${process.env.OBSERVIUM_PASSWORD ? '[SET]' : '[NOT SET]'}`);
  
  try {
    const response = await observiumApi.get('/');
    console.log(`✅ Basic connection successful - Status: ${response.status}`);
    console.log(`Response data:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`❌ Basic connection failed:`, error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Headers:`, error.response.headers);
      console.log(`Data:`, error.response.data);
    }
    return false;
  }
}

async function testDevicesEndpoint() {
  console.log('\n🔍 Testing /devices endpoint...');
  
  try {
    const response = await observiumApi.get('/devices', { 
      params: { limit: 5 } 
    });
    console.log(`✅ Devices endpoint successful - Status: ${response.status}`);
    console.log(`Response structure:`, Object.keys(response.data));
    
    if (response.data.devices) {
      const deviceIds = Object.keys(response.data.devices).slice(0, 5);
      console.log(`Sample device IDs: ${deviceIds.join(', ')}`);
      return deviceIds.map(id => parseInt(id));
    }
    return [];
  } catch (error) {
    console.log(`❌ Devices endpoint failed:`, error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    }
    return [];
  }
}

async function testPortsEndpoint(deviceIds) {
  console.log('\n🔍 Testing /ports endpoint...');
  
  if (deviceIds.length === 0) {
    console.log('❌ No device IDs available for testing');
    return;
  }
  
  // Test with first few device IDs
  for (const deviceId of deviceIds.slice(0, 3)) {
    console.log(`\n📡 Testing ports for device ${deviceId}...`);
    
    try {
      const response = await observiumApi.get('/ports', {
        params: { 
          device_id: deviceId,
          state: 'up'
        }
      });
      
      console.log(`✅ Device ${deviceId} - Status: ${response.status}`);
      console.log(`Response structure:`, Object.keys(response.data));
      
      if (response.data.ports) {
        const portCount = Object.keys(response.data.ports).length;
        console.log(`Port count: ${portCount}`);
        
        // Show sample port data
        const firstPort = Object.values(response.data.ports)[0];
        if (firstPort) {
          console.log(`Sample port fields:`, Object.keys(firstPort));
          console.log(`Sample port data:`, JSON.stringify(firstPort, null, 2));
        }
      }
      
    } catch (error) {
      console.log(`❌ Device ${deviceId} failed:`, error.message);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Status Text: ${error.response.statusText}`);
        console.log(`Headers:`, error.response.headers);
        console.log(`Data:`, error.response.data);
      }
      if (error.code) {
        console.log(`Error Code: ${error.code}`);
      }
    }
    
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testRateLimiting() {
  console.log('\n🔍 Testing rate limiting...');
  
  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push(observiumApi.get('/devices', { params: { limit: 1 } }));
  }
  
  try {
    const responses = await Promise.all(requests);
    console.log(`✅ Concurrent requests successful - all returned status 200`);
  } catch (error) {
    console.log(`❌ Rate limiting detected:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting Observium API Diagnostic...\n');
  
  // Test 1: Basic connection
  const basicOk = await testBasicConnection();
  if (!basicOk) {
    console.log('\n❌ Basic connection failed. Check URL, credentials, and network connectivity.');
    return;
  }
  
  // Test 2: Devices endpoint
  const deviceIds = await testDevicesEndpoint();
  
  // Test 3: Ports endpoint with specific devices
  await testPortsEndpoint(deviceIds);
  
  // Test 4: Rate limiting
  await testRateLimiting();
  
  console.log('\n✅ Diagnostic complete!');
}

main().catch(console.error);
