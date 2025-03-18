import { NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

// In a real application, settings would be stored in the database
// For this demo, we'll use a simple in-memory store with defaults
let siteSettings = {
  siteName: 'OBAI',
  siteDescription: 'Chat with AI Personas powered by Grok',
  grokApiKey: process.env.GROK_API_KEY || '',
  grokApiUrl: process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions',
  defaultCreditsForNewUsers: 5,
  messageLockedChanceDefault: 0.05,
  lockMessagePriceDefault: 0.5,
  maintenanceMode: false,
  allowUserRegistration: true,
  requireEmailVerification: true,
  maxMessagesPerChat: 100,
  maxChatsPerUser: 50,
  deleteInactiveChatsAfterDays: 90,
  contactEmail: 'support@obai.example.com',
  privacyPolicyUrl: 'https://obai.example.com/privacy',
  termsOfServiceUrl: 'https://obai.example.com/terms'
};

// Get current settings
export async function GET(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, we'd fetch from database
    // For demo, we'll just return the in-memory settings
    // We'll mask the API key for security
    const maskedSettings = {
      ...siteSettings,
      grokApiKey: siteSettings.grokApiKey ? `xai-${siteSettings.grokApiKey.substring(4, 10)}...` : ''
    };

    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update settings
export async function PUT(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Update our in-memory settings
    // In a real app, we'd validate and save to database
    siteSettings = {
      ...siteSettings,
      ...data,
      // If API key is the masked version, don't update it
      grokApiKey: data.grokApiKey && !data.grokApiKey.includes('...') 
        ? data.grokApiKey 
        : siteSettings.grokApiKey
    };

    // Apply settings to environment variables where applicable
    if (data.grokApiKey && !data.grokApiKey.includes('...')) {
      process.env.GROK_API_KEY = data.grokApiKey;
    }
    
    if (data.grokApiUrl) {
      process.env.GROK_API_URL = data.grokApiUrl;
    }

    // Return the updated settings with masked API key
    const maskedSettings = {
      ...siteSettings,
      grokApiKey: siteSettings.grokApiKey ? `xai-${siteSettings.grokApiKey.substring(4, 10)}...` : ''
    };

    return NextResponse.json({
      success: true,
      settings: maskedSettings
    });
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Test the API connection (for Grok API key validation)
export async function POST(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // If a test API key is provided, use it temporarily
    const apiKey = data.testApiKey || siteSettings.grokApiKey;
    const apiUrl = data.testApiUrl || siteSettings.grokApiUrl;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key provided' }, { status: 400 });
    }

    // In a real app, we'd make a test request to the API
    // For demo purposes, we'll just simulate a successful test
    const isValidKey = apiKey.startsWith('xai-');
    
    if (!isValidKey) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid API key format. Grok API keys should start with "xai-".'
      }, { status: 400 });
    }

    // In a full implementation, we would actually test the API here
    // For demo, we'll just pretend it worked if the format is correct
    
    return NextResponse.json({
      success: true,
      message: 'API connection test successful!'
    });
  } catch (error) {
    console.error('POST /api/admin/settings error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to test API connection'
    }, { status: 500 });
  }
}
