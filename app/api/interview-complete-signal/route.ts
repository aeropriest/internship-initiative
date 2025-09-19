import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for completion signals
const completionSignals = new Map<string, { completed: boolean; timestamp: number }>();

// POST - Store completion signal from webhook
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Interview Complete Signal API: Received completion signal');
    
    const data = await request.json();
    console.log('📋 Completion data:', JSON.stringify(data, null, 2));
    
    const candidateId = data.candidate_id;
    if (candidateId) {
      // Store the completion signal
      completionSignals.set(candidateId, {
        completed: true,
        timestamp: Date.now()
      });
      
      console.log(`✅ Stored completion signal for candidate: ${candidateId}`);
      
      // Clean up old signals (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      Array.from(completionSignals.entries()).forEach(([key, value]) => {
        if (value.timestamp < oneHourAgo) {
          completionSignals.delete(key);
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Completion signal stored',
      candidate_id: candidateId
    });
    
  } catch (error) {
    console.error('❌ Interview Complete Signal API: Error processing completion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process interview completion signal' },
      { status: 500 }
    );
  }
}

// GET - Check if interview is completed (for polling)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get('candidate_id');
  
  if (!candidateId) {
    return NextResponse.json(
      { success: false, error: 'candidate_id is required' },
      { status: 400 }
    );
  }
  
  const signal = completionSignals.get(candidateId);
  const completed = signal && signal.completed;
  
  if (completed) {
    console.log(`✅ Interview completed for candidate: ${candidateId}`);
    // Remove the signal after it's been checked
    completionSignals.delete(candidateId);
  }
  
  return NextResponse.json({
    success: true,
    completed: !!completed,
    candidate_id: candidateId,
    timestamp: signal?.timestamp || null
  });
}
