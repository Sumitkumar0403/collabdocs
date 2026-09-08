import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { prisma } from '../config/db';
import { AppError } from './errorHandler';
import { AuthUser } from '../types/express';

interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export async function authenticateUser(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
    
    // Verify user actually exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return next(new AppError('User session expired or user no longer exists. Please log in again.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication token', 401));
  }
}
