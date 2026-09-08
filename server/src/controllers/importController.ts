import { Request, Response, NextFunction } from 'express';
import * as importService from '../services/importService';

export async function importFile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const file = req.file as Express.Multer.File;

    const document = await importService.importDocumentFromFile(userId, file);
    return res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    return next(error);
  }
}
