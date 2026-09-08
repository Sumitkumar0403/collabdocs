import { Router } from 'express';
import * as documentController from '../controllers/documentController';
import * as shareController from '../controllers/shareController';
import { authenticateUser } from '../middleware/auth';
import { requireDocumentAccess } from '../middleware/documentAuth';

const router = Router();

// All document routes require authentication
router.use(authenticateUser);

// Dashboard listing
router.get('/', documentController.getDashboard);

// Create new document
router.post('/', documentController.create);

// Single document operations
router.get('/:id', requireDocumentAccess('VIEWER'), documentController.getOne);
router.patch('/:id', requireDocumentAccess('EDITOR'), documentController.update);
router.delete('/:id', requireDocumentAccess('OWNER'), documentController.remove);

// Sharing endpoints (Owner only)
router.post('/:id/share', requireDocumentAccess('OWNER'), shareController.share);
router.get('/:id/shares', requireDocumentAccess('OWNER'), shareController.getShares);
router.delete('/:id/shares/:userId', requireDocumentAccess('OWNER'), shareController.removeShare);

export default router;
