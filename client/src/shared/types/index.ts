export type PermissionRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface IDocumentSummary {
  id: string;
  title: string;
  content?: any;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  permission: PermissionRole;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  shareCount?: number;
}

export interface IDocumentDetail {
  id: string;
  title: string;
  content: any;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  permission: PermissionRole;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

export interface IDocumentShare {
  id: string;
  userId: string;
  permission: 'VIEWER' | 'EDITOR';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface IDashboardResponse {
  owned: IDocumentSummary[];
  shared: IDocumentSummary[];
}
