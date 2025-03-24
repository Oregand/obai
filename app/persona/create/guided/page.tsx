'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Link from 'next/link';

// Persona traits and options
const PERSONA_TRAITS = {
  personality: [
    { id: 'friendly', label: 'Friendly', description: 'Warm, welcoming, and approachable' },
    { id: 'professional', label: 'Professional', description: 'Formal, business-like, and focused' },
    { id: 'creative', label: 'Creative', description: 'Imaginative, artistic, and original' },
    { id: 'analytical', label: 'Analytical', description: 'Logical, detailed, and data-driven' },
    { id: 'humorous', label: 'Humorous', description: 'Funny, witty, and entertaining' },
    { id: 'caring', label: 'Caring', description: 'Empathetic, supportive, and understanding' },
  ],
  knowledge: [
    { id: 'tech', label: 'Technology', description: 'Computing, programming, and digital trends' },
    { id: 'business', label: 'Business', description: 'Finance, management, and entrepreneurship' },
    { id: 'science', label: 'Science', description: 'Natural sciences, research, and discoveries' },
    { id: 'arts', label: 'Arts & Humanities', description: 'Literature, philosophy, and creative arts' },
    { id: 'health', label: 'Health & Wellness', description: 'Medicine, fitness, and well-being' },
    { id: 'general', label: 'General Knowledge', description: 'Broad knowledge across many subjects' },
  ],
  tone: [
    { id: 'casual', label: 'Casual', description: 'Relaxed, conversational, and informal' },
    { id: 'formal', label: 'Formal', description: 'Polished, structured, and proper' },
    { id: 'enthusiastic', label: 'Enthusiastic', description: 'Excited, passionate, and energetic' },
    { id: 'calm', label: 'Calm', description: 'Composed, balanced, and serene' },
    { id: 'direct', label: 'Direct', description: 'Straightforward, concise, and to-the-point' },
    { id: 'poetic', label: 'Poetic', description: 'Lyrical, expressive, and vivid' },
  ],
  responseStyle: [
    { id: 'concise', label: 'Concise', description: 'Brief, efficient, and to the point' },
    { id: 'detailed', label: 'Detailed', description: 'Comprehensive, thorough, and in-depth' },
    { id: 'step-by-step', label: 'Step-by-Step', description: 'Sequential, methodical, and procedural' },
    { id: 'conversational', label: 'Conversational', description: 'Dialogue-oriented with natural flow' },
    { id: 'educational', label: 'Educational', description: 'Informative, instructional, and explanatory' },
    { id: 'story-like', label: 'Story-like', description: 'Narrative, descriptive, with examples' },
  ],
  rolePlay: [
    { id: 'none', label: 'None', description: 'No specific role or character' },
    { id: 'guide', label: 'Guide/Mentor', description: 'Helpful advisor and teacher' },
    { id: 'assistant', label: 'Personal Assistant', description: 'Efficient and supportive aide' },
    { id: 'expert', label: 'Subject Expert', description: 'Authority in a specific field' },
    { id: 'friend', label: 'Friend', description: 'Casual and supportive companion' },
    { id: 'character', label: 'Fictional Character', description: 'Unique persona with distinct traits' },
  ]
};

