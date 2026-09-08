import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/db';
import bcrypt from 'bcryptjs';

describe('Document Sharing & Authorization Integration Tests', () => {
  let aliceToken: string;
  let bobToken: string;
  let charlieToken: string;
  let aliceId: string;
  let bobId: string;
  let charlieId: string;
  let testDocumentId: string;

  beforeAll(async () => {
    // Reset test database records
    await prisma.documentShare.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Create Alice
    const alice = await prisma.user.create({
      data: {
        name: 'Alice Smith',
        email: 'alice.test@example.com',
        password: passwordHash,
      },
    });
    aliceId = alice.id;

    // Create Bob
    const bob = await prisma.user.create({
      data: {
        name: 'Bob Jones',
        email: 'bob.test@example.com',
        password: passwordHash,
      },
    });
    bobId = bob.id;

    // Create Charlie (for viewer test)
    const charlie = await prisma.user.create({
      data: {
        name: 'Charlie Brown',
        email: 'charlie.test@example.com',
        password: passwordHash,
      },
    });
    charlieId = charlie.id;

    // Log in Alice
    const aliceLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice.test@example.com', password: 'Password123!' });
    aliceToken = aliceLogin.body.data.token;

    // Log in Bob
    const bobLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob.test@example.com', password: 'Password123!' });
    bobToken = bobLogin.body.data.token;

    // Log in Charlie
    const charlieLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'charlie.test@example.com', password: 'Password123!' });
    charlieToken = charlieLogin.body.data.token;
  });

  afterAll(async () => {
    await prisma.documentShare.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('Step 1: Alice creates a private document', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ title: "Alice's Secret Project" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Alice's Secret Project");
    expect(res.body.data.isOwner).toBe(true);

    testDocumentId = res.body.data.id;
  });

  it('Step 2: Bob attempts to access Document A without permission -> 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/documents/${testDocumentId}`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('You do not have permission');
  });

  it('Step 3: Alice shares Document A with Bob with EDITOR permission', async () => {
    const res = await request(app)
      .post(`/api/documents/${testDocumentId}/share`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ email: 'bob.test@example.com', permission: 'EDITOR' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.permission).toBe('EDITOR');
    expect(res.body.data.user.email).toBe('bob.test@example.com');
  });

  it('Step 4: Bob can now access Document A -> 200 OK', async () => {
    const res = await request(app)
      .get(`/api/documents/${testDocumentId}`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Alice's Secret Project");
    expect(res.body.data.permission).toBe('EDITOR');
  });

  it('Step 5: Bob (EDITOR) can successfully update Document A', async () => {
    const res = await request(app)
      .patch(`/api/documents/${testDocumentId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({
        title: "Alice's Secret Project (Updated by Bob)",
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bob contributed here.' }] }] },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Alice's Secret Project (Updated by Bob)");
  });

  it('Step 6: Alice shares Document A with Charlie as VIEWER', async () => {
    const res = await request(app)
      .post(`/api/documents/${testDocumentId}/share`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ email: 'charlie.test@example.com', permission: 'VIEWER' });

    expect(res.status).toBe(200);
    expect(res.body.data.permission).toBe('VIEWER');
  });

  it('Step 7: Charlie (VIEWER) can read Document A -> 200 OK', async () => {
    const res = await request(app)
      .get(`/api/documents/${testDocumentId}`)
      .set('Authorization', `Bearer ${charlieToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.permission).toBe('VIEWER');
  });

  it('Step 8: Charlie (VIEWER) is prevented from editing Document A -> 403 Forbidden', async () => {
    const res = await request(app)
      .patch(`/api/documents/${testDocumentId}`)
      .set('Authorization', `Bearer ${charlieToken}`)
      .send({ title: 'Charlie Illegal Edit' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Viewers do not have permission');
  });

  it('Step 9: Non-owner (Bob) cannot delete the document -> 403 Forbidden', async () => {
    const res = await request(app)
      .delete(`/api/documents/${testDocumentId}`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Only the document owner');
  });
});
