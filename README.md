# CollabDocs — Lightweight Collaborative Document Editor

CollabDocs is a production-grade, lightweight collaborative document editor inspired by Google Docs, built as an engineering evaluation for Ajaia. It demonstrates sound product judgment, secure full-stack engineering, clean frontend/backend architecture, robust document persistence, debounced autosave, file import capabilities, and role-based document sharing.

---

## 🚀 Live Demo & Deployment

- **Live Application**: *[Add your live deployment URL here, e.g. Vercel / Render]*
- **Walkthrough Video (3-5 min)**: *[Add your unlisted Loom or YouTube URL here]*
- **Database**: Serverless PostgreSQL via [Neon](https://neon.tech/)

---

## 👥 Seeded Demo Accounts

Reviewers can use the following seeded test accounts to test document creation, ownership, and cross-user sharing:

| User | Email | Password | Primary Role |
| :--- | :--- | :--- | :--- |
| **Alice** | `alice@example.com` | `Password123!` | Document Owner / Collaborator |
| **Bob** | `bob@example.com` | `Password123!` | Document Collaborator (Editor/Viewer) |

> **Quick Login:** The login screen provides 1-click quick-fill buttons for both Alice and Bob for rapid reviewer testing.

---

## ✨ Core Features

### 1. Document Creation & Rich-Text Editing
- **Interactive Rich-Text Engine**: Built with TipTap. Supports **Bold**, *Italic*, <u>Underline</u>, Headings (H1, H2), Bulleted Lists, and Numbered Lists.
- **Editable Titles**: Rename documents inline with instant or blur-triggered persistence.
- **Structured JSON Persistence**: Documents are stored as TipTap JSON trees in PostgreSQL (`jsonb`), preserving full formatting and document hierarchy across refreshes.

### 2. Debounced Autosave
- **Non-blocking Background Sync**: Edits are debounced at 800ms to avoid spamming the backend API.
- **Visual Status Indicator**: Transparently reflects document state (`Saved`, `Saving...`, `Unsaved changes`, or `Error saving`).
- **Data Safety**: In-flight edits remain intact without UI flickering or cursor jumps.

### 3. Sharing & Access Control (Backend-Enforced)
- **Role Hierarchy**:
  - **Owner**: Read, edit, rename, delete document, and grant/revoke access.
  - **Editor**: Read, edit content, and rename document. Cannot delete or manage shares.
  - **Viewer**: Read-only access. Toolbar and editing capabilities are locked.
- **Separated Dashboard Views**: Instant visual distinction between **"My Documents"** (owned) and **"Shared with Me"** (with owner tag and permission badge).
- **Zero Client Trust**: All authorization checks are strictly validated at the backend middleware layer on every request.

### 4. File Import
- **Supported Formats**: `.txt` and `.md` files up to **10 MB**.
- **Instant Document Conversion**: Uploaded content is sanitized, parsed into TipTap JSON nodes, and saved as a newly created document ready for rich-text editing.

### 5. Document Export (Optional Stretch Feature)
- **1-Click Markdown Export (`.md`)**: Converts the TipTap AST tree into clean GitHub Flavored Markdown.
- **Plain Text Export (`.txt`)**: Downloads the unformatted textual content.
- **Print / PDF Generation**: Trigger native browser print engine with formatted styling.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with co-located style definitions (`.styles.ts`), Lucide React icons
- **State Management**:
  - **Server State**: TanStack Query (React Query v5) for cached API data, queries, and mutations.
  - **Client / UI State**: Zustand for modal states, active toolbars, and transient UI flags.
- **Rich-Text Editor**: TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`)
- **Routing**: React Router v6

### Backend (`/server`)
- **Runtime & Framework**: Node.js, Express, TypeScript
- **Database & ORM**: PostgreSQL (hosted on Neon), Prisma ORM
- **Validation**: Zod for strict schema validation on all inputs
- **Security & Auth**: JWT (JsonWebToken), bcryptjs password hashing, Helmet, CORS allowlisting
- **File Handling**: Multer for memory-buffered, validated file uploads

### Automated Testing
- **Vitest & Supertest**: End-to-end integration tests validating authentication and authorization boundaries (e.g. 403 Forbidden vs 200 OK across Alice and Bob).

---

## 📂 Project Structure

CollabDocs adopts a clean monorepo structure with strict modular separation:

```text
collab-docs/
├── client/                      # Frontend SPA
│   ├── src/
│   │   ├── modules/             # Vertical feature slices (Feature-Module pattern)
│   │   │   ├── auth/            # Login, session, auth store & hooks
│   │   │   ├── documents/       # Dashboard, document cards, creation & import
│   │   │   ├── editor/          # TipTap editor, toolbar, autosave manager
│   │   │   └── sharing/         # Share modal, collaborators list, permissions
│   │   ├── shared/              # Cross-module shared code
│   │   │   ├── api-client/      # Axios/Fetch typed client with interceptors
│   │   │   ├── components/      # UI primitives (Buttons, Dialogs, Badges, Toasts)
│   │   │   └── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── server/                      # Backend REST API
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (User, Document, DocumentShare)
│   │   └── seed.ts              # Demo seeds (Alice, Bob, sample docs)
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Auth, document authorization, error handlers
│   │   ├── routes/              # Express route definitions
│   │   ├── services/            # Core business logic
│   │   ├── validators/          # Zod validation schemas
│   │   └── app.ts               # Server entry point
│   ├── tests/                   # Automated API integration tests
│   └── package.json
│
├── README.md                    # Project documentation
├── ARCHITECTURE.md              # Technical design & architecture choices
├── AI_WORKFLOW.md               # AI tooling rationale & verification log
├── SUBMISSION.md                # Submission index & checklist
└── .env.example
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm or pnpm
- A Neon PostgreSQL database connection string (or local PostgreSQL)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd collab-docs
```

### 2. Backend Setup
```bash
cd server
npm install

# Configure environment variables
cp .env.example .env
```

Edit `server/.env` and supply your database connection string and secrets:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@ep-sample-pooler.neon.tech/collabdocs?sslmode=require"
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

Initialize the database and seed demo data:
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

Start the backend development server:
```bash
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install

# Configure environment variables
cp .env.example .env
```

Ensure `client/.env` points to the backend API:
```env
VITE_API_URL="http://localhost:5000/api"
```

Start the frontend development server:
```bash
npm run dev
# Application will run on http://localhost:5173
```

---

## 🧪 Running Automated Tests

Run the integration test suite validating backend sharing rules and permission boundaries:

```bash
cd server
npm test
```

### Key Test Cases Covered:
1. **Unauthorized Access Protection**: User B receives `403 Forbidden` when attempting to fetch a document owned by User A.
2. **Access Grant Flow**: User A shares the document with User B as `EDITOR`; User B can now retrieve (`200 OK`) and update the document.
3. **Read-Only Enforcement**: A `VIEWER` attempting to `PATCH` document content receives `403 Forbidden`.

---

## 📁 File Upload Specifications

- **Supported Formats**: Plain text (`.txt`), Markdown (`.md`)
- **Maximum File Size**: 2 MB
- **Security Protections**:
  - File extension & MIME type allowlist.
  - Payload size limits enforced at reverse-proxy and Multer layers.
  - Uploaded buffer sanitized and transformed to prevent XSS.

---

## ⚖️ Intentional Scope & Trade-offs

To deliver a polished, stable, and production-grade core user journey within the allotted timebox, the following features were **intentionally deprioritized**:

- **Real-Time WebSockets / CRDTs**: Real-time collaborative multi-cursor synchronization (Operational Transformation / Yjs) introduces high operational surface area. We prioritized robust debounced autosave, document persistence, and flawless permission controls.
- **DOCX / Complex Binary Import**: Parsing binary Word documents often leads to format corruption. Standardizing on Markdown and plain text ensures clean and predictable conversion into TipTap nodes.
- **Comments / Inline Annotations**: Deferred in favor of delivering rock-solid sharing and authorization boundaries.

---

## 📄 License & Attribution

Built for the Ajaia technical assessment. All code and architectural documentation are authored for review purposes.
