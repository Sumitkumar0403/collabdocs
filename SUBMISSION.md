# CollabDocs — Assignment Submission Checklist

This submission package contains all deliverables required for the Ajaia engineering assessment.

---

## 1. Submission Links

- **Live Application URL**: `[INSERT_YOUR_DEPLOYED_URL_HERE]` *(e.g., https://collabdocs.vercel.app)*
- **Walkthrough Video (3–5 min)**: `[INSERT_YOUR_LOOM_OR_YOUTUBE_URL_HERE]`
- **Source Code Repository**: Provided in this folder.

---

## 2. Included Deliverables

| Deliverable | Location | Description |
| :--- | :--- | :--- |
| **Source Code** | `/client`, `/server` | Full-stack monorepo (React + Express + Prisma + PostgreSQL) |
| **Setup Guide** | [`README.md`](./README.md) | Step-by-step local run instructions & project summary |
| **Architecture Note** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Technical decisions, TipTap selection, schema, & trade-offs |
| **AI Workflow Note** | [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) | AI acceleration points, rejected approaches, & verification |
| **Submission Checklist** | [`SUBMISSION.md`](./SUBMISSION.md) | Reviewer quick-reference guide & demo accounts |
| **Automated Tests** | [`server/tests/sharing.test.ts`](./server/tests/sharing.test.ts) | Supertest integration tests verifying sharing permissions |

---

## 3. Seeded Demo Accounts for Reviewers

Use these credentials to test ownership, cross-user collaboration, and permission boundaries:

| Account | Email | Password | Role / Purpose |
| :--- | :--- | :--- | :--- |
| **Alice** | `alice@example.com` | `Password123!` | Document Owner & Collaborator |
| **Bob** | `bob@example.com` | `Password123!` | Document Collaborator (Editor / Viewer) |

> 💡 **Tip for Reviewers:** The login screen provides **1-Click Quick Fill** buttons for both Alice and Bob.

---

## 4. Feature Status Matrix

### ✅ Complete & Functional
- [x] **Document Creation & Renaming**: Seamless inline title edits with instant persistence.
- [x] **Rich-Text Editing**: TipTap editor supporting Bold, Italic, Underline, H1, H2, Bullet Lists, and Numbered Lists.
- [x] **Debounced Autosave**: 800ms background saving with live state indicator (`Saved`, `Saving...`, `Unsaved`, `Error`).
- [x] **PostgreSQL Persistence**: TipTap JSON structures stored losslessly in Postgres.
- [x] **Document Sharing**: Owner can grant `EDITOR` or `VIEWER` permissions by email and revoke access.
- [x] **Dashboard Partitioning**: Instant visual separation between **"My Documents"** and **"Shared with Me"**.
- [x] **Backend Authorization**: Strict middleware enforcing `403 Forbidden` on unauthorized reads or writes.
- [x] **File Import**: Upload `.txt` and `.md` files (up to **10 MB**) and immediately convert them into editable documents.
- [x] **Document Export (Stretch Feature)**: 1-click export to **Markdown (.md)**, **Plain Text (.txt)**, and **Print / PDF**.
- [x] **Automated Integration Tests**: Validating multi-user sharing and access protection via Supertest.

### ⏸️ Intentionally Deferred
- **Real-Time WebSocket Collaboration**: Excluded to ensure high reliability and zero socket dropouts within the timebox.
- **DOCX / Binary Parsing**: Excluded to avoid format corruption and styling regressions.
- **Inline Comments**: Deferred in favor of delivering core editing and sharing flows.

### 🚀 Next Steps (With Another 2–4 Hours)
1. **Live Presence Cursors**: Add lightweight presence indicators using WebSockets or Server-Sent Events (SSE).
2. **Document Version History**: Track revisions and allow reverting to prior snapshots.
3. **Template Gallery**: Pre-populate structured templates (e.g. Meeting Notes, Sprint Plans).
