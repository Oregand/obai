import { NextRequest, NextResponse } from 'next/server';
import { processAutoTopups } from '@/lib/services/autotopup/processor';

// Create a protected API route that can be called by a cron job
export async function POST(req: NextRequest) {
  try {
    // Check authorization header - this should be a secure API key in production
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Run the auto-topup processor
    await processAutoTopups();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing auto top-ups:', error);
    return NextResponse.json(
      { error: 'Failed to process auto top-ups' },
      { status: 500 }
    );
  }
}
