# RewriteAI

**AI-powered content rewriting assistant** built with React, Express, and Google Gemini.

RewriteAI transforms your text in real time — streaming the AI-generated output word-by-word directly into the browser using Server-Sent Events (SSE). Results can be saved, revisited, and deleted from a persistent history panel.

---

## Overview

RewriteAI is a full-stack AI content rewriting application that lets users paste any text and instantly rewrite it with a chosen tone, formality level, and output length — with the AI response streaming live into the browser word-by-word.

The direction was chosen because it sits at the intersection of two genuinely useful problems: making AI output feel responsive and alive (rather than a loading spinner followed by a wall of text), and making text transformation practical for everyday use. Personally, I regularly find myself rewriting emails and messages — adjusting tone, shortening a paragraph, or making something sound more professional — and doing that manually is tedious. RewriteAI automates exactly that workflow in a clean, focused interface.

---

## Features

- **Real-time AI streaming** — Gemini responses stream progressively via SSE; no waiting for the full response
- **Polished AI UX** — animated thinking state while the model processes, then a word-by-word reveal
- **Tone & formality controls** — choose formality, tone, and output length per rewrite
- **Persistent history** — saved rewrites are stored in a local SQLite database and displayed in a sidebar
- **Character limit enforcement** — frontend and backend both validate the 10,000 character input limit
- **Clean production architecture** — modular controllers, services, routes, and React components

---

## Run Locally

### Prerequisites

- Node.js v18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/Nightfury2062/RewriteAI.git
cd RewriteAI
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The server starts at `http://localhost:5000`. The SQLite database (`rewriteai.db`) is created automatically on first run.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

---

## Architecture

RewriteAI uses a clean separation between the React frontend and an Express backend. All AI communication is handled server-side — the browser never touches the Gemini API directly.

When a user submits text, the frontend opens a native `fetch` stream to `POST /api/process/stream`. The backend builds a structured prompt, calls the Gemini streaming API, and pipes each token chunk back to the client as an SSE `data:` event. The frontend's `api.js` reads the `ReadableStream`, decodes SSE lines, and passes each chunk to the React state — producing the live word-by-word typing effect.

Once the stream completes, the user can save the result. Saved rewrites are persisted to a local SQLite database via Sequelize ORM and displayed in the sidebar history panel.

### Project Structure

```
RewriteAI/
├── backend/
│   ├── src/
│   │   ├── controllers/     # processController, streamController, itemController
│   │   ├── db/              # Sequelize + SQLite setup
│   │   ├── middleware/      # Global error handler
│   │   ├── models/          # RewriteItem Sequelize model
│   │   ├── prompts/         # Prompt builder with injection-safe constraints
│   │   ├── routes/          # processRoutes, streamRoutes, itemRoutes
│   │   └── services/        # geminiService (streaming + standard)
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # RewriteForm, OutputPanel, SavedItemsPanel, SavedItemCard, ThinkingAnimation
    │   ├── pages/           # Home
    │   └── services/        # api.js (axios + fetch SSE client)
    ├── index.html
    └── package.json
```

---

## Decisions

**1. Real SSE streaming instead of a fake frontend animation**

The AI response is streamed token-by-token using actual Server-Sent Events rather than displaying a loading spinner and dumping the full result at once. This required building a proper async generator pipeline on the backend (`generateRewriteStream`) and a `ReadableStream` consumer on the frontend. The payoff is a significantly better user experience — the output feels alive and immediate rather than transactional.

**2. Sequelize ORM for database communication**

Rather than writing raw SQL queries, Sequelize was used to interact with SQLite. This gives object-oriented model definitions, automatic schema synchronisation on startup (`sequelize.sync()`), and a clean separation between database logic and controller logic. It also makes the persistence layer easy to swap to PostgreSQL or MySQL in the future without changing the controller code.

**3. Modular backend architecture (routes / controllers / services / prompts)**

The backend is split into four distinct layers rather than putting everything in one file. Routes handle HTTP wiring, controllers handle request validation and response formatting, services encapsulate all Gemini API logic, and prompts contain the structured prompt builder. This makes each layer independently testable and easy to extend — adding a new AI behaviour only requires touching the service and prompt layers.

---

## Rejected Approach

**WebSockets for AI streaming** was considered and rejected.

WebSockets are bidirectional — designed for real-time two-way communication like chat or collaborative editing. For this use case, the communication is strictly one-directional: the client sends one request and the server streams back a response. Using WebSockets would have introduced unnecessary complexity (connection lifecycle management, reconnection logic, a socket server) for no benefit.

Server-Sent Events are the right primitive here: they are built on standard HTTP, natively supported by browsers without extra libraries, simpler to implement, and perfectly suited to one-way server-to-client streaming. SSE also works through proxies and load balancers more reliably than WebSocket upgrades.

---

## Ambiguities

**How to handle LLM response delay without making the UI feel broken.**

This was the most significant design ambiguity. When a user submits text, there is an unavoidable delay before the first token arrives from the Gemini API. The question was: what should the UI show during that gap?

Four approaches were evaluated:

- **Fake streaming** — accumulate the full response, then replay it character-by-character with a timer. Fast to implement but dishonest and fragile.
- **Loading animation only** — show a spinner while waiting for the full response, then display it all at once. Simple but feels unresponsive for longer outputs.
- **WebSockets** — real streaming but overkill for one-way communication (see Rejected Approach).
- **Real SSE streaming with a thinking animation** — show an animated thinking indicator while the connection is established and the first token is pending, then switch to live word-by-word streaming the moment data starts arriving.

The last approach was chosen. It is honest (the output appears exactly as fast as the model generates it), it gracefully handles the cold-start delay with the `ThinkingAnimation` component, and it produces the premium AI UX that users now expect from tools like ChatGPT. The added implementation complexity was justified by the quality of the result.

---

## What I'd Do Next

- **Authentication** — user accounts so history is private and portable across devices, rather than tied to a local SQLite file
- **Cloud persistence** — replace SQLite with PostgreSQL hosted on a managed service (Supabase or Railway) so the app can be deployed and shared
- **Rewrite presets** — saved configurations (e.g. "Professional Email", "Casual Slack Message") so users can apply their common rewrite styles in one click
- **Markdown rendering** — render the AI output as formatted markdown, since many rewrites (especially longer ones) benefit from headings, lists, and emphasis
- **AI comparison mode** — submit the same text to two different tone/length configurations side-by-side, so users can pick the better output without rewriting twice

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite, Vanilla CSS       |
| Backend   | Node.js, Express                  |
| AI        | Google Gemini 2.5 Flash (via `@google/generative-ai`) |
| Streaming | Server-Sent Events (SSE)          |
| Database  | SQLite via Sequelize ORM          |

---

## API Reference

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/api/process/stream` | Stream AI rewrite via SSE          |
| POST   | `/api/process`        | Non-streaming AI rewrite           |
| GET    | `/api/items`          | Fetch all saved rewrites           |
| POST   | `/api/items`          | Save a completed rewrite           |
| DELETE | `/api/items/:id`      | Delete a saved rewrite by ID       |

---

## Environment Variables

| Variable        | Required | Description              |
|-----------------|----------|--------------------------|
| `GEMINI_API_KEY`| ✅       | Google Gemini API key    |
| `PORT`          | Optional | Backend port (default 5000) |
