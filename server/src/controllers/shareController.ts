import { Request, Response, NextFunction } from 'express';
import { shareDocumentSchema } from '../validators/documentValidator';
import * as shareService from '../services/shareService';

export async function share(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: documentId } = req.params;
    const ownerId = req.user!.id;
    const validated = shareDocumentSchema.parse(req.body);

    const share = await shareService.shareDocument(documentId, ownerId, validated);
    return res.status(200).json({
      success: true,
      data: share,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getShares(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: documentId } = req.params;
    const shares = await shareService.getDocumentShares(documentId);
    return res.status(200).json({
      success: true,
      data: shares,
    });
  } catch (error) {
    return next(error);
  }
}

export async function removeShare(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: documentId, userId: targetUserId } = req.params;
    const result = await shareService.removeDocumentShare(documentId, targetUserId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
