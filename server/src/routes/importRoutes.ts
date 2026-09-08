import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as importController from '../controllers/importController';
import { authenticateUser } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Configure Multer with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.txt' && ext !== '.md') {
      return cb(
        new AppError(
          'Unsupported file format. Please upload a .txt or .md file.',
          400
        )
      );
    }
    cb(null, true);
  },
});

router.post(
  '/',
  authenticateUser,
  upload.single('file'),
  importController.importFile
);

export default router;
