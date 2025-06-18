# AI Chatbot - Intelligent Conversation Assistant

A modern, responsive AI chatbot web application built with Next.js, TypeScript, and Tailwind CSS. Features beautiful animations, markdown support, streaming responses, and full OpenAI API integration.

## ✨ Features

- 🎨 **Modern & Responsive UI** - Beautiful design that works on desktop and mobile
- 🚀 **Streaming Responses** - Real-time AI responses with typing animations
- 📝 **Markdown Support** - Full markdown rendering with syntax highlighting for code blocks
- 💾 **Persistent Chat History** - Conversations saved in localStorage
- 🔄 **OpenAI Integration** - Powered by OpenAI's powerful language models
- ⚙️ **Configurable** - Full OpenAI parameter customization following official docs
- 🌙 **Dark Mode** - Beautiful dark/light theme switching
- 📱 **Mobile Friendly** - Fully responsive with mobile-optimized interface
- ⚡ **Fast & Lightweight** - Optimized performance with modern React patterns

## 🚀 Quick Start

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd ai-chatbot
npm install
```

2. **Set up environment variables:**
```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your API keys
```

3. **Configure OpenAI:**
```env
# Required: Your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Customize the model and parameters
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
OPENAI_TOP_P=1
OPENAI_FREQUENCY_PENALTY=0
OPENAI_PRESENCE_PENALTY=0
SYSTEM_PROMPT=You are a helpful AI assistant. Be concise, accurate, and friendly.
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to `http://localhost:3000` and start chatting!

## 🔧 Configuration

### OpenAI Settings

The application uses OpenAI's API with full parameter support according to their official documentation:

```env
# Required: Your OpenAI API key
OPENAI_API_KEY=your_api_key_here

# Optional: Custom OpenAI settings
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000        # Maximum tokens in response (1-4096+)
OPENAI_TEMPERATURE=0.7        # Creativity level (0.0-2.0)
OPENAI_TOP_P=1               # Nucleus sampling (0.0-1.0)
OPENAI_FREQUENCY_PENALTY=0   # Reduce repetition (-2.0 to 2.0)
OPENAI_PRESENCE_PENALTY=0    # Encourage new topics (-2.0 to 2.0)
```

### Supported Models

The application supports all OpenAI chat completion models:
- `gpt-4o` - Latest GPT-4 Omni model
- `gpt-4o-mini` - Faster, cost-effective GPT-4 Omni
- `gpt-4-turbo` - Latest GPT-4 Turbo
- `gpt-4` - Standard GPT-4
- `gpt-3.5-turbo` - Fast and efficient

### System Prompt Customization

Customize the AI's behavior by setting the system prompt:

```env
SYSTEM_PROMPT=You are a helpful coding assistant. Focus on providing clear, practical solutions with working code examples.
```

## 🏗️ Architecture

The application follows OpenAI's best practices and official documentation:

```
src/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   │   ├── ChatContainer.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatHeader.tsx
│   │   └── MessageContent.tsx
│   ├── api/chat/          # API routes for AI integration
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── config/                # Configuration files
│   └── ai.ts             # OpenAI configuration with validation
├── hooks/                 # Custom React hooks
│   └── useChat.ts        # Chat state management
├── lib/                  # Utility libraries
│   ├── ai-service.ts     # OpenAI service following official docs
│   ├── storage.ts        # localStorage utilities
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
    ├── chat.ts           # Chat-related types
    └── openai.ts         # OpenAI API types
```

## 🎨 Customization

### Themes
The app supports automatic dark/light mode switching. Customize colors in `src/app/globals.css`:

```css
:root {
  --background: #fafbfc;
  --foreground: #1e293b;
  --card: #ffffff;
  --border: #e2e8f0;
  /* ... more variables */
}
```

### OpenAI Parameters
All OpenAI parameters can be customized via environment variables and are validated according to their documentation:

- **Temperature** (0.0-2.0): Controls randomness
- **Top P** (0.0-1.0): Controls diversity via nucleus sampling
- **Max Tokens**: Maximum response length
- **Frequency/Presence Penalty** (-2.0 to 2.0): Controls repetition

## 📱 Mobile Support

The application is fully responsive with:
- Collapsible sidebar for mobile
- Touch-friendly interface
- Optimized layouts for small screens
- Gesture-based navigation

## 🔒 Security

- Environment variables for sensitive API keys
- Client-side data persistence (no server-side storage)
- Secure API communication following OpenAI guidelines
- Input sanitization and validation
- Proper error handling without exposing sensitive data

## 🚀 Performance

- **Streaming responses** for immediate feedback following OpenAI's SSE format
- **Lazy loading** of components
- **Optimized animations** with CSS transforms
- **Minimal bundle size** with tree-shaking
- **Client-side caching** of conversations
- **Token estimation** for cost optimization

## 🛠️ Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Customizing OpenAI Settings

1. Update `src/config/ai.ts` to modify OpenAI configuration
2. Adjust model parameters following OpenAI's documentation
3. Set environment variables for API key and model preferences
4. Use the built-in validation to ensure parameters are within allowed ranges

### Customizing Message Rendering

Modify `src/app/components/MessageContent.tsx` to add new markdown features or styling.

## 📦 Dependencies

### Core
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Features
- **react-markdown** - Markdown rendering
- **react-syntax-highlighter** - Code syntax highlighting
- **framer-motion** - Smooth animations
- **lucide-react** - Beautiful icons
- **OpenAI API** - AI-powered conversations with full parameter support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the environment variables are set correctly
2. Ensure your OpenAI API key is valid and has sufficient credits
3. Verify the model name is supported
4. Check parameter ranges match OpenAI's documentation
5. Review the browser console for error messages
6. Check the API route logs in development

For additional help, please open an issue in the repository.

---

**Happy Chatting! 🤖💬**
