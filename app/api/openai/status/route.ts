import { NextResponse } from 'next/server';

/**
 * GET /api/openai/status
 * 
 * Verifica si OpenAI está configurado correctamente
 */
export async function GET() {
  try {
    const isConfigured = !!process.env.OPENAI_API_KEY;
    
    return NextResponse.json({ 
      enabled: isConfigured,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    });
  } catch (error) {
    console.error('Error checking OpenAI status:', error);
    return NextResponse.json(
      { enabled: false, error: 'Failed to check OpenAI status' },
      { status: 500 }
    );
  }
}
