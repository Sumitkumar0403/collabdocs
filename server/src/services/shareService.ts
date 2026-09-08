import { Permission } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { ShareDocumentInput } from '../validators/documentValidator';

export async function shareDocument(
  documentId: string,
  ownerId: string,
  input: ShareDocumentInput
) {
  // 1. Look up target user
  const targetUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!targetUser) {
    throw new AppError(`No user found with email "${input.email}".`, 404);
  }

  // 2. Prevent self-sharing
  if (targetUser.id === ownerId) {
    throw new AppError('You are already the owner of this document.', 400);
  }

  // 3. Upsert share record
  const share = await prisma.documentShare.upsert({
    where: {
      documentId_userId: {
        documentId,
        userId: targetUser.id,
      },
    },
    update: {
      permission: input.permission as Permission,
    },
    create: {
      documentId,
      userId: targetUser.id,
      permission: input.permission as Permission,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return {
    id: share.id,
    documentId: share.documentId,
    permission: share.permission,
    user: share.user,
    createdAt: share.createdAt,
  };
}

export async function getDocumentShares(documentId: string) {
  const shares = await prisma.documentShare.findMany({
    where: { documentId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return shares.map((s) => ({
    id: s.id,
    userId: s.userId,
    permission: s.permission,
    user: s.user,
    createdAt: s.createdAt,
  }));
}

export async function removeDocumentShare(documentId: string, targetUserId: string) {
  const existing = await prisma.documentShare.findUnique({
    where: {
      documentId_userId: {
        documentId,
        userId: targetUserId,
      },
    },
  });

  if (!existing) {
    throw new AppError('Share record not found', 404);
  }

  await prisma.documentShare.delete({
    where: {
      documentId_userId: {
        documentId,
        userId: targetUserId,
      },
    },
  });

  return { success: true, message: 'Access revoked successfully' };
}
