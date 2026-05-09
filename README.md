# RewriteAI

**AI-powered content rewriting assistant** built with React, Express, and Google Gemini.

RewriteAI transforms your text in real time — streaming the AI-generated output word-by-word directly into the browser using Server-Sent Events (SSE). Results can be saved, revisited, and deleted from a persistent history panel.

---

## Features

- **Real-time AI streaming** — Gemini responses stream progressively via SSE; no waiting for the full response
- **Polished AI UX** — animated thinking state while the model processes, then a word-by-word reveal
- **Tone & formality controls** — choose formality, tone, and output length per rewrite
- **Persistent history** — saved rewrites are stored in a local SQLite database and displayed in a sidebar
- **Character limit enforcement** — frontend and backend both validate the 10,000 character input limit
- **Clean production architecture** — modular controllers, services, routes, and React components

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

## Project Structure

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

## Getting Started

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

---

## License

MIT
