# CollabDocs — Architecture & Engineering Design

This document details the architectural decisions, data models, state boundaries, and deliberate trade-offs implemented in **CollabDocs**.

---

## 1. High-Level Architecture

CollabDocs follows a decoupled, three-tier architecture:

```text
┌────────────────────────────────────────────────────────┐
│                   React Client (SPA)                   │
│  - Vite + React + TypeScript                           │
│  - Feature-Module Pattern (modules/ & shared/)        │
│  - Server State: TanStack Query                        │
│  - Client State: Zustand                               │
│  - Editor: TipTap (ProseMirror Engine)                 │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (HTTP)
                            │ Bearer JWT Authentication
┌───────────────────────────▼────────────────────────────┐
│                  Express Backend API                   │
│  - Node.js + Express + TypeScript                      │
│  - Layered Architecture (Routes, Controllers, Services)│
│  - Central Document Authorization Guard Middleware     │
│  - Zod Request Schema Validation                       │
│  - Multer File Buffer Importer                         │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma Client
┌───────────────────────────▼────────────────────────────┐
│             PostgreSQL (Neon Serverless)               │
│  - Relational Schema (users, documents, shares)        │
│  - Native jsonb for TipTap document trees              │
│  - Unique constraints & indexing on foreign keys       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Key Architectural Decisions

### 2.1 Rich-Text Engine: TipTap vs. Custom `contenteditable`
- **Decision**: Adopted [TipTap](https://tiptap.dev/) (built on ProseMirror) instead of rolling a custom `contenteditable` implementation.
- **Rationale**: Direct DOM manipulation via raw `contenteditable` is notoriously prone to browser inconsistencies, cursor jumping, broken selection states, and HTML tag soup. TipTap provides an abstract schema-driven document model represented as clean, JSON-serializable AST nodes. This guarantees deterministic rendering across all browsers.

### 2.2 Persistence: PostgreSQL with Structured JSON (`jsonb`)
- **Decision**: Stored document content as structured JSON (`jsonb` in Postgres) rather than raw HTML strings or separate database rows per paragraph.
- **Rationale**:
  1. TipTap reads and produces ProseMirror JSON trees natively without requiring lossy HTML serialization/sanitization on every save.
  2. Preserves complex nested formatting (lists, marks, headings) losslessly.
  3. Relational models (`User`, `Document`, `DocumentShare`) retain strong ACID guarantees, foreign-key cascade deletes, and relational integrity.

### 2.3 Debounced Autosave Engine (800ms)
- **Decision**: Implemented client-side debouncing of content and title edits before issuing `PATCH /api/documents/:id`.
- **Rationale**: Sending an HTTP request on every keystroke overwhelms the network and database connection pool. An 800ms debounce provides the optimal balance between responsive persistence and backend throughput, accompanied by visual status indicators (`Saved`, `Saving...`, `Unsaved changes`, `Failed to save`).

### 2.4 Authorization: Backend as the Single Source of Truth
- **Decision**: Centralized permission validation in an Express middleware (`requireDocumentAccess`).
- **Rationale**: Frontend state checks are purely cosmetic. Every API endpoint that retrieves or modifies document data validates whether `req.user.id` is the document owner or holds a matching `DocumentShare` record with sufficient permissions:
  - **OWNER**: Full administrative privileges (read, write, delete, manage shares).
  - **EDITOR**: Can read, write content, and rename. Cannot delete or manage shares.
  - **VIEWER**: Read-only access. Write endpoints return `403 Forbidden`.

### 2.5 Frontend Modular Structure & Strict State Separation
- **Decision**: Adhered strictly to the **Feature-Module Pattern** (`modules/` and `shared/`) and separated state origins.
- **Rationale**:
  - **Server State** lives exclusively in **TanStack Query** (caching, query invalidation, background refetching).
  - **UI / Client State** lives in **Zustand** (authentication token, active modal toggles).
  - No server entities are manually copied or synchronized into client stores, preventing cache drift and race conditions.

---

## 3. Database Schema Design

```prisma
model User {
  id              String          @id @default(uuid())
  name            String
  email           String          @unique
  password        String
  ownedDocuments  Document[]      @relation("DocumentOwner")
  sharedDocuments DocumentShare[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model Document {
  id        String          @id @default(uuid())
  title     String          @default("Untitled Document")
  content   Json            @default("{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\"}]}")
  ownerId   String
  owner     User            @relation("DocumentOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  shares    DocumentShare[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@index([ownerId])
}

model DocumentShare {
  id         String     @id @default(uuid())
  documentId String
  document   Document   @relation(fields: [documentId], references: [id], onDelete: Cascade)
  userId     String
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission Permission @default(VIEWER)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt

  @@unique([documentId, userId])
  @@index([userId])
}
```

---

## 4. Intentional Trade-offs & Scope Cuts

Under timebox constraints, we deliberately made scope cuts to maximize core product reliability:

1. **Real-time WebSockets / Multi-cursor CRDTs (Deprioritized)**:
   - *Alternative Considered*: Yjs / WebSocket collaboration server.
   - *Why Cut*: Introducing CRDT/OT operational transforms dramatically increases infrastructure complexity and state synchronization edge cases. We prioritized rock-solid document persistence, reliable autosave, and verified permission boundaries.
2. **Binary DOCX File Parsing (Deprioritized)**:
   - *Alternative Considered*: Complex mammoth.js / docx binary parsers.
   - *Why Cut*: Microsoft Word XML parsing produces erratic HTML formatting. Standardizing on `.txt` and `.md` provides deterministic, high-fidelity conversion into TipTap nodes.
3. **Comments & Inline Annotations (Deprioritized)**:
   - *Why Cut*: Deferred in favor of delivering clean permission management, responsive UI states, and comprehensive automated test coverage.
