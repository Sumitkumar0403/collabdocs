import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { CreateDocumentInput, UpdateDocumentInput } from '../validators/documentValidator';

const DEFAULT_TIPTAP_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

export async function getDashboardDocuments(userId: string) {
  // 1. Documents owned by the user
  const ownedDocs = await prisma.document.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      shares: {
        select: { id: true, userId: true, permission: true },
      },
    },
  });

  // 2. Documents shared with the user
  const sharedShares = await prisma.documentShare.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      document: {
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  const owned = ownedDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    isOwner: true,
    permission: 'OWNER',
    owner: doc.owner,
    shareCount: doc.shares.length,
  }));

  const shared = sharedShares.map((item) => ({
    id: item.document.id,
    title: item.document.title,
    content: item.document.content,
    createdAt: item.document.createdAt,
    updatedAt: item.document.updatedAt,
    isOwner: false,
    permission: item.permission,
    owner: item.document.owner,
  }));

  return { owned, shared };
}

export async function createDocument(userId: string, input: CreateDocumentInput) {
  const doc = await prisma.document.create({
    data: {
      title: input.title || 'Untitled Document',
      content: DEFAULT_TIPTAP_CONTENT,
      ownerId: userId,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return {
    ...doc,
    permission: 'OWNER',
    isOwner: true,
  };
}

export async function getDocumentById(id: string, userId: string) {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      shares: {
        where: { userId },
        select: { permission: true },
      },
    },
  });

  if (!doc) {
    throw new AppError('Document not found', 404);
  }

  const isOwner = doc.ownerId === userId;
  const permission = isOwner ? 'OWNER' : doc.shares[0]?.permission;

  return {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    owner: doc.owner,
    isOwner,
    permission,
  };
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const data: { title?: string; content?: any } = {};

  if (input.title !== undefined && input.title !== null) {
    data.title = input.title;
  }

  // Only update content if a valid TipTap doc object with nodes is passed
  if (
    input.content !== undefined &&
    input.content !== null &&
    typeof input.content === 'object' &&
    input.content.type === 'doc'
  ) {
    data.content = input.content;
  }

  const updated = await prisma.document.update({
    where: { id },
    data,
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updated;
}

export async function deleteDocument(id: string) {
  await prisma.document.delete({
    where: { id },
  });
  return { success: true, message: 'Document deleted successfully' };
}
