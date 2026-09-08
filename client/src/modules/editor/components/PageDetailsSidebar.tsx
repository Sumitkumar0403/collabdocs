import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  X,
  Type,
  Maximize2,
  Clock,
  Users,
  Calendar,
  FileText,
  AlignLeft,
  Sliders,
  Check,
  Crown,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { IDocumentDetail } from '@/shared/types';

interface PageDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  document: IDocumentDetail;
  fontFamily: 'sans' | 'serif' | 'mono';
  onChangeFontFamily: (font: 'sans' | 'serif' | 'mono') => void;
  fontSizeMode: 'small' | 'normal' | 'large';
  onChangeFontSizeMode: (mode: 'small' | 'normal' | 'large') => void;
  isFullWidth: boolean;
  onChangeFullWidth: (full: boolean) => void;
  wordCount: number;
  characterCount: number;
  editor: Editor | null;
}

export const PageDetailsSidebar: React.FC<PageDetailsSidebarProps> = ({
  isOpen,
  onClose,
  document,
  fontFamily,
  onChangeFontFamily,
  fontSizeMode,
  onChangeFontSizeMode,
  isFullWidth,
  onChangeFullWidth,
  wordCount,
  characterCount,
  editor,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  if (!isOpen) return null;

  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Extract headings from editor for Document Outline
  const headings: Array<{ text: string; level: number }> = [];
  if (editor) {
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'heading') {
        headings.push({
          text: node.textContent,
          level: node.attrs.level,
        });
      }
    });
  }

  const createdDate = new Date(document.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const updatedDate = new Date(document.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isSelectionActive = editor && !editor.state.selection.empty;

  // Determine active font family from selection mark, fallback to page default
  let activeFontFamily: 'sans' | 'serif' | 'mono' = fontFamily;
  if (editor) {
    const textStyleFont = editor.getAttributes('textStyle').fontFamily as string | undefined;
    if (textStyleFont) {
      if (textStyleFont.includes('Merriweather') || textStyleFont.includes('serif')) {
        activeFontFamily = 'serif';
      } else if (textStyleFont.includes('JetBrains') || textStyleFont.includes('mono')) {
        activeFontFamily = 'mono';
      } else if (textStyleFont.includes('Jakarta') || textStyleFont.includes('sans')) {
        activeFontFamily = 'sans';
      }
    }
  }

  // Determine active font size mode from selection mark, fallback to page default
  let activeFontSizeMode: 'small' | 'normal' | 'large' = fontSizeMode;
  if (editor) {
    const textStyleSize = editor.getAttributes('textStyle').fontSize as string | undefined;
    if (textStyleSize) {
      const px = parseInt(textStyleSize, 10);
      if (px <= 14) activeFontSizeMode = 'small';
      else if (px <= 18) activeFontSizeMode = 'normal';
      else activeFontSizeMode = 'large';
    }
  }

  const handleSelectFont = (fontKey: 'sans' | 'serif' | 'mono') => {
    if (editor && !editor.state.selection.empty) {
      const fontName =
        fontKey === 'serif'
          ? 'Merriweather, serif'
          : fontKey === 'mono'
          ? 'JetBrains Mono, monospace'
          : 'Plus Jakarta Sans, sans-serif';
      editor.chain().focus().setFontFamily(fontName).run();
    } else {
      onChangeFontFamily(fontKey);
    }
  };

  const handleSelectFontSizeMode = (mode: 'small' | 'normal' | 'large') => {
    if (editor && !editor.state.selection.empty) {
      const sizePx = mode === 'small' ? '14px' : mode === 'normal' ? '16px' : '20px';
      editor.chain().focus().setFontSize(sizePx).run();
    } else {
      onChangeFontSizeMode(mode);
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-zinc-200 flex flex-col justify-between select-none shrink-0 transition-all z-20 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900">Page Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Basic / Advanced) */}
        <div className="flex items-center px-4 pt-3 border-b border-zinc-100 gap-4">
          <button
            onClick={() => setActiveTab('basic')}
            className={`pb-2 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`pb-2 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'advanced'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Advanced & Outline
          </button>
        </div>

        {/* Content Container */}
        <div className="p-5 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto">
          {activeTab === 'basic' ? (
            <>
              {/* 1. Font Family Selector (ClickUp 3.0 visual cards) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {isSelectionActive ? 'Selected Text Font' : 'Page Font Theme'}
                  </label>
                  {isSelectionActive && (
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Selection Active
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* Sans */}
                  <button
                    type="button"
                    onClick={() => handleSelectFont('sans')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      activeFontFamily === 'sans'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white'
                    }`}
                  >
                    <span className="text-xl font-bold font-sans text-zinc-900 mb-1">
                      Aa
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600">
                      Sans
                    </span>
                  </button>

                  {/* Serif */}
                  <button
                    type="button"
                    onClick={() => handleSelectFont('serif')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      activeFontFamily === 'serif'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white'
                    }`}
                  >
                    <span className="text-xl font-bold font-serif text-zinc-900 mb-1">
                      Aa
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600">
                      Serif
                    </span>
                  </button>

                  {/* Mono */}
                  <button
                    type="button"
                    onClick={() => handleSelectFont('mono')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      activeFontFamily === 'mono'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                        : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white'
                    }`}
                  >
                    <span className="text-xl font-bold font-mono text-zinc-900 mb-1">
                      Aa
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600">
                      Mono
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Font Size Mode */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {isSelectionActive ? 'Selected Text Size' : 'Font Size Mode'}
                  </label>
                  {isSelectionActive && (
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Selection Active
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-md">
                  {(['small', 'normal', 'large'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleSelectFontSizeMode(mode)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        activeFontSizeMode === mode
                          ? 'bg-white text-zinc-900 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Page Width Mode */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Page Width
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-md">
                  <button
                    type="button"
                    onClick={() => onChangeFullWidth(false)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      !isFullWidth
                        ? 'bg-white text-blue-700 font-bold shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Normal (Page)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeFullWidth(true)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isFullWidth
                        ? 'bg-white text-blue-700 font-bold shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Full Width
                  </button>
                </div>
              </div>

              {/* 4. Document Metadata */}
              <div className="pt-4 border-t border-zinc-100 space-y-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Metadata & Access
                </span>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Crown className="w-3.5 h-3.5 text-blue-600" />
                    <span>Owner</span>
                  </div>
                  <span className="font-semibold text-zinc-800">
                    {document.owner.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Your Permission</span>
                  </div>
                  <span className="font-semibold text-zinc-800 uppercase text-[11px]">
                    {document.permission}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Created</span>
                  </div>
                  <span className="text-zinc-600">{createdDate}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Last Saved</span>
                  </div>
                  <span className="text-zinc-600">{updatedDate}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Advanced: Document Outline (TOC) */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Document Outline ({headings.length})
                </span>

                {headings.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic py-2">
                    Add headings (H1, H2, H3) to automatically generate an outline.
                  </p>
                ) : (
                  <div className="space-y-1.5 border-l border-zinc-200 pl-3">
                    {headings.map((h, i) => (
                      <div
                        key={i}
                        className={`text-xs text-zinc-700 hover:text-blue-600 truncate transition cursor-pointer ${
                          h.level === 1
                            ? 'font-bold'
                            : h.level === 2
                            ? 'font-medium pl-2 text-zinc-600'
                            : 'text-zinc-500 pl-4'
                        }`}
                      >
                        {h.text || 'Untitled Heading'}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Statistics */}
              <div className="pt-4 border-t border-zinc-100 space-y-3">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Document Statistics
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-zinc-50 rounded-md border border-zinc-100 text-center">
                    <div className="text-lg font-extrabold text-zinc-900 font-mono">
                      {wordCount}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400 mt-0.5">
                      Words
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 rounded-md border border-zinc-100 text-center">
                    <div className="text-lg font-extrabold text-zinc-900 font-mono">
                      {characterCount}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400 mt-0.5">
                      Characters
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-md border border-blue-100 text-center">
                  <span className="text-xs font-bold text-blue-900">
                    ~{readingTimeMinutes} min read time
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
