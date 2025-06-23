import { NextRequest, NextResponse } from "next/server";
import { N8nService } from "@/lib/n8n-service";
import { Message } from "@/types/chat";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const n8nService = new N8nService();

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of n8nService.streamChatCompletion(
            messages as Message[]
          )) {
            const data = `data: ${JSON.stringify({
              content: chunk,
              done: false,
            })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // Send completion signal
          const doneData = `data: ${JSON.stringify({
            content: "",
            done: true,
          })}\n\n`;
          controller.enqueue(encoder.encode(doneData));
          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          const errorData = `data: ${JSON.stringify({
            error: errorMessage,
            done: true,
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
