import { Router } from 'express';
import authRoutes from './authRoutes';
import documentRoutes from './documentRoutes';
import importRoutes from './importRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/documents/import', importRoutes);
router.use('/import', importRoutes);
router.use('/documents', documentRoutes);

export default router;
