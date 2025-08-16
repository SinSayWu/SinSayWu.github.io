// ========================================
// GPT API CONFIGURATION
// ========================================
// 
// Choose your preferred LLM API and add your API key below
// 
// OPTION 1: Hugging Face (Free tier available)
// - Sign up at: https://huggingface.co/
// - Get API key from: https://huggingface.co/settings/tokens
// - Free tier: 30,000 requests/month
const GPT_CONFIG = {
    provider: "openai", // Options: "togetherai", "huggingface", "openai", "anthropic"
    
    // Together.ai Configuration (Recommended - reliable and affordable)
    togetherai: {
        apiKey: "tgp_v1_ouqrGhbOfNx2P7s5Lb1ynM-FER9aN0UjL0ZmPRxTES0", // Replace with your Together.ai API key
        model: "", // Popular open-source model
        fallbackModels: ["microsoft/DialoGPT-medium", "gpt2"], // Backup models
        apiUrl: "https://api.together.xyz/v1/chat/completions"
    },
    
    // Hugging Face Configuration
    huggingface: {
        apiKey: "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", // Replace with your API key
        model: "distilgpt2", // Smaller, more reliable model
        fallbackModels: ["gpt2", "microsoft/DialoGPT-small"], // Backup models
        apiUrl: "https://api-inference.huggingface.co/models/"
    },
    
    // OpenAI Configuration (Paid but reliable)
    openai: {
        apiKey: "placeholder", // Replace with your API key
        model: "gpt-4.1-nano", // Options: gpt-3.5-turbo, gpt-4
        apiUrl: "https://api.openai.com/v1/chat/completions"
    },
    
    // Anthropic Claude Configuration (Paid but good)
    anthropic: {
        apiKey: "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Replace with your API key
        model: "claude-3-haiku-20240307", // Options: claude-3-haiku, claude-3-sonnet, claude-3-opus
        apiUrl: "https://api.anthropic.com/v1/messages"
    },
    
    // General settings
    maxTokens: 500,
    temperature: 0.7,
    timeout: 30000 // 30 seconds timeout
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GPT_CONFIG;
}

// Test function to verify API connection
function testHuggingFaceConnection() {
    if (typeof GPT_CONFIG === 'undefined') {
        console.error('GPT_CONFIG not found');
        return;
    }
    
    var config = GPT_CONFIG.huggingface;
    var testUrl = config.apiUrl + "gpt2"; // Use a simple model for testing
    
    console.log('Testing Hugging Face connection to:', testUrl);
    
    fetch(testUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: "Hello",
            parameters: {
                max_length: 50,
                temperature: 0.7,
                do_sample: true
            }
        })
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    })
    .then(data => {
        console.log('Test successful! Response:', data);
    })
    .catch(error => {
        console.error('Test failed:', error);
    });
}

// Run test when page loads (remove this line after testing)
// testHuggingFaceConnection(); 