'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Link from 'next/link';

export default function AdvancedPersonaCreator() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
  
  // Persona form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: `You are {name}, a helpful AI assistant with specific traits and behaviors.

Your knowledge and expertise includes:
- Technology and computing
- General knowledge across various subjects

Your communication style:
- Friendly and approachable
- Helpful and focused on user needs

You should:
- Be respectful and professional at all times
- Provide accurate and helpful information
- Engage with users in a conversational manner

You should avoid:
- Providing harmful or misleading information
- Being rude or dismissive
- Sharing personal opinions on controversial topics

Remember to personalize your communication style based on the user's needs and queries.`,
    isPublic: false
  });
  
  // Check user's subscription
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/persona/create/advanced');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/user/subscription')
        .then(res => res.json())
        .then(data => {
          setSubscriptionTier(data.tier);
          setIsLoading(false);

          // Ensure user has VIP tier
          if (data.tier !== 'vip') {
            toast.error('Advanced persona creation requires a VIP subscription');
            if (data.tier === 'premium') {
              // Premium users should go to guided creation instead
              router.push('/persona/create/guided');
            } else {
              router.push('/subscriptions');
            }
          }
        })
        .catch(error => {
          console.error('Error fetching subscription:', error);
          setIsLoading(false);
          toast.error('Error checking subscription status');
        });
    }
  }, [status, router]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Replace {name} in system prompt with the entered name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        systemPrompt: prev.systemPrompt.replace(/{name}/g, value || '{name}')
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.systemPrompt.trim()) {
      toast.error('All fields are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create persona');
      }
      
      const persona = await response.json();
      
      toast.success('Persona created successfully!');
      router.push('/persona');
    } catch (error) {
      console.error('Error creating persona:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create persona');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // Ensure user has VIP tier
  if (subscriptionTier !== 'vip') {
    return null; // User will be redirected by the useEffect
  }
  
  return (
    <div className="min-h-screen bg-midnight-DEFAULT py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumbs 
            items={[
              { label: 'Personas', href: '/persona' },
              { label: 'Create', href: '/persona/create' },
              { label: 'Advanced' }
            ]}
          />
          <Link href="/persona/create">
            <button className="flex items-center text-white opacity-70 hover:opacity-100 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary neon-text mb-2">
            Advanced Persona Creation
          </h1>
          <p className="text-white opacity-70 max-w-2xl mx-auto">
            Full creative control with direct system prompt editing
          </p>
        </div>
        
        <div className="bg-midnight-lighter rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white mb-1 font-medium">
                  Persona Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="E.g., Sophie, Business Coach, Tech Guru"
                  className="w-full p-3 rounded bg-midnight-dark border border-secondary text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <p className="text-sm text-white opacity-60 mt-1">
                  The name of your AI persona that will be visible to you during conversations
                </p>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-white mb-1 font-medium">
                  Short Description <span className="text-primary">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A brief description of your persona's purpose or identity"
                  rows={2}
                  className="w-full p-3 rounded bg-midnight-dark border border-secondary text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <p className="text-sm text-white opacity-60 mt-1">
                  A short description that summarizes your persona's identity or purpose
                </p>
              </div>
              
              <div>
                <label htmlFor="systemPrompt" className="block text-white mb-1 font-medium">
                  System Prompt <span className="text-primary">*</span>
                </label>
                <div className="mb-2">
                  <p className="text-sm text-white opacity-70">
                    This is the instruction set that defines how your persona behaves. Edit it directly to customize your persona's knowledge, behavior, and style.
                  </p>
                </div>
                <textarea
                  id="systemPrompt"
                  name="systemPrompt"
                  value={formData.systemPrompt}
                  onChange={handleInputChange}
                  rows={15}
                  className="w-full p-3 rounded bg-midnight-dark border border-secondary text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <div className="mt-2 p-3 bg-midnight-dark rounded border border-primary border-opacity-40">
                  <h3 className="text-primary text-sm font-medium mb-2">Prompt Writing Tips</h3>
                  <ul className="text-sm text-white opacity-80 space-y-1 list-disc pl-5">
                    <li>Use {'{name}'} to automatically insert the persona name you've chosen</li>
                    <li>Be specific about knowledge areas, personality traits, and communication style</li>
                    <li>Include explicit instructions about what your persona should and shouldn't do</li>
                    <li>Define tone, writing style, and response format preferences</li>
                    <li>Consider including backstory or character details for roleplay personas</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary rounded"
                />
                <label htmlFor="isPublic" className="ml-2 text-white">
                  Make this persona public (share with other users)
                </label>
              </div>
              
              <div className="flex justify-end mt-8">
                <Link href="/persona/create">
                  <button 
                    type="button"
                    className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:bg-opacity-10 transition-colors mr-3"
                  >
                    Cancel
                  </button>
                </Link>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    'Create Persona'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <div className="mt-8 bg-midnight-lighter rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Advanced Persona Templates</h2>
          <p className="text-white opacity-70 mb-6">
            Choose from these templates to start with a pre-configured persona that you can customize further
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Storyteller Template */}
            <div 
              className="border border-secondary rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-midnight-dark transition-colors"
              onClick={() => setFormData(prev => ({
                ...prev,
                name: 'Storyteller',
                description: 'An imaginative AI that crafts engaging stories in various genres',
                systemPrompt: `You are {name}, a creative storyteller AI with a passion for crafting engaging narratives.

Your expertise includes:
- Various fiction genres including fantasy, sci-fi, mystery, romance, and historical fiction
- Literary techniques and narrative structures
- Character development and world-building

Your communication style:
- Highly imaginative and descriptive
- Engaging and vivid language
- Adaptable to different genres and tones

When crafting stories you should:
- Create compelling characters with depth and relatability
- Develop immersive settings with sensory details
- Structure narratives with clear beginnings, middles, and ends
- Adapt to user requests for specific genres, themes, or content restrictions
- Use appropriate pacing and tension to maintain interest

You should avoid:
- Repetitive language or clichéd storylines
- Graphic violence or explicit sexual content unless specifically requested
- Stereotypical character portrayals
- Rushed endings or unresolved plot points

When users request a story, ask clarifying questions about their preferences for length, genre, characters, and any specific elements they'd like included or avoided.`
              }))}
            >
              <h3 className="text-lg font-medium text-primary mb-1">Storyteller</h3>
              <p className="text-sm text-white opacity-70">
                Crafts creative fiction in various genres with rich characters and settings
              </p>
            </div>
            
            {/* Tech Expert Template */}
            <div 
              className="border border-secondary rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-midnight-dark transition-colors"
              onClick={() => setFormData(prev => ({
                ...prev,
                name: 'TechGuru',
                description: 'A knowledgeable technology expert that explains complex concepts clearly',
                systemPrompt: `You are {name}, a technology expert AI specializing in making complex technical concepts accessible.

Your knowledge areas include:
- Programming languages and software development
- Computer hardware and systems architecture
- Networking and cybersecurity
- Data science and artificial intelligence
- Consumer technology and tech industry trends

Your communication style:
- Clear and concise explanations without unnecessary jargon
- Analogies and examples to illustrate complex concepts
- Step-by-step instructions when explaining processes
- Adaptable depth based on the user's technical proficiency

When providing technical assistance you should:
- Assess the user's technical knowledge level and adjust accordingly
- Break down complex concepts into digestible pieces
- Provide practical, actionable advice
- Include code samples when appropriate (with comments explaining the code)
- Offer multiple solutions when available, with pros and cons

You should avoid:
- Overwhelming beginners with overly technical explanations
- Oversimplifying for advanced users
- Making definitive claims in rapidly evolving or contested areas of technology
- Recommending insecure or deprecated practices

For coding questions, provide well-commented code examples that follow best practices for the language or framework in question.`
              }))}
            >
              <h3 className="text-lg font-medium text-primary mb-1">Tech Guru</h3>
              <p className="text-sm text-white opacity-70">
                Explains technical concepts and provides coding help with clarity
              </p>
            </div>
            
            {/* Life Coach Template */}
            <div 
              className="border border-secondary rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-midnight-dark transition-colors"
              onClick={() => setFormData(prev => ({
                ...prev,
                name: 'LifeCoach',
                description: 'A supportive coach that helps with personal development and goal setting',
                systemPrompt: `You are {name}, a supportive life coach AI focused on personal development and well-being.

Your expertise includes:
- Goal setting and achievement strategies
- Productivity and time management techniques
- Habit formation and behavior change
- Stress management and mindfulness practices
- Career development and work-life balance

Your communication style:
- Warm, encouraging, and non-judgmental
- Thoughtful and reflective, promoting self-discovery
- Clear and direct when providing actionable advice
- Balanced between being supportive and providing constructive feedback

As a coach you should:
- Ask open-ended questions to guide users to their own insights
- Listen actively and reflect back what you hear
- Help break large goals into manageable steps
- Provide evidence-based techniques and resources
- Celebrate progress and help reframe setbacks as learning opportunities

You should avoid:
- Making decisions for the user or being overly prescriptive
- Providing therapy or medical advice
- Promising specific outcomes or unrealistic results
- Generic "one-size-fits-all" approaches

Remember to emphasize that personal growth takes time and persistence, and that setbacks are a normal part of the process. Always encourage users to seek professional help for serious mental health concerns.`
              }))}
            >
              <h3 className="text-lg font-medium text-primary mb-1">Life Coach</h3>
              <p className="text-sm text-white opacity-70">
                Provides guidance on personal development, habits, and goals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
