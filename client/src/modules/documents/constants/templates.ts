export interface IDocTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  accentColor: string; // e.g. blue, purple, orange, emerald
  previewLines: Array<{ width: string; color?: string }>;
  initialDocTitle: string;
  content: Record<string, any>;
}

export const DOCUMENT_TEMPLATES: IDocTemplate[] = [
  {
    id: 'blank',
    title: 'Blank document',
    subtitle: 'Start from scratch',
    category: 'General',
    accentColor: '#6366F1',
    previewLines: [],
    initialDocTitle: 'Untitled Document',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    },
  },
  {
    id: 'meeting-notes',
    title: 'Meeting notes',
    subtitle: 'Simple and clean',
    category: 'Productivity',
    accentColor: '#3B82F6',
    previewLines: [
      { width: '75%', color: '#3B82F6' },
      { width: '45%', color: '#93C5FD' },
      { width: '90%', color: '#E2E8F0' },
      { width: '80%', color: '#E2E8F0' },
      { width: '60%', color: '#E2E8F0' },
    ],
    initialDocTitle: 'Meeting Notes - ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '📅 Team Sync & Meeting Notes' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Date: ' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '🎯 Meeting Goal' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Align team on upcoming project milestones, sprint priorities, and address blockers.' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '👥 Attendees' }],
        },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Alice Smith (Lead)' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bob Jones (Engineering)' }] }] },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '📝 Discussion & Notes' }],
        },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Architecture overview and data sync strategy reviewed.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'UI components updated with studio-grade design system.' }] }] },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '✅ Action Items' }],
        },
        {
          type: 'taskList',
          content: [
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Deploy backend endpoints to Neon database' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Complete integration testing suite' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Review team feedback and finalize docs' }] }] },
          ],
        },
      ],
    },
  },
  {
    id: 'project-proposal',
    title: 'Project proposal',
    subtitle: 'Professional',
    category: 'Business',
    accentColor: '#8B5CF6',
    previewLines: [
      { width: '80%', color: '#8B5CF6' },
      { width: '50%', color: '#C4B5FD' },
      { width: '95%', color: '#E2E8F0' },
      { width: '85%', color: '#E2E8F0' },
      { width: '70%', color: '#E2E8F0' },
    ],
    initialDocTitle: 'Project Proposal - ' + new Date().getFullYear(),
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '🚀 Project Proposal: Collaborative Document System' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. Executive Summary' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This proposal outlines the implementation of a high-performance, real-time collaborative document platform featuring rich-text editing, granular permissions, autosave, and studio aesthetics.' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. Objectives & Scope' }],
        },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sub-50ms editor responsiveness with TipTap pro extensions' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Reliable autosave with debounced mutation queues and flush on unload' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Seamless owner/editor/viewer sharing matrix' }] }] },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. Deliverables & Milestones' }],
        },
        {
          type: 'taskList',
          content: [
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Milestone 1: Database Schema & Authentication' }] }] },
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Milestone 2: Rich Text Editor & Toolbar' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Milestone 3: End-to-End Delivery & Walkthrough' }] }] },
          ],
        },
      ],
    },
  },
  {
    id: 'product-roadmap',
    title: 'Product roadmap',
    subtitle: 'Planning',
    category: 'Product',
    accentColor: '#F97316',
    previewLines: [
      { width: '70%', color: '#F97316' },
      { width: '40%', color: '#FDBA74' },
      { width: '90%', color: '#E2E8F0' },
      { width: '75%', color: '#E2E8F0' },
      { width: '65%', color: '#E2E8F0' },
    ],
    initialDocTitle: 'Product Roadmap Q3/Q4',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '🗺️ Product Roadmap (Q3 - Q4)' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Strategic product initiatives, upcoming feature releases, and engineering milestones.' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '🌟 Core Theme: Seamless Collaboration' }],
        },
        {
          type: 'taskList',
          content: [
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Phase 1: Real-time conflict resolution' }] }] },
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Phase 2: Markdown & Plaintext fast import' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Phase 3: Multiplayer live presence indicators' }] }] },
          ],
        },
      ],
    },
  },
  {
    id: 'research-report',
    title: 'Research report',
    subtitle: 'Academic',
    category: 'Research',
    accentColor: '#0EA5E9',
    previewLines: [
      { width: '85%', color: '#0EA5E9' },
      { width: '60%', color: '#7DD3FC' },
      { width: '90%', color: '#E2E8F0' },
      { width: '80%', color: '#E2E8F0' },
      { width: '70%', color: '#E2E8F0' },
    ],
    initialDocTitle: 'Research Report - Findings',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '🔬 Technical Research Report' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Abstract' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'An investigative study on modern client-server document synchronization architectures, comparing operational transformation (OT) and conflict-free replicated data types (CRDTs).' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Key Findings' }],
        },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Debounced JSON document snapshots provide high reliability with minimal server overhead.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'TipTap provides native headless JSON tree representations matching modern web standards.' }] }] },
          ],
        },
      ],
    },
  },
  {
    id: 'team-wiki',
    title: 'Team wiki',
    subtitle: 'Collaborative',
    category: 'Knowledge Base',
    accentColor: '#10B981',
    previewLines: [
      { width: '65%', color: '#10B981' },
      { width: '45%', color: '#6EE7B7' },
      { width: '85%', color: '#E2E8F0' },
      { width: '75%', color: '#E2E8F0' },
      { width: '90%', color: '#E2E8F0' },
    ],
    initialDocTitle: 'Engineering Team Wiki',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '📖 Engineering Team Wiki' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Welcome & Onboarding' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Welcome to the team! This wiki provides essential links, code standards, and workflows.' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Quick Links & Commands' }],
        },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Run backend: cd server && npm run dev' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Run frontend: cd client && npm run dev' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Run tests: cd server && npm test' }] }] },
          ],
        },
      ],
    },
  },
];