// Helper function to generate system prompt from selected traits
function generateSystemPrompt(selections: any, freeformInputs: any) {
  let prompt = `You are ${freeformInputs.name}, ${freeformInputs.description}\n\n`;
  
  // Add personality traits
  if (selections.personality.length > 0) {
    prompt += "Personality: You are ";
    prompt += selections.personality.map((id: string) => 
      PERSONA_TRAITS.personality.find(trait => trait.id === id)?.label.toLowerCase()
    ).join(", ") + ".\n";
  }
  
  // Add knowledge areas
  if (selections.knowledge.length > 0) {
    prompt += "Knowledge: You are knowledgeable about ";
    prompt += selections.knowledge.map((id: string) => 
      PERSONA_TRAITS.knowledge.find(trait => trait.id === id)?.label.toLowerCase()
    ).join(", ") + ".\n";
  }
  
  // Add tone
  if (selections.tone.length > 0) {
    prompt += "Communication style: Your tone is ";
    prompt += selections.tone.map((id: string) => 
      PERSONA_TRAITS.tone.find(trait => trait.id === id)?.label.toLowerCase()
    ).join(", ") + ".\n";
  }
  
  // Add response style
  if (selections.responseStyle.length > 0) {
    prompt += "Response structure: You provide ";
    prompt += selections.responseStyle.map((id: string) => 
      PERSONA_TRAITS.responseStyle.find(trait => trait.id === id)?.label.toLowerCase()
    ).join(", ") + " responses.\n";
  }
  
  // Add role play aspect
  if (selections.rolePlay.length > 0 && !selections.rolePlay.includes('none')) {
    prompt += "Role: You embody the role of ";
    prompt += selections.rolePlay.map((id: string) => {
      const role = PERSONA_TRAITS.rolePlay.find(trait => trait.id === id);
      return role && role.id !== 'none' ? role.label.toLowerCase() : null;
    }).filter(Boolean).join(", ") + ".\n";
  }
  
  // Add custom instructions
  if (freeformInputs.additionalInstructions.trim()) {
    prompt += "\nAdditional instructions: " + freeformInputs.additionalInstructions.trim();
  }
  
  return prompt;
}

