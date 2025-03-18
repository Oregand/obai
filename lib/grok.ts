import axios from 'axios';

interface Message {
  role: string;
  content: string | Array<{ type: string; [key: string]: any }>;
}

export async function generateGrokResponse(messages: Message[], systemPrompt: string): Promise<string> {
  try {
    // Check for API key and URL
    if (!process.env.GROK_API_KEY || !process.env.GROK_API_URL) {
      console.error('Missing Grok API credentials');
      return "I'm sorry, the AI service is currently unavailable. Please try again later.";
    }

    // Format the messages for Grok API
    const formattedMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ];

    // Make the API request
    const response = await axios.post(
      process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions',
      {
        messages: formattedMessages,
        model: 'grok-2-latest',      // Default to latest Grok 2 model
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        },
      }
    );

    // Return the response
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      console.error('Unexpected Grok API response structure:', response.data);
      return "I'm sorry, I couldn't generate a proper response. Please try again.";
    }
  } catch (error) {
    console.error('Error calling Grok API:', error);
    return "I'm sorry, there was an error generating a response. Please try again later.";
  }
}

// Function for Vision models (image understanding)
export async function generateGrokVisionResponse(
  messages: Array<{
    role: string;
    content: Array<{ type: string; [key: string]: any }>;
  }>,
  systemPrompt: string
): Promise<string> {
  try {
    if (!process.env.GROK_API_KEY || !process.env.GROK_API_URL) {
      console.error('Missing Grok API credentials');
      return "I'm sorry, the AI service is currently unavailable. Please try again later.";
    }

    // Add system prompt
    const formattedMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ];

    const response = await axios.post(
      process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions',
      {
        messages: formattedMessages,
        model: 'grok-2-vision-latest',  // Use vision model
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      console.error('Unexpected Grok Vision API response structure:', response.data);
      return "I'm sorry, I couldn't analyze the image properly. Please try again.";
    }
  } catch (error) {
    console.error('Error calling Grok Vision API:', error);
    return "I'm sorry, there was an error processing the image. Please try again later.";
  }
}

// Function for structured outputs
export async function generateStructuredOutput<T>(
  messages: Message[],
  systemPrompt: string,
  responseSchema: any
): Promise<T | null> {
  try {
    if (!process.env.GROK_API_KEY || !process.env.GROK_API_URL) {
      console.error('Missing Grok API credentials');
      return null;
    }

    const formattedMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ];

    // For structured outputs, we'll implement a custom solution
    // Since beta.chat.completions.parse isn't available in direct API calls
    const response = await axios.post(
      process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions',
      {
        messages: [
          ...formattedMessages,
          {
            role: 'system',
            content: `Please provide the response in valid JSON format following this schema: ${JSON.stringify(responseSchema)}`
          }
        ],
        model: 'grok-2-latest',
        temperature: 0.1,  // Lower temperature for more structured response
        max_tokens: 2048,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      try {
        // Extract JSON from the response
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/```\n([\s\S]*?)\n```/) ||
                         content.match(/\{[\s\S]*\}/);
                         
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
        return JSON.parse(jsonString) as T;
      } catch (parseError) {
        console.error('Error parsing structured response:', parseError);
        return null;
      }
    } else {
      console.error('Unexpected Grok API response structure:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error calling Grok API for structured output:', error);
    return null;
  }
}

// Function to implement function calling capabilities
export async function callWithFunctions(
  messages: Message[],
  systemPrompt: string,
  tools: any[],
  toolChoice: string | object = 'auto'
) {
  try {
    if (!process.env.GROK_API_KEY || !process.env.GROK_API_URL) {
      console.error('Missing Grok API credentials');
      return {
        content: "I'm sorry, the AI service is currently unavailable. Please try again later.",
        tool_calls: null
      };
    }

    const formattedMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages
    ];

    const response = await axios.post(
      process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions',
      {
        messages: formattedMessages,
        model: 'grok-2-latest',
        temperature: 0.7,
        max_tokens: 2048,
        tools: tools,
        tool_choice: toolChoice,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const message = response.data.choices[0].message;
      return {
        content: message.content,
        tool_calls: message.tool_calls || null
      };
    } else {
      console.error('Unexpected Grok API response structure:', response.data);
      return {
        content: "I'm sorry, I couldn't generate a proper response. Please try again.",
        tool_calls: null
      };
    }
  } catch (error) {
    console.error('Error calling Grok API with function calling:', error);
    return {
      content: "I'm sorry, there was an error generating a response. Please try again later.",
      tool_calls: null
    };
  }
}
