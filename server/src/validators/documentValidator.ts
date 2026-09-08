import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200, 'Title cannot exceed 200 characters')
    .optional()
    .default('Untitled Document'),
});

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  content: z.record(z.any()).optional(),
});

export const shareDocumentSchema = z.object({
  email: z.string().trim().email('A valid collaborator email is required'),
  permission: z.enum(['VIEWER', 'EDITOR'], {
    errorMap: () => ({ message: 'Permission must be VIEWER or EDITOR' }),
  }),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ShareDocumentInput = z.infer<typeof shareDocumentSchema>;
