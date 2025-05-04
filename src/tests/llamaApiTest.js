// Use package.json to see if we have type: module, otherwise create a simple CommonJS script
const axios = require('axios');

// Llama API configuration - updated with correct endpoint from curl example
const API_URL = 'https://api.llama.com/v1/chat/completions';
const API_KEY = 'LLM|1050039463644017|ZZzxjun1klZ76kW0xu5Zg4BW5-o';

// Simple test function to check API connectivity
async function testLlamaApiConnection() {
  console.log('Starting Llama API connection test...');
  console.log('Using API URL:', API_URL);
  
  try {
    // Using the exact format from the curl example
    const requestBody = {
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
      messages: [
        {"role": "user", "content": "Hello Llama! Can you give me a quick intro?"}
      ]
    };
    
    console.log('Sending test message to Llama API...');
    
    const response = await axios.post(
      API_URL,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    console.log('✅ API Connection Successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return { success: true, response: response.data };
  } catch (error) {
    console.error('❌ API Connection Failed!');
    console.error('Error details:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Request details:', error.request._currentUrl);
    }
    
    return { success: false, error: error.message, details: error.response };
  }
}

// Run the test
testLlamaApiConnection().then(result => {
  if (result.success) {
    console.log('Connection test completed successfully');
  } else {
    console.log('Connection test failed, see above for details');
  }
}); 