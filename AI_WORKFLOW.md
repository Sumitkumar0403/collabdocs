# AI-Native Engineering Workflow & Reflection Note

This note documents how AI was strategically leveraged during the development of **CollabDocs**, where it accelerated delivery, what suggestions were rejected, and how quality and security were verified.

---

## 1. AI Tools Used

- **Google Antigravity IDE (Gemini 3.8 Flash Agentic Pairing)**: Used for rapid full-stack scaffolding, architectural alignment, TypeScript contract generation, and automated integration test authoring.
- **ChatGPT**: Used for initial prompt analysis, domain model brainstorming, and requirements breakdown.

---

## 2. Where AI Materially Accelerated Delivery

1. **Feature-Module Monorepo Scaffolding**:
   - Rapidly created the complete dual-workspace setup (`client/` and `server/`) with TypeScript configurations, Tailwind CSS tokens, and Prisma schema definitions.
2. **TipTap ProseMirror AST Mapping**:
   - Generated the markdown/text line parser in `importService.ts` that maps raw lines into structured ProseMirror JSON nodes (`heading`, `listItem`, `bulletList`, `orderedList`), avoiding third-party parser bloat.
3. **Automated Integration Test Authoring**:
   - Accelerated the creation of multi-step Supertest integration tests simulating complete Alice-to-Bob sharing and permission boundary checks (`403 Forbidden` vs `200 OK`).

---

## 3. What AI-Generated Output Was Changed or Rejected

### Rejection 1: WebSocket / CRDT Real-Time Collaboration
- **Initial AI Proposal**: Several generated snippets suggested adding Socket.io with Yjs CRDTs for live cursor synchronization.
- **Engineering Judgment & Rejection**: A live CRDT synchronization engine increases state complexity exponentially and often leads to subtle merge conflicts or broken socket heartbeats. The product objective was a reliable, production-grade core slice. We intentionally rejected real-time sockets in favor of robust debounced autosave (800ms) with unambiguous save status indicators.

### Rejection 2: Client-Side Permission Gating
- **Initial AI Proposal**: Early suggested UI components relied on local state flags (`canEdit = user.role === 'EDITOR'`) to allow or block operations.
- **Engineering Judgment & Rejection**: Never trust the client. We refactored all document mutations to pass through a centralized Express authorization middleware (`requireDocumentAccess`) that re-validates the database relationship on every request.

### Rejection 3: Full DOCX Binary Parsing
- **Initial AI Proposal**: Suggested installing large npm libraries (`mammoth`, `docx`) to support Word document uploads.
- **Engineering Judgment & Rejection**: Word binary parsing produces messy HTML spans with style attributes that conflict with TipTap's strict node schema. We restricted supported formats to `.txt` and `.md` with clear UI warnings and strict 2MB validation.

---

## 4. How Implementation Quality & Reliability Were Verified

1. **Automated Testing**:
   - Supertest integration tests validating:
     - Unauthorized access prevention (`403 Forbidden`).
     - Access grant transitions upon sharing (`200 OK`).
     - Viewer write-protection enforcement (`403 Forbidden`).
2. **Session & Persistence Verification**:
   - Simulated full browser reloads after debounced autosave to verify that formatted rich-text persists losslessly in PostgreSQL.
3. **Cross-User Sharing Flow**:
   - Verified that documents created by Alice appear under Bob's "Shared With Me" view, and Bob is restricted according to his granted permission.
4. **Security Auditing**:
   - Verified that password hashes are never returned by `/api/auth` or `/api/documents`.
   - Verified that rate-limiting guards against brute-force attacks on `/api/auth/login`.
