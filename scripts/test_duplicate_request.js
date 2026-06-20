#!/usr/bin/env node
const axios = require('axios');

async function run() {
  const base = 'http://localhost:3000/api';
  // Use a token from env or skip auth
  const token = process.env.TEST_TOKEN || '';
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const payload = {
    category: 'phone',
    description: 'Screen cracked badly',
  };

  try {
    console.log('Sending first request...');
    const r1 = await axios.post(`${base}/requests`, payload, { headers });
    console.log('First response:', r1.status, r1.data.id || r1.data);
  } catch (err) {
    console.error('First request failed:', err.response ? err.response.status : err.message);
  }

  try {
    console.log('Sending duplicate request...');
    const r2 = await axios.post(`${base}/requests`, payload, { headers });
    console.log('Second response:', r2.status, r2.data.id || r2.data);
  } catch (err) {
    if (err.response) {
      console.error('Second request status:', err.response.status, err.response.data);
    } else {
      console.error('Second request failed:', err.message);
    }
  }
}

run();
