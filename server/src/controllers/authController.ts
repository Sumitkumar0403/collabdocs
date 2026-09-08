import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../validators/authValidator';
import * as authService from '../services/authService';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await authService.loginUser(validated);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const user = await authService.getUserProfile(userId);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}
