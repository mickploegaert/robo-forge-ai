ROBO Forge AI — Robot Builder AI Tool

Stack: Next.js (App Router) + TypeScript + Tailwind CSS.

Features
- Parts search via Nexar (Octopart) GraphQL using `OCTOPART_API_KEY`.
- Shows names, specs, images, and shop links with indicative prices.
- Arduino code generator via OpenAI (`OPENAI_API_KEY`) with download as `robot.ino`.
- Save multiple configurations locally and switch between them.

Setup
1) Create `.env.local` with:
```
OCTOPART_API_KEY=your_nexar_token_here
OPENAI_API_KEY=your_openai_key_here
NEXT_PUBLIC_APP_NAME=ROBO Forge AI
```
2) Install deps and run:
```
npm install
npm run dev
```
3) Open http://localhost:3000.

Notes
- Nexar (Octopart) typically requires OAuth2 Client Credentials. Here we accept a bearer token in `OCTOPART_API_KEY` for simplicity. Replace `fetchAccessToken` with a real token exchange if needed.
- All API calls are routed through Next.js API routes under `src/app/api/*`.
