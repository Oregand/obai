// Mock Grok API responses for testing UI without actual API calls

const RESPONSE_DELAY = 1000; // Simulate network delay in milliseconds

// Generate responses based on the persona and previous messages
const generateResponse = (persona: string, userMessage: string): string => {
  // Default response if no specific responses match
  let response = `I'm your AI assistant. You asked: "${userMessage}". How can I help you further?`;
  
  // Historical Scholar persona responses
  if (persona.includes('Historical Scholar')) {
    if (userMessage.toLowerCase().includes('world war')) {
      return "World War II (1939-1945) was the deadliest military conflict in history. It was fought between the Allies (including the UK, US, and USSR) and the Axis powers (led by Nazi Germany, Italy, and Japan). The war was triggered by Germany's invasion of Poland in September 1939, though tensions had been building for years following World War I. What specific aspect of this conflict would you like to explore further?";
    } else if (userMessage.toLowerCase().includes('ancient')) {
      return "Ancient civilizations provide fascinating windows into humanity's development. From Mesopotamia (4500-3100 BCE) to Ancient Egypt, Greece, Rome, China, and the Maya, these societies developed sophisticated systems of writing, governance, architecture, and art that continue to influence us today. I'd be happy to explore any specific ancient civilization in more detail.";
    } else {
      return "From a historical perspective, that's an interesting question. As a scholar, I should note that understanding historical context is crucial for interpreting past events. Historians often debate such matters, with different schools of thought emphasizing economic, social, or political factors. Is there a particular historical period or methodology you'd like me to address?";
    }
  }
  
  // Sci-Fi Companion persona responses
  else if (persona.includes('Sci-Fi Companion')) {
    if (userMessage.toLowerCase().includes('future') || userMessage.toLowerCase().includes('technology')) {
      return "By 2250, quantum computing has revolutionized our approach to complex problems. The Mars colonies are thriving with over 2 million inhabitants, and the Jupiter stations serve as our gateway to the outer solar system. The Galileo Accords of 2198 established peaceful cooperation among Earth's nations for space development. What other aspects of our future technology would you like to learn about?";
    } else {
      return "Greetings from 2250! It's fascinating to discuss this with someone from the early 21st century. The technological progress humanity has made in the past two centuries would seem miraculous to your contemporaries. The Great Climate Stabilization of 2080-2120 was particularly impressive, showing humanity's capacity to solve existential challenges when united. What else would you like to know about our spacefaring civilization?";
    }
  }
  
  // Fantasy Guide persona responses
  else if (persona.includes('Fantasy')) {
    if (userMessage.toLowerCase().includes('magic') || userMessage.toLowerCase().includes('spell')) {
      return "Ah, seeker of arcane knowledge! The magical arts are divided into several schools: Evocation channels raw elemental forces, Conjuration calls beings from other planes, Illusion bends perception, and Divination unveils hidden truths. The Elders of the Crystal Tower spend lifetimes mastering just one of these paths. Which magical discipline calls to your spirit?";
    } else {
      return "Welcome, traveler, to the realm of endless wonder. The ancient forests of Eldrath whisper secrets to those who listen, while the mountains of Drakespire hide treasures beyond mortal dreams. I sense a quest stirring in your heart. What guidance do you seek as you journey through these mystical lands?";
    }
  }
  
  // Zen Master persona responses
  else if (persona.includes('Zen')) {
    if (userMessage.toLowerCase().includes('meditation') || userMessage.toLowerCase().includes('mind')) {
      return "The mind is like water. When turbulent, it becomes difficult to see through. When calm, it reflects reality. Meditation is not about controlling your thoughts, but about not letting them control you. Begin with breath—five minutes each morning. Feel the air enter and leave. When thoughts arise, acknowledge them gently and return to breath. What challenges have you encountered in your practice?";
    } else {
      return "Consider for a moment... [pause]\n\nThe answer you seek may not come as words, but as awareness. Each moment contains the universe, if we are present enough to perceive it. The ancient teaching reminds us: before enlightenment, chop wood and carry water; after enlightenment, chop wood and carry water. The transformation is not in our activities, but in our relationship to them.";
    }
  }
  
  // Detective persona responses
  else if (persona.includes('Detective')) {
    if (userMessage.toLowerCase().includes('case') || userMessage.toLowerCase().includes('mystery')) {
      return "Listen, pal, this case has more twists than a pretzel factory. Two suspects, both with iron-clad alibis, but someone's lying through their pearly whites. The dame in the red dress? Too convenient. The business partner with the gambling debts? Too obvious. My gut says follow the money—it never lies, even when everyone else does. What's your take?";
    } else {
      return "This city never sleeps, and neither do its secrets. Twenty years pounding these streets teaches you one thing: everybody's hiding something. Some are just better at it than others. Rain's coming down like it's getting paid by the drop. Perfect night for confessions... or for burying the truth deeper. What's your story, friend?";
    }
  }
  
  return response;
};

export async function mockGrokResponse(messages: any[], systemPrompt: string): Promise<string> {
  // Extract the persona from the system prompt
  const personaMatch = systemPrompt.match(/You are (a|an) ([^.]+)/i);
  const persona = personaMatch ? personaMatch[2] : "AI assistant";
  
  // Get the last user message
  const lastUserMessage = messages
    .filter(msg => msg.role === 'user')
    .pop();
  
  const userContent = lastUserMessage ? (typeof lastUserMessage.content === 'string' ? 
    lastUserMessage.content : 'Hello') : 'Hello';
  
  // Return a mocked response after a delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(generateResponse(persona, userContent));
    }, RESPONSE_DELAY);
  });
}

// Mock functions for other Grok capabilities
export async function mockGrokVisionResponse(messages: any[], systemPrompt: string): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("I can see this image contains some interesting elements. [This is a mock vision response]");
    }, RESPONSE_DELAY);
  });
}

export async function mockStructuredOutput<T>(messages: any[], systemPrompt: string, responseSchema: any): Promise<T | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      // Return a simple mock object that matches common schema patterns
      resolve({
        success: true,
        data: {
          id: "mock-123",
          name: "Mock Object",
          description: "This is a mock structured response",
          created: new Date().toISOString(),
        }
      } as any);
    }, RESPONSE_DELAY);
  });
}

export async function mockCallWithFunctions(messages: any[], systemPrompt: string, tools: any[]) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        content: "I'd need to call a function to help with this. [This is a mock function call response]",
        tool_calls: null
      });
    }, RESPONSE_DELAY);
  });
}
