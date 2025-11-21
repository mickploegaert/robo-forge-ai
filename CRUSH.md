# CRUSH.md - ROBO Forge AI Development Guide

## 🤖 Project Overview

ROBO Forge AI is a Next.js 15 application that helps users design robots using AI. Users can describe robot concepts and get AI-generated parts lists, Arduino code, circuit designs, 3D models, and robot images.

**Tech Stack**: Next.js 15 + TypeScript + Tailwind CSS + Three.js + OpenAI API

## 📁 Project Structure

```
src/
├── app/
│   ├── api/           # Next.js API routes
│   │   ├── codegen/   # Arduino code generation
│   │   └── parts/     # Parts search API
│   ├── components/    # React components
│   ├── context/       # React contexts (Language, Theme)
│   ├── services/      # AI service functions
│   ├── hooks/         # Custom React hooks
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── public/            # Static assets
└── Configuration files
```

## 🚀 Essential Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Setup
Create `.env.local` with:
```env
OPENAI_API_KEY=your_openai_key_here
OCTOPART_API_KEY=your_nexar_token_here
NEXT_PUBLIC_APP_NAME=ROBO Forge AI
```

**Important**: API keys are required for full functionality:
- `OPENAI_API_KEY`: Required for all AI generation (GPT-4o, DALL-E 3 HD)
- `OCTOPART_API_KEY`: For real-time parts search and pricing

## 🎯 Core Functionality

### AI Services (`src/app/services/ai.ts`)

The main AI service handles multiple types of generation using the most advanced models available:

1. **Arduino Code Generation** (`generateArduinoCode`)
   - **Model**: GPT-4o (primary) with fallback to o1-mini for complex reasoning
   - **Why**: Excellent code generation with fast response (2-5s), understands Arduino constraints
   - Generates production-ready Arduino C++ code with state machines, non-blocking timing, error handling
   - Dutch comments with hardware specifications and memory optimization

2. **Parts List Generation** (`generatePartsList`)
   - **Model**: GPT-4o for optimal balance of speed and accuracy
   - **Why**: Broad knowledge of electronics, fast response, realistic Netherlands webshop integration
   - Generates CSV format with real MPN codes, 2024 EUR pricing, 12-20 parts per robot
   - Kiwi Electronics, SOS Solutions, Tinytronics, Amazon NL integration

3. **Circuit Design** (`generateCircuitDesign`)
   - **Model**: GPT-4o for superior SVG generation and electrical knowledge
   - **Why**: Excellent understanding of electrical schematics, precise color coding, component specifications
   - Professional datasheet-quality SVG with strict wire color standards
   - Arduino-centric layouts with proper pin labeling and component-specific designs

4. **3D Model Generation** (`generate3DModel`)
   - **Model**: GPT-4o (primary) with o1-mini fallback for complex geometric reasoning
   - **Why**: GPT-4o provides 95% of o1-mini's quality at 5x speed with universal availability
   - Creates ASCII STL format optimized for 3D printing with proper humanoid anatomy
   - Stability calculations, printability validation, standard 300mm proportions

5. **Robot Image Generation** (`generateRobotImage`)
   - **Model**: DALL-E 3 HD (latest available)
   - **Why**: Highest quality photorealistic generation, 8K cinema quality output
   - Professional product photography with Hollywood lighting setup
   - Smart interpretation: "robot" → humanoid, "arm" → robotic arm, "auto" → robot vehicle

### API Routes

- **`/api/codegen`**: Arduino code generation endpoint
- **`/api/parts`**: Parts search and catalog integration

## 🎨 UI Components

### Main Components

- **`Hero.tsx`**: Landing section with call-to-action
- **`Vision.tsx`**: Product vision and features showcase
- **`Requirements.tsx`**: System requirements and setup info
- **`Navbar.tsx`**: Navigation with language switcher
- **`Footer.tsx`**: Site footer

### Robot-Specific Components

- **`AIRobot3DViewer.tsx`**: Interactive 3D robot viewer using Three.js
- **`Circuit3DViewer.tsx`**: 3D circuit visualization
- **`RobotConfigurator.tsx`**: Robot configuration interface

### Utility Components

- **`LoadingScreen.tsx`**: Animated loading screen
- **`ClientLayout.tsx`**: Client-side layout wrapper

## 🌍 Internationalization

Uses custom context-based i18n system:

- **Language Context** (`src/app/context/LanguageContext.tsx`)
- Supported languages: Dutch (nl), English (en)
- Translation keys organized by component/feature
- Use `useLanguage()` hook for translations

## 🎯 Code Patterns & Conventions

### TypeScript Patterns
- Strict TypeScript configuration
- Interface definitions for all data structures
- Proper typing for API responses and component props
- Generic types where appropriate

### React Patterns
- Functional components with hooks
- Context for global state (language, theme)
- Custom hooks for complex logic (e.g., `useScrollAnimation`)
- Dynamic imports for SSR-sensitive components (Three.js)
- Proper error boundaries and loading states

### Styling Patterns
- Tailwind CSS utility classes
- Custom CSS animations defined in `globals.css`
- Consistent color scheme (black/white primary)
- Hover states and transitions
- Mobile-first responsive design

