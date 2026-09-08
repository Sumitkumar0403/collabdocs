import path from 'path';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

interface TipTapMark {
  type: string;
}

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
}

/**
 * Parses inline Markdown formatting (bold, italic, underline) into TipTap text nodes with marks
 */
export function parseInlineFormatting(rawText: string): TipTapNode[] {
  if (!rawText) return [];

  const nodes: TipTapNode[] = [];
  // Regex to match bold+italic (***text*** or ___text___), bold (**text** or __text__), italic (*text* or _text_)
  const regex = /(\*\*\*([^*]+)\*\*\*)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(___([^_]+)___)|(__([^_]+)__)|(_([^_]+)_)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      nodes.push({
        type: 'text',
        text: rawText.substring(lastIndex, match.index),
      });
    }

    const fullMatch = match[0];

    if (fullMatch.startsWith('***') || fullMatch.startsWith('___')) {
      const text = match[2] || match[8];
      nodes.push({
        type: 'text',
        marks: [{ type: 'bold' }, { type: 'italic' }],
        text,
      });
    } else if (fullMatch.startsWith('**') || fullMatch.startsWith('__')) {
      const text = match[4] || match[10];
      nodes.push({
        type: 'text',
        marks: [{ type: 'bold' }],
        text,
      });
    } else if (fullMatch.startsWith('*') || fullMatch.startsWith('_')) {
      const text = match[6] || match[12];
      nodes.push({
        type: 'text',
        marks: [{ type: 'italic' }],
        text,
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Trailing text
  if (lastIndex < rawText.length) {
    nodes.push({
      type: 'text',
      text: rawText.substring(lastIndex),
    });
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', text: rawText }];
}

export function convertTextToTipTap(contentStr: string): { type: string; content: TipTapNode[] } {
  const lines = contentStr.split(/\r?\n/);
  const nodes: TipTapNode[] = [];

  let currentList: { type: 'bulletList' | 'orderedList'; items: TipTapNode[] } | null = null;

  function flushList() {
    if (currentList) {
      nodes.push({
        type: currentList.type,
        content: currentList.items,
      });
      currentList = null;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // 1. Heading 1: # Title
    if (trimmed.startsWith('# ')) {
      flushList();
      const text = trimmed.slice(2).trim();
      nodes.push({
        type: 'heading',
        attrs: { level: 1 },
        content: parseInlineFormatting(text),
      });
      continue;
    }

    // 2. Heading 2 & 3+: ## Subtitle or ### Subtitle
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      flushList();
      const text = trimmed.replace(/^#+\s*/, '').trim();
      nodes.push({
        type: 'heading',
        attrs: { level: 2 },
        content: parseInlineFormatting(text),
      });
      continue;
    }

    // 3. Bullet List: - item, * item, + item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('+ ')) {
      const itemText = trimmed.slice(2).trim();
      const listItem: TipTapNode = {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: parseInlineFormatting(itemText),
          },
        ],
      };

      if (!currentList || currentList.type !== 'bulletList') {
        flushList();
        currentList = { type: 'bulletList', items: [] };
      }
      currentList.items.push(listItem);
      continue;
    }

    // 4. Ordered List: 1. item, 2. item, etc.
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      const itemText = orderedMatch[2].trim();
      const listItem: TipTapNode = {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: parseInlineFormatting(itemText),
          },
        ],
      };

      if (!currentList || currentList.type !== 'orderedList') {
        flushList();
        currentList = { type: 'orderedList', items: [] };
      }
      currentList.items.push(listItem);
      continue;
    }

    // 5. Regular paragraph
    flushList();
    nodes.push({
      type: 'paragraph',
      content: parseInlineFormatting(trimmed),
    });
  }

  flushList();

  if (nodes.length === 0) {
    nodes.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '' }],
    });
  }

  return {
    type: 'doc',
    content: nodes,
  };
}

export async function importDocumentFromFile(
  userId: string,
  file: Express.Multer.File
) {
  if (!file) {
    throw new AppError('No file provided', 400);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.txt' && ext !== '.md') {
    throw new AppError('Unsupported file type. Only .txt and .md files are allowed.', 400);
  }

  const contentStr = file.buffer.toString('utf-8');
  const title = path.basename(file.originalname, ext) || 'Imported Document';

  const tipTapContent = convertTextToTipTap(contentStr);

  const doc = await prisma.document.create({
    data: {
      title,
      content: tipTapContent as any,
      ownerId: userId,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return {
    ...doc,
    permission: 'OWNER',
    isOwner: true,
  };
}
