import { Request, Response, NextFunction } from 'express';
import {
  createDocumentSchema,
  updateDocumentSchema,
} from '../validators/documentValidator';
import * as documentService from '../services/documentService';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const documents = await documentService.getDashboardDocuments(userId);
    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    return next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const validated = createDocumentSchema.parse(req.body);
    const document = await documentService.createDocument(userId, validated);
    return res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const document = await documentService.getDocumentById(id, userId);
    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    return next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = updateDocumentSchema.parse(req.body);
    const updated = await documentService.updateDocument(id, validated);
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await documentService.deleteDocument(id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