export default function GuidedPersonaCreator() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
  const [step, setStep] = useState(1);
  const [previewingPrompt, setPreviewingPrompt] = useState(false);
  
  // Selected traits
  const [selections, setSelections] = useState({
    personality: [] as string[],
    knowledge: [] as string[],
    tone: [] as string[],
    responseStyle: [] as string[],
    rolePlay: [] as string[]
  });
  
  // Freeform inputs
  const [freeformInputs, setFreeformInputs] = useState({
    name: '',
    description: '',
    additionalInstructions: '',
  });
  
  // Generated system prompt
  const [systemPrompt, setSystemPrompt] = useState('');
  
  // Check user's subscription
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/persona/create/guided');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/user/subscription')
        .then(res => res.json())
        .then(data => {
          setSubscriptionTier(data.tier);
          setIsLoading(false);

          // Ensure user has at least premium tier
          if (data.tier === 'free' || data.tier === 'basic') {
            toast.error('Guided persona creation requires at least a premium subscription');
            router.push('/subscriptions');
          } else {
            // Premium or VIP users can access this page
            // No redirect needed
          }
        })
        .catch(error => {
          console.error('Error fetching subscription:', error);
          setIsLoading(false);
          toast.error('Error checking subscription status');
        });
    }
  }, [status, router]);
  
  // Handle selecting/deselecting traits
  const toggleTrait = (category: string, traitId: string) => {
    setSelections(prev => {
      const currentSelections = [...prev[category]];
      
      // If trait is already selected, remove it
      if (currentSelections.includes(traitId)) {
        return {
          ...prev,
          [category]: currentSelections.filter(id => id !== traitId)
        };
      }
      
      // Special case for rolePlay - only allow one selection
      if (category === 'rolePlay') {
        return {
          ...prev,
          [category]: [traitId]
        };
      }
      
      // For other categories, limit to 3 selections
      if (currentSelections.length < 3) {
        return {
          ...prev,
          [category]: [...currentSelections, traitId]
        };
      }
      
      return prev;
    });
  };
  
  // Handle freeform input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFreeformInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Preview the generated system prompt
  const handlePreviewPrompt = () => {
    const generatedPrompt = generateSystemPrompt(selections, freeformInputs);
    setSystemPrompt(generatedPrompt);
    setPreviewingPrompt(true);
  };
  
  // Create the persona
  const handleCreatePersona = async () => {
    if (!freeformInputs.name.trim() || !freeformInputs.description.trim()) {
      toast.error('Name and description are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: freeformInputs.name,
          description: freeformInputs.description,
          systemPrompt: systemPrompt,
          isPublic: false
        })
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
  
  // Go back to previous step
  const goBack = () => {
    if (previewingPrompt) {
      setPreviewingPrompt(false);
    } else if (step > 1) {
      setStep(step - 1);
    } else {
      router.push('/persona/create');
    }
  };
  
  // Go to next step
  const goNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handlePreviewPrompt();
    }
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // Ensure user has at least premium tier
  if (subscriptionTier === 'free' || subscriptionTier === 'basic') {
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
              { label: 'Guided' }
            ]}
          />
          <button 
            onClick={goBack}
            className="flex items-center text-white opacity-70 hover:opacity-100 hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary neon-text mb-2">
            Guided Persona Creation
          </h1>
          <p className="text-white opacity-70 max-w-2xl mx-auto">
            Build your custom persona by selecting traits and characteristics
          </p>
        </div>
        
        {/* Progress indicator */}
        {!previewingPrompt && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>Basic Info</span>
              <span className={`text-sm ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>Personality & Knowledge</span>
              <span className={`text-sm ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>Communication Style</span>
            </div>
            <div className="h-2 bg-midnight-lighter rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Step content */}
        <div className="bg-midnight-lighter rounded-lg shadow-lg p-6">
          {!previewingPrompt ? (
            <>
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-white mb-1">
                        Persona Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={freeformInputs.name}
                        onChange={handleInputChange}
                        placeholder="E.g., Sophie, Business Coach, Tech Guru"
                        className="w-full p-2 rounded bg-midnight-dark border border-secondary text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-white mb-1">
                        Short Description <span className="text-primary">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={freeformInputs.description}
                        onChange={handleInputChange}
                        placeholder="A brief description of your persona's purpose or identity"
                        rows={3}
                        className="w-full p-2 rounded bg-midnight-dark border border-secondary text-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Personality & Knowledge */}
              {step === 2 && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Personality Traits</h2>
                    <p className="text-white opacity-70 mb-4">Select up to 3 personality traits for your persona</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PERSONA_TRAITS.personality.map(trait => (
                        <div 
                          key={trait.id}
                          onClick={() => toggleTrait('personality', trait.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selections.personality.includes(trait.id)
                              ? 'bg-primary bg-opacity-20 border border-primary'
                              : 'bg-midnight-dark hover:bg-midnight border border-midnight-dark'
                          }`}
                        >
                          <div className="flex items-start">
                            <input 
                              type="checkbox"
                              checked={selections.personality.includes(trait.id)}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                            />
                            <div className="ml-3">
                              <h3 className="text-white font-medium">{trait.label}</h3>
                              <p className="text-sm text-white opacity-70">{trait.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Knowledge Areas</h2>
                    <p className="text-white opacity-70 mb-4">Select up to 3 areas of expertise for your persona</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PERSONA_TRAITS.knowledge.map(trait => (
                        <div 
                          key={trait.id}
                          onClick={() => toggleTrait('knowledge', trait.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selections.knowledge.includes(trait.id)
                              ? 'bg-primary bg-opacity-20 border border-primary'
                              : 'bg-midnight-dark hover:bg-midnight border border-midnight-dark'
                          }`}
                        >
                          <div className="flex items-start">
                            <input 
                              type="checkbox"
                              checked={selections.knowledge.includes(trait.id)}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                            />
                            <div className="ml-3">
                              <h3 className="text-white font-medium">{trait.label}</h3>
                              <p className="text-sm text-white opacity-70">{trait.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Communication Style */}
              {step === 3 && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Tone</h2>
                    <p className="text-white opacity-70 mb-4">Select up to 3 tone traits for your persona</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PERSONA_TRAITS.tone.map(trait => (
                        <div 
                          key={trait.id}
                          onClick={() => toggleTrait('tone', trait.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selections.tone.includes(trait.id)
                              ? 'bg-primary bg-opacity-20 border border-primary'
                              : 'bg-midnight-dark hover:bg-midnight border border-midnight-dark'
                          }`}
                        >
                          <div className="flex items-start">
                            <input 
                              type="checkbox"
                              checked={selections.tone.includes(trait.id)}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                            />
                            <div className="ml-3">
                              <h3 className="text-white font-medium">{trait.label}</h3>
                              <p className="text-sm text-white opacity-70">{trait.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Response Style</h2>
                    <p className="text-white opacity-70 mb-4">Select up to 3 response styles for your persona</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PERSONA_TRAITS.responseStyle.map(trait => (
                        <div 
                          key={trait.id}
                          onClick={() => toggleTrait('responseStyle', trait.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selections.responseStyle.includes(trait.id)
                              ? 'bg-primary bg-opacity-20 border border-primary'
                              : 'bg-midnight-dark hover:bg-midnight border border-midnight-dark'
                          }`}
                        >
                          <div className="flex items-start">
                            <input 
                              type="checkbox"
                              checked={selections.responseStyle.includes(trait.id)}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                            />
                            <div className="ml-3">
                              <h3 className="text-white font-medium">{trait.label}</h3>
                              <p className="text-sm text-white opacity-70">{trait.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Character Role</h2>
                    <p className="text-white opacity-70 mb-4">Select a role for your persona (optional)</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PERSONA_TRAITS.rolePlay.map(trait => (
                        <div 
                          key={trait.id}
                          onClick={() => toggleTrait('rolePlay', trait.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selections.rolePlay.includes(trait.id)
                              ? 'bg-primary bg-opacity-20 border border-primary'
                              : 'bg-midnight-dark hover:bg-midnight border border-midnight-dark'
                          }`}
                        >
                          <div className="flex items-start">
                            <input 
                              type="radio"
                              checked={selections.rolePlay.includes(trait.id)}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                            />
                            <div className="ml-3">
                              <h3 className="text-white font-medium">{trait.label}</h3>
                              <p className="text-sm text-white opacity-70">{trait.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Additional Instructions</h2>
                    <p className="text-white opacity-70 mb-4">Any specific instructions or details for your persona (optional)</p>
                    
                    <textarea
                      id="additionalInstructions"
                      name="additionalInstructions"
                      value={freeformInputs.additionalInstructions}
                      onChange={handleInputChange}
                      placeholder="Additional details, behaviors, or knowledge to include..."
                      rows={4}
                      className="w-full p-2 rounded bg-midnight-dark border border-secondary text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={goBack}
                  className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  {step === 1 ? 'Cancel' : 'Previous'}
                </button>
                
                <button
                  onClick={goNext}
                  disabled={step === 1 && (!freeformInputs.name.trim() || !freeformInputs.description.trim())}
                  className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step === 3 ? 'Preview Persona' : 'Next'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Prompt Preview */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Preview Generated Persona</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">Persona Details</h3>
                  </div>
                  
                  <div className="bg-midnight-dark p-4 rounded-lg mb-4">
                    <div className="mb-2">
                      <span className="text-white opacity-70">Name:</span>
                      <span className="text-white ml-2">{freeformInputs.name}</span>
                    </div>
                    <div>
                      <span className="text-white opacity-70">Description:</span>
                      <span className="text-white ml-2">{freeformInputs.description}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {Object.entries(selections).map(([category, selected]) => {
                      if (selected.length === 0 || (category === 'rolePlay' && selected.includes('none'))) {
                        return null;
                      }
                      
                      const categoryTitle = {
                        personality: 'Personality',
                        knowledge: 'Knowledge Areas',
                        tone: 'Tone',
                        responseStyle: 'Response Style',
                        rolePlay: 'Character Role'
                      }[category];
                      
                      const traits = selected.map(id => {
                        return PERSONA_TRAITS[category].find(trait => trait.id === id)?.label;
                      }).filter(Boolean);
                      
                      return (
                        <div key={category} className="bg-midnight-dark p-4 rounded-lg">
                          <h4 className="text-white opacity-70 mb-2">{categoryTitle}:</h4>
                          <div className="flex flex-wrap gap-2">
                            {traits.map(trait => (
                              <span key={trait} className="bg-primary bg-opacity-20 text-primary px-2 py-1 rounded text-sm">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">System Prompt</h3>
                  <div className="bg-midnight-dark p-4 rounded-lg whitespace-pre-wrap text-white font-mono text-sm">
                    {systemPrompt}
                  </div>
                  <p className="text-sm text-white opacity-70 mt-2">
                    This is the system prompt that will be used to instruct the AI how to behave as your persona.
                  </p>
                </div>
                
                {/* Create/Back buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setPreviewingPrompt(false)}
                    className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    Back to Edit
                  </button>
                  
                  <button
                    onClick={handleCreatePersona}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
