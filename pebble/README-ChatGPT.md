# Large Language Model Integration for Pebble Chat

This feature allows users to interact with real large language models directly in the chat by typing `!gpt` followed by their message.

## Features

- **Context-Aware**: The AI receives the last 10 messages as context for better responses
- **Real-time**: Responses appear in the chat as if the AI is a user
- **Multiple LLM Providers**: Support for Hugging Face (free), OpenAI, and Anthropic Claude
- **Rate Limited**: Respects existing chat moderation (muted users, slow mode, etc.)

## Setup Instructions

### 1. Choose Your LLM Provider

**Option 1: Together.ai (Recommended - reliable and affordable)**
- Sign up at [Together.ai](https://together.ai/)
- Get your API key from [API Keys](https://together.ai/account/api-keys)
- Pay per use: Very affordable rates for open-source models
- Models: Llama-2, CodeLlama, Mistral, and many more

**Option 2: Hugging Face (Free tier available)**
- Sign up at [Hugging Face](https://huggingface.co/)
- Get your API key from [Settings > Tokens](https://huggingface.co/settings/tokens)
- Free tier: 30,000 requests/month

**Option 3: OpenAI (Paid but reliable)**
- Sign up at [OpenAI Platform](https://platform.openai.com/)
- Get your API key from [API Keys](https://platform.openai.com/api-keys)
- Pay per use: ~$0.002 per 1K tokens

**Option 4: Anthropic Claude (Paid but good)**
- Sign up at [Anthropic](https://www.anthropic.com/)
- Get your API key from [Console](https://console.anthropic.com/)
- Pay per use: ~$0.003 per 1K tokens

### 2. Configure Your API Key

1. Edit `gpt-config.js` in the `pebble/` directory
2. Set your preferred provider: `provider: "togetherai"`
3. Add your API key to the corresponding section
4. Save the file

**Example for Together.ai:**
```javascript
provider: "togetherai",
togetherai: {
    apiKey: "your_actual_api_key_here",
    model: "meta-llama/Llama-2-7b-chat-hf"
}
```

### 3. Test the Integration

Type `!gpt Hello!` in your chat to test the connection.

### 3. Usage

**Basic Commands:**
- `!gpt [message]` - Ask the AI a question
- `!gpt Hello, how are you?` - Get AI response
- `!gpt What's the weather like?` - Get AI assistance
- `!gpt Can you help me with math?` - Get AI help

**Admin Commands (Admin Level > 5000):**
- `!setPrompt [new prompt]` - Change the AI's personality/behavior
- `!resetPrompt` - Reset to default villain personality
- `!getPrompt` - View current system prompt (anyone can use)

**Examples:**
- `!setPrompt You are a friendly robot who loves helping people and always speaks in a cheerful tone.`
- `!setPrompt You are a wise old wizard who speaks in riddles and gives cryptic advice.`
- `!setPrompt You are a pirate captain who always talks about treasure and adventure.`

## How It Works

1. **Command Detection**: When a user types `!gpt [message]`, the system detects the command
2. **Context Gathering**: The system collects the last 10 chat messages (excluding system messages)
3. **Intelligent Response Generation**: The AI analyzes the message and context to generate relevant responses
4. **Response Display**: The AI's response appears in the chat as a message from `[GPT]`

## Security Features

- **Local Processing**: All responses are generated locally, no external API calls
- **Input Validation**: Messages are sanitized and validated
- **Rate Limiting**: Respects existing chat moderation systems
- **User Permissions**: Muted or timed-out users cannot use the feature

## Customization

### Change AI Personality (Admin Only)
Use the `!setPrompt` command to change the AI's behavior:
```bash
!setPrompt You are a friendly robot who loves helping people and always speaks in a cheerful tone.
!setPrompt You are a wise old wizard who speaks in riddles and gives cryptic advice.
!setPrompt You are a pirate captain who always talks about treasure and adventure.
!setPrompt You are a grumpy old man who complains about everything and gives sarcastic advice.
```

### Reset to Default
Use `!resetPrompt` to return to the default villain personality.

### View Current Prompt
Use `!getPrompt` to see what personality the AI currently has.

### Change Context Length
Modify the `maxContextMessages` variable in the `getChatContext` function:
```javascript
var maxContextMessages = 15; // Change from 10 to desired number
```

### Advanced Customization
For developers, you can modify the `getSystemPrompt()` function in `pebble.js` to change the default prompt that gets used when no custom prompt is set.

## Troubleshooting

### Common Issues

1. **"AI responses seem generic"**
   - Use `!getPrompt` to check the current personality
   - Use `!setPrompt` to give the AI a more specific personality
   - Try being more specific in your questions

2. **"Can't change the prompt"**
   - You need admin level > 5000 to use `!setPrompt`
   - Use `!getPrompt` to view the current prompt
   - Contact an admin if you need changes

3. **"Responses are too slow"**
   - The AI has a 1.5-3.5 second "thinking" delay for realism
   - This is normal behavior to simulate AI processing

### Tips for Better Responses

- **Be specific**: Instead of "help me", try "help me with math homework"
- **Use context**: The AI remembers recent chat messages
- **Experiment**: Try different personalities with `!setPrompt`
- **Reset if needed**: Use `!resetPrompt` to return to default villain personality

## Cost Considerations

**Together.ai (Recommended):**
- Very affordable rates for open-source models
- Llama-2-7b: ~$0.0002 per 1K tokens
- CodeLlama-7b: ~$0.0002 per 1K tokens
- High quality, reliable service

**Hugging Face (Free Tier):**
- 30,000 requests per month completely free
- No credit card required
- Perfect for testing and small communities

**OpenAI (Paid):**
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- Pay only for what you use

**Anthropic Claude (Paid):**
- Claude-3-Haiku: ~$0.003 per 1K tokens
- Claude-3-Sonnet: ~$0.015 per 1K tokens
- High quality responses

**Token Usage:**
- Each message typically uses 50-200 tokens
- Context messages increase token usage
- Monitor usage in your provider's dashboard

## Future Enhancements

- **Conversation Memory**: Store conversation history for longer context
- **User Preferences**: Allow users to customize AI behavior
- **Response Variety**: Add more response patterns and contextual awareness
- **Custom Responses**: Allow admins to add custom response patterns
- **Learning System**: Improve responses based on chat patterns 