### AI Integration Patterns
- **Rate limiting**: 1s minimum between requests to prevent API abuse
- **Retry logic**: Exponential backoff with 3 max retries
- **Smart model selection**: GPT-4o primary, o1-mini fallback for complex tasks
- **Fallback error messages**: User-friendly Dutch error messages
- **Progress indicators**: Real-time loading states during AI generation
- **Cost optimization**: GPT-4o chosen for best cost/performance ratio
- **Quality assurance**: Prompts engineered for professional-grade output

## 🔧 Development Guidelines

### Adding New AI Features

1. Create function in `src/app/services/ai.ts`
2. Add error handling with `AIServiceError`
3. Include rate limiting and retry logic
4. Add loading state in UI components
5. Update TypeScript interfaces

### Component Development

1. Use functional components with TypeScript
2. Implement proper loading states
3. Add accessibility attributes
4. Follow existing naming conventions
5. Use Tailwind for styling

### API Development

1. Create route in `src/app/api/[endpoint]/route.ts`
2. Add proper error handling and validation
3. Return consistent JSON responses
4. Handle rate limiting for external APIs

## 🎨 Styling System

### Colors
- Primary: Black (`#000000`) and White (`#FFFFFF`)
- Accent: Blue (`#0066FF`), Green (`#00CC00`), Yellow (`#FFD700`)
- Backgrounds: Light gray (`#F5F5F5`), White (`#FFFFFF`)

### Typography
- Inter font family (Google Fonts)
- Consistent heading hierarchy
- Dutch localization for UI text

### Animations
- Custom CSS animations in `globals.css`
- Fade-in, slide-up, slide-right, slide-left effects
- Smooth transitions (300ms duration)

## 🤖 AI Model Strategy

### Primary Model: GPT-4o
- **Primary choice for all features** - Best balance of quality, speed, and availability
- ✅ Works with all OpenAI API tiers (universal access)
- ✅ Fast response time (2-5 seconds vs 10-30s for o1 models)
- ✅ Excellent quality for robotics tasks (95% of o1-mini quality)
- ✅ 5x faster with universal availability
- ✅ Cost-effective: $2.50 input / $10.00 output per 1M tokens

### Specialized Models
- **DALL-E 3 HD**: For robot image generation (8K cinema quality)
- **o1-mini**: Fallback for complex geometric reasoning in 3D models
- **o1-preview**: Available for premium tier users if needed

### Why Not Always Use o1 Models?
| Factor | GPT-4o | o1-mini |
|--------|--------|---------|
| **API Availability** | ✅ All tiers | ⚠️ Tier 1+ only |
| **Response Time** | ⭐⭐⭐⭐⭐ (2-5s) | ⭐⭐⭐ (10-30s) |
| **Code Quality** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Slightly better |
| **3D Geometry** | ⭐⭐⭐⭐ Very good | ⭐⭐⭐⭐⭐ Exceptional |
| **User Experience** | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐ Slower |
| **Cost** | $2.50/10.00 | $3.00/12.00 per 1M tokens |

**Decision**: GPT-4o provides optimal balance for production use with fallback to o1-mini when enhanced reasoning is needed.

## 🔒 Security Considerations

- API keys stored in environment variables (not client-side)
- Rate limiting to prevent API abuse
- Input sanitization in API routes
- No sensitive data in localStorage
- Content Security Policy headers

## 📊 Performance Optimizations

- Dynamic imports for Three.js components
- Image optimization with Next.js Image component
- Code splitting by routes
- Memoization for expensive computations
- Debounced search functionality

## 🚀 Deployment

### Build Process
```bash
npm run build    # Optimized production build
npm start        # Start production server
```

### Environment Variables Required
- `OPENAI_API_KEY`: OpenAI API key for AI generation
- `OCTOPART_API_KEY`: Nexar/Octopart API for parts search
- `NEXT_PUBLIC_APP_NAME`: Application name

### Platform Compatibility
- Vercel recommended (optimized for Next.js)
- Works on any Node.js hosting platform
- Requires Node.js 18+ for Next.js 15

## 🐛 Common Issues & Solutions

### AI Generation Fails
- Check API key configuration
- Verify rate limits aren't exceeded
- Network connectivity issues
- OpenAI service availability

### 3D Viewer Not Loading
- Three.js requires WebGL 2.0 support
- Check browser compatibility
- May need to refresh due to dynamic import

### Parts Search Issues
- Octopart API key required
- Rate limiting applied
- Mock data used for development

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check custom CSS animations in globals.css
- Verify responsive breakpoints

## 🔄 Testing Strategy

### Manual Testing Areas
- AI generation workflows
- 3D model loading and interaction
- Language switching
- Parts search functionality
- File downloads (code, CSV, STL)

### API Testing
- Test all API endpoints
- Verify error handling
- Check rate limiting
- Validate response formats

## 📈 Analytics & Monitoring

- Console logging for AI requests/responses
- Performance monitoring for 3D rendering
- Error tracking for API failures
- User interaction analytics (consider adding)

## 🔮 Future Development

### Planned Features
- Direct 3D print integration
- Multi-material support
- Animation system for robots
- Physical simulation
- Community sharing
- Energy optimization

### Technical Debt
- Add comprehensive test suite
- Implement proper error boundaries
- Add analytics integration
- Optimize bundle size
- Improve accessibility

---

**Last Updated**: November 2024
**Framework Versions**: Next.js 15.5.4, React 19.1.0, TypeScript 5.x