import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPrefix: apiKey?.substring(0, 8) || 'undefined',
    keyStartsWithSk: apiKey?.startsWith('sk-') || false,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('OPENAI')),
  });
} 