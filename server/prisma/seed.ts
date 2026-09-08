import { PrismaClient, Permission } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing records if any
  await prisma.documentShare.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Alice
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: hashedPassword,
    },
  });
  console.log(`👤 Created user: Alice (${alice.email})`);

  // 2. Create Bob
  const bob = await prisma.user.create({
    data: {
      name: 'Bob Jones',
      email: 'bob@example.com',
      password: hashedPassword,
    },
  });
  console.log(`👤 Created user: Bob (${bob.email})`);

  // 3. Create Sample Document 1 for Alice (Private)
  const doc1Content = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Welcome to CollabDocs 🚀' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'CollabDocs is a lightweight, intuitive collaborative document editor designed for fast-moving teams. It features rich-text formatting, debounced autosave, and granular document sharing.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Supported Formatting' }],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', marks: [{ type: 'bold' }], text: 'Bold' },
                  { type: 'text', text: ', ' },
                  { type: 'text', marks: [{ type: 'italic' }], text: 'italic' },
                  { type: 'text', text: ', and ' },
                  { type: 'text', marks: [{ type: 'underline' }], text: 'underlined' },
                  { type: 'text', text: ' text styles' },
                ],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Headings (H1 & H2) and bulleted/numbered lists' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Automatic 800ms background saving directly to PostgreSQL' }],
              },
            ],
          },
        ],
      },
    ],
  };

  const aliceDoc1 = await prisma.document.create({
    data: {
      title: 'Welcome to CollabDocs',
      content: doc1Content,
      ownerId: alice.id,
    },
  });
  console.log(`📄 Created Alice's private doc: "${aliceDoc1.title}"`);

  // 4. Create Sample Document 2 for Alice (Shared with Bob as EDITOR)
  const doc2Content = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Q4 Product Roadmap & Goals' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This document is collaboratively edited by Alice (Owner) and Bob (Editor). Feel free to update the quarterly milestones below.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Key Priorities' }],
      },
      {
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Finalize document sharing permissions and access controls.' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Verify markdown and text import pipelines.' }],
              },
            ],
          },
        ],
      },
    ],
  };

  const sharedDoc = await prisma.document.create({
    data: {
      title: 'Q4 Product Roadmap & Goals',
      content: doc2Content,
      ownerId: alice.id,
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: sharedDoc.id,
      userId: bob.id,
      permission: Permission.EDITOR,
    },
  });
  console.log(`🤝 Shared "${sharedDoc.title}" with Bob as EDITOR`);

  // 5. Create Bob's private document
  const bobDocContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: "Bob's Research Notes" }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Personal notes on frontend architecture, state splitting, and TipTap JSON persistence.',
          },
        ],
      },
    ],
  };

  const bobDoc = await prisma.document.create({
    data: {
      title: "Bob's Research Notes",
      content: bobDocContent,
      ownerId: bob.id,
    },
  });
  console.log(`📄 Created Bob's private doc: "${bobDoc.title}"`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
