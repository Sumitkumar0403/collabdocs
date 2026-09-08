import { Permission } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface DocumentAccessContext {
  role: 'OWNER' | Permission;
  isOwner: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      docAccess?: DocumentAccessContext;
    }
  }
}
