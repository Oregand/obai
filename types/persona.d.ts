export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  imageUrl: string | null;
  isPublic: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
  dominanceLevel: number;
  exclusivityMultiplier: number;
}

export interface PersonaAnalytics {
  personaId: string;
  name: string;
  imageUrl?: string | null;
  description: string;
  usageCount: number;
  uniqueUsers: number;
  messageCount: number;
  avgSessionDuration: number;
}

export interface PersonaTrait {
  id: string;
  label: string;
  description: string;
}

export interface PersonaTraitCategories {
  personality: PersonaTrait[];
  knowledge: PersonaTrait[];
  tone: PersonaTrait[];
  responseStyle: PersonaTrait[];
  rolePlay: PersonaTrait[];
}
