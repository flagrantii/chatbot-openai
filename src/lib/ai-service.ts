import { openaiConfig, validateConfig, isSupportedModel } from '@/config/ai';
import { Message } from '@/types/chat';
import { 
  OpenAIMessage, 
  OpenAIChatCompletionRequest, 
  OpenAIStreamChunk, 
  OpenAIError 
} from '@/types/openai';

export class OpenAIService {
  constructor() {
    validateConfig();
    
    // Validate model is supported
    if (!isSupportedModel(openaiConfig.model)) {
      console.warn(`Model ${openaiConfig.model} may not be supported. Supported models:`, ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']);
    }
  }

  /**
   * Stream chat completion from OpenAI API
   * Follows OpenAI's Server-Sent Events format
   */
  async* streamChatCompletion(messages: Message[]): AsyncGenerator<string> {
    try {
      const response = await this.createChatCompletion(messages, true);
      
      if (!response.body) {
        throw new Error('No response body received from OpenAI API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (!trimmedLine) continue;
            
            if (trimmedLine === 'data: [DONE]') {
              return;
            }

            if (trimmedLine.startsWith('data: ')) {
              const jsonStr = trimmedLine.slice(6);
              
              try {
                const chunk: OpenAIStreamChunk = JSON.parse(jsonStr);
                const content = chunk.choices?.[0]?.delta?.content;
                
                if (content) {
                  console.log('Received chunk content:', content);
                  yield content;
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE chunk:', jsonStr);
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API streaming error: ${error.message}`);
      }
      throw new Error('Unknown error occurred during OpenAI API streaming');
    }
  }

  /**
   * Create a chat completion request to OpenAI API
   * @param messages - Array of chat messages
   * @param stream - Whether to stream the response
   */
  private async createChatCompletion(
    messages: Message[], 
    stream: boolean = false
  ): Promise<Response> {
    const openaiMessages = this.formatMessages(messages);
    
    // Debug logging
    console.log('Formatted OpenAI messages:', openaiMessages);
    
    const requestBody: OpenAIChatCompletionRequest = {
      model: openaiConfig.model,
      messages: openaiMessages,
      stream,
      max_tokens: openaiConfig.maxTokens,
      temperature: openaiConfig.temperature,
      top_p: openaiConfig.topP,
      frequency_penalty: openaiConfig.frequencyPenalty,
      presence_penalty: openaiConfig.presencePenalty,
    };

    console.log('OpenAI request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${openaiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiConfig.apiKey}`,
        'User-Agent': 'AI-Chatbot/1.0',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      await this.handleAPIError(response);
    }

    return response;
  }

  /**
   * Format internal messages to OpenAI message format
   */
  private formatMessages(messages: Message[]): OpenAIMessage[] {
    const openaiMessages: OpenAIMessage[] = [];

    // Add system message if configured
    if (openaiConfig.systemPrompt) {
      openaiMessages.push({
        role: 'system',
        content: openaiConfig.systemPrompt,
      });
    }

    // Convert and filter messages
    const userAssistantMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .filter(m => m.content.trim().length > 0) // Remove empty messages
      .filter(m => !m.isStreaming) // Remove currently streaming messages
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    openaiMessages.push(...userAssistantMessages);

    return openaiMessages;
  }

  /**
   * Handle API errors according to OpenAI documentation
   */
  private async handleAPIError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData: OpenAIError = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
      
             // Handle specific OpenAI error types according to documentation
       switch (response.status) {
         case 400:
           throw new Error(`Bad Request - Invalid request format or parameters: ${errorMessage}`);
         case 401:
           throw new Error(`Authentication Error - Invalid API key provided: ${errorMessage}`);
         case 403:
           throw new Error(`Permission Denied - Country, region, or terms of service: ${errorMessage}`);
         case 404:
           throw new Error(`Not Found - Requested resource (e.g., model) doesn't exist: ${errorMessage}`);
         case 422:
           throw new Error(`Unprocessable Entity - Unable to process the request: ${errorMessage}`);
         case 429:
           throw new Error(`Rate Limit Exceeded - Too many requests, please slow down: ${errorMessage}`);
         case 500:
           throw new Error(`Internal Server Error - OpenAI server error: ${errorMessage}`);
         case 502:
           throw new Error(`Bad Gateway - Invalid response from OpenAI's servers: ${errorMessage}`);
         case 503:
           throw new Error(`Service Unavailable - OpenAI servers are temporarily overloaded: ${errorMessage}`);
         case 504:
           throw new Error(`Gateway Timeout - Request timeout from OpenAI's servers: ${errorMessage}`);
         default:
           throw new Error(`OpenAI API Error (${response.status}): ${errorMessage}`);
       }
    } catch (parseError) {
      // If we can't parse the error response, use the status text
      throw new Error(errorMessage);
    }
  }

     /**
    * Test the API connection
    */
   async testConnection(): Promise<boolean> {
     try {
       const testMessages: Message[] = [
         {
           id: 'test',
           role: 'user',
           content: 'Hello',
           timestamp: Date.now(),
         }
       ];

       const response = await this.createChatCompletion(testMessages, false);
       return response.ok;
     } catch (error) {
       console.error('OpenAI connection test failed:', error);
       return false;
     }
   }

   /**
    * Get available models from OpenAI API
    */
   async getAvailableModels(): Promise<string[]> {
     try {
       const response = await fetch(`${openaiConfig.baseUrl}/models`, {
         method: 'GET',
         headers: {
           'Authorization': `Bearer ${openaiConfig.apiKey}`,
           'User-Agent': 'AI-Chatbot/1.0',
         },
       });

       if (!response.ok) {
         throw new Error(`Failed to fetch models: ${response.statusText}`);
       }

       const data = await response.json();
       return data.data
         .filter((model: any) => model.id.includes('gpt'))
         .map((model: any) => model.id)
         .sort();
     } catch (error) {
       console.error('Failed to fetch available models:', error);
       return [];
     }
   }

   /**
    * Get current token usage estimation
    */
   estimateTokens(messages: Message[]): number {
     // Rough estimation: ~4 characters per token for English text
     const text = messages.map(m => m.content).join(' ');
     return Math.ceil(text.length / 4);
   }

   /**
    * Check if the current configuration is valid
    */
   isConfigurationValid(): boolean {
     try {
       validateConfig();
       return true;
     } catch (error) {
       return false;
     }
   }
} 