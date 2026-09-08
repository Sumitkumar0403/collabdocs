import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from './errorHandler';

export type RequiredAccessLevel = 'VIEWER' | 'EDITOR' | 'OWNER';

export function requireDocumentAccess(requiredLevel: RequiredAccessLevel) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppError('Unauthorized', 401));
      }

      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          shares: {
            where: { userId },
          },
        },
      });

      if (!document) {
        return next(new AppError('Document not found', 404));
      }

      // 1. Is user the owner?
      if (document.ownerId === userId) {
        req.docAccess = { role: 'OWNER', isOwner: true };
        return next();
      }

      // 2. If operation requires OWNER permission and user is not owner
      if (requiredLevel === 'OWNER') {
        return next(
          new AppError('Only the document owner can perform this action', 403)
        );
      }

      // 3. Check shared permissions
      const share = document.shares[0];
      if (!share) {
        return next(
          new AppError('You do not have permission to access this document', 403)
        );
      }

      // 4. If EDITOR required but user is only VIEWER
      if (requiredLevel === 'EDITOR' && share.permission === 'VIEWER') {
        return next(
          new AppError('Viewers do not have permission to modify this document', 403)
        );
      }

      req.docAccess = { role: share.permission, isOwner: false };
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
