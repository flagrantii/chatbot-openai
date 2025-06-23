import { Message } from "@/types/chat";

export interface N8nConfig {
  webhookUrl: string;
}

export const n8nConfig: N8nConfig = {
  webhookUrl:
    process.env.N8N_WEBHOOK_URL ||
    "http://localhost:5678/webhook/cd93bdd6-4af7-41ff-80d7-12538cb8ea9f",
};

export class N8nService {
  constructor() {
    this.validateConfig();
  }

  /**
   * Stream chat completion from n8n webhook
   */
  async *streamChatCompletion(messages: Message[]): AsyncGenerator<string> {
    try {
      const response = await this.createChatCompletion(messages);

      if (!response.body) {
        throw new Error("No response body received from n8n webhook");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const text = decoder.decode(value, { stream: true });
          yield text; // Send each chunk as it comes in
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`n8n webhook streaming error: ${error.message}`);
      }
      throw new Error("Unknown error occurred during n8n webhook streaming");
    }
  }

  /**
   * Create a chat completion request to n8n webhook
   * @param messages - Array of chat messages
   */
  private async createChatCompletion(messages: Message[]): Promise<Response> {
    const formattedMessages = this.formatMessages(messages);

    // Debug logging
    console.log("Sending messages to n8n webhook:", formattedMessages);

    const requestBody = {
      messages: formattedMessages,
    };

    const response = await fetch(n8nConfig.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      await this.handleAPIError(response);
    }

    return response;
  }

  /**
   * Format internal messages to n8n message format
   */
  private formatMessages(
    messages: Message[]
  ): { role: string; content: string }[] {
    return messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .filter((m) => m.content.trim().length > 0) // Remove empty messages
      .filter((m) => !m.isStreaming) // Remove currently streaming messages
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));
  }

  /**
   * Handle API errors
   */
  private async handleAPIError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If we can't parse the error response, use the status text
    }

    throw new Error(`n8n webhook error: ${errorMessage}`);
  }

  /**
   * Validate the configuration
   */
  private validateConfig(): void {
    if (!n8nConfig.webhookUrl) {
      throw new Error("N8N_WEBHOOK_URL is required");
    }
  }
}
