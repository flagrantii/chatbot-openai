'use client';

interface MessageContentProps {
  content: string;
  isStreaming?: boolean;
}

export default function MessageContent({ content, isStreaming }: MessageContentProps) {
  // Simple fallback markdown rendering - will be enhanced once dependencies are installed
  const renderContent = (text: string) => {
    // Basic markdown patterns
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\n/g, '<br />');

    // Handle code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="bg-gray-900 rounded-lg p-4 my-3">
        ${lang ? `<div class="text-xs text-gray-400 mb-2">${lang}</div>` : ''}
        <pre class="text-gray-100 text-sm overflow-x-auto"><code>${code.trim()}</code></pre>
      </div>`;
    });

    return html;
  };

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <div 
        className="text-gray-700 dark:text-gray-300 leading-7"
        dangerouslySetInnerHTML={{ __html: renderContent(content) }}
      />
      {isStreaming && (
        <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1" />
      )}
    </div>
  );
} 