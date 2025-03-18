import { 
  generateGrokResponse, 
  generateGrokVisionResponse, 
  generateStructuredOutput, 
  callWithFunctions 
} from './grok';

import { 
  mockGrokResponse, 
  mockGrokVisionResponse, 
  mockStructuredOutput, 
  mockCallWithFunctions 
} from './mock/mockGrok';

// Set to true to use mock responses, false to use real API
const USE_MOCK_RESPONSES = process.env.USE_MOCK_API === 'true';

// Wrapper functions that either call the real API or return mock responses
export async function getAIResponse(messages: any[], systemPrompt: string): Promise<string> {
  return USE_MOCK_RESPONSES
    ? mockGrokResponse(messages, systemPrompt)
    : generateGrokResponse(messages, systemPrompt);
}

export async function getVisionResponse(messages: any[], systemPrompt: string): Promise<string> {
  return USE_MOCK_RESPONSES
    ? mockGrokVisionResponse(messages, systemPrompt)
    : generateGrokVisionResponse(messages, systemPrompt);
}

export async function getStructuredOutput<T>(messages: any[], systemPrompt: string, responseSchema: any): Promise<T | null> {
  return USE_MOCK_RESPONSES
    ? mockStructuredOutput<T>(messages, systemPrompt, responseSchema)
    : generateStructuredOutput<T>(messages, systemPrompt, responseSchema);
}

export async function getFunctionCallResult(messages: any[], systemPrompt: string, tools: any[], toolChoice: string | object = 'auto') {
  return USE_MOCK_RESPONSES
    ? mockCallWithFunctions(messages, systemPrompt, tools)
    : callWithFunctions(messages, systemPrompt, tools, toolChoice);
}
