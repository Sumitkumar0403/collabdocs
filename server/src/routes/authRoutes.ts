import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticateUser, authController.getMe);

export default router;
