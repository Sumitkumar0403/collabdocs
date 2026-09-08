import { Editor } from '@tiptap/react';

function nodeToMarkdown(node: any): string {
  if (!node) return '';

  if (node.type === 'text') {
    let text = node.text || '';
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'bold') text = `**${text}**`;
        if (mark.type === 'italic') text = `*${text}*`;
        if (mark.type === 'underline') text = `<u>${text}</u>`;
        if (mark.type === 'strike') text = `~~${text}~~`;
      }
    }
    return text;
  }

  const innerText = (node.content || []).map(nodeToMarkdown).join('');

  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level || 1;
      const hashes = '#'.repeat(level);
      return `${hashes} ${innerText}\n\n`;
    }
    case 'paragraph':
      return `${innerText}\n\n`;
    case 'bulletList':
      return (node.content || [])
        .map((item: any) => `- ${(item.content || []).map(nodeToMarkdown).join('').trim()}\n`)
        .join('') + '\n';
    case 'orderedList':
      return (node.content || [])
        .map((item: any, idx: number) => `${idx + 1}. ${(item.content || []).map(nodeToMarkdown).join('').trim()}\n`)
        .join('') + '\n';
    case 'taskList':
      return (node.content || [])
        .map((item: any) => `- [${item.attrs?.checked ? 'x' : ' '}] ${(item.content || []).map(nodeToMarkdown).join('').trim()}\n`)
        .join('') + '\n';
    case 'horizontalRule':
      return '---\n\n';
    default:
      return innerText;
  }
}

export function exportDocumentToMarkdown(title: string, editor: Editor | null) {
  if (!editor) return;
  const json = editor.getJSON();
  const mdContent = (json.content || []).map(nodeToMarkdown).join('');

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'document'}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDocumentToText(title: string, editor: Editor | null) {
  if (!editor) return;
  const textContent = editor.getText();

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title || 'document'}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printDocument() {
  window.print();
}
