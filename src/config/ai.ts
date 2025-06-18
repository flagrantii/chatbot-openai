export interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export const openaiConfig: OpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  systemPrompt: process.env.SYSTEM_PROMPT || 'You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  topP: parseFloat(process.env.OPENAI_TOP_P || '1'),
  frequencyPenalty: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '0'),
  presencePenalty: parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '0'),
};

export function validateConfig(): void {
  const errors: string[] = [];

  // Debug logging
  console.log('=== DEBUG: Environment Variable Check ===');
  console.log('OPENAI_API_KEY value:', process.env.OPENAI_API_KEY ? 'EXISTS' : 'MISSING');
  console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
  console.log('OPENAI_API_KEY starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-') || false);
  console.log('Config apiKey value:', openaiConfig.apiKey ? 'EXISTS' : 'MISSING');
  console.log('Config apiKey length:', openaiConfig.apiKey?.length || 0);
  console.log('==========================================');

  // Required fields
  if (!openaiConfig.apiKey) {
    errors.push('OPENAI_API_KEY is required');
  }

  if (!openaiConfig.apiKey.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY should start with "sk-"');
  }

  if (!openaiConfig.model) {
    errors.push('OPENAI_MODEL is required');
  }

  // Validate numeric ranges according to OpenAI docs
  if (openaiConfig.temperature < 0 || openaiConfig.temperature > 2) {
    errors.push('OPENAI_TEMPERATURE must be between 0 and 2');
  }

  if (openaiConfig.topP < 0 || openaiConfig.topP > 1) {
    errors.push('OPENAI_TOP_P must be between 0 and 1');
  }

  if (openaiConfig.frequencyPenalty < -2 || openaiConfig.frequencyPenalty > 2) {
    errors.push('OPENAI_FREQUENCY_PENALTY must be between -2 and 2');
  }

  if (openaiConfig.presencePenalty < -2 || openaiConfig.presencePenalty > 2) {
    errors.push('OPENAI_PRESENCE_PENALTY must be between -2 and 2');
  }

  if (openaiConfig.maxTokens < 1) {
    errors.push('OPENAI_MAX_TOKENS must be greater than 0');
  }

  if (errors.length > 0) {
    throw new Error(`OpenAI configuration errors:\n${errors.join('\n')}`);
  }
}

export const SUPPORTED_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
] as const;

export function isSupportedModel(model: string): boolean {
  return SUPPORTED_MODELS.includes(model as any);
} 