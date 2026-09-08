import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Star,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Share2,
  SlidersHorizontal,
  Download,
  Printer,
  FileText,
  Plus,
  Undo2,
  Redo2,
  RotateCcw,
  Sparkles,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { IDocumentDetail } from '@/shared/types';
import { exportDocumentToMarkdown, exportDocumentToText, printDocument } from '@/shared/utils/exportUtils';
import { useStarredDocuments } from '@/modules/documents';
import { SaveStatus } from '../hooks/useAutosave';

interface EditorHeaderProps {
  document: IDocumentDetail;
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur: () => void;
  isEditable: boolean;
  saveStatus: SaveStatus;
  retrySave: () => void;
  editor: Editor | null;
  onOpenShare: () => void;
  onOpenImport: () => void;
  onNewDoc: () => void;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
  isInspectorOpen: boolean;
  isFullWidth: boolean;
  onToggleFullWidth: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  document,
  title,
  onTitleChange,
  onTitleBlur,
  isEditable,
  saveStatus,
  retrySave,
  editor,
  onOpenShare,
  onOpenImport,
  onNewDoc,
  onToggleSidebar,
  onToggleInspector,
  isInspectorOpen,
  isFullWidth,
  onToggleFullWidth,
}) => {
  const { isStarred: checkStarred, toggleStar } = useStarredDocuments();
  const isStarred = checkStarred(document.id);
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'view' | 'insert' | 'export' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white border-b border-zinc-200 px-6 py-2.5 flex flex-col gap-1.5 select-none relative z-30 shadow-2xs">
      <div className="flex items-center justify-between">
        {/* Left: Title + Star + Menus */}
        <div className="flex flex-col flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2">
            {isEditable ? (
              <input
                type="text"
                value={title}
                onChange={onTitleChange}
                onBlur={onTitleBlur}
                placeholder="Untitled Document"
                className="text-lg font-bold text-zinc-900 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-blue-600 focus:outline-none px-1 py-0.5 max-w-sm sm:max-w-md truncate transition"
              />
            ) : (
              <span className="text-lg font-bold text-zinc-900 px-1 py-0.5 truncate max-w-sm sm:max-w-md">
                {title}
              </span>
            )}

            <button
              onClick={() => toggleStar(document.id)}
              className={`p-1 rounded-md transition cursor-pointer ${
                isStarred
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-zinc-300 hover:text-zinc-600'
              }`}
              title={isStarred ? 'Unstar' : 'Star document'}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-500' : 'text-zinc-300'}`} />
            </button>
          </div>

          {/* Menubar (File, Edit, View, Insert) */}
          <div ref={menuRef} className="flex items-center gap-1 text-xs text-zinc-600 font-medium mt-0.5 relative">
            {/* File Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                className={`px-2 py-1 rounded-md hover:bg-zinc-100 transition cursor-pointer ${
                  activeMenu === 'file' ? 'bg-zinc-100 text-zinc-900 font-semibold' : ''
                }`}
              >
                File
              </button>

              {activeMenu === 'file' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-md shadow-float border border-zinc-200/90 py-1.5 z-50 animate-fade-in-up">
                  <button
                    onClick={() => {
                      onNewDoc();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-400" />
                    <span>New Document</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenImport();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Import File (.md, .txt)</span>
                  </button>

                  <div className="h-[1px] bg-zinc-100 my-1" />

                  <button
                    onClick={() => {
                      exportDocumentToMarkdown(title, editor);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Export as Markdown (.md)</span>
                  </button>

                  <button
                    onClick={() => {
                      exportDocumentToText(title, editor);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Export as Plain Text (.txt)</span>
                  </button>

                  <button
                    onClick={() => {
                      printDocument();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Print / Save to PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                className={`px-2 py-1 rounded-md hover:bg-zinc-100 transition cursor-pointer ${
                  activeMenu === 'edit' ? 'bg-zinc-100 text-zinc-900 font-semibold' : ''
                }`}
              >
                Edit
              </button>

              {activeMenu === 'edit' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-float border border-zinc-200/90 py-1.5 z-50 animate-fade-in-up">
                  <button
                    onClick={() => {
                      editor?.chain().focus().undo().run();
                      setActiveMenu(null);
                    }}
                    disabled={!editor?.can().undo()}
                    className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Undo2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Undo</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Ctrl+Z</span>
                  </button>

                  <button
                    onClick={() => {
                      editor?.chain().focus().redo().run();
                      setActiveMenu(null);
                    }}
                    disabled={!editor?.can().redo()}
                    className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Redo2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Redo</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Ctrl+Y</span>
                  </button>

                  <div className="h-[1px] bg-zinc-100 my-1" />

                  <button
                    onClick={() => {
                      editor?.chain().focus().selectAll().run();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <span>Select All</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Ctrl+A</span>
                  </button>

                  <button
                    onClick={() => {
                      editor?.chain().focus().unsetAllMarks().clearNodes().run();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Clear Formatting</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
                className={`px-2 py-1 rounded-md hover:bg-zinc-100 transition cursor-pointer ${
                  activeMenu === 'view' ? 'bg-zinc-100 text-zinc-900 font-semibold' : ''
                }`}
              >
                View
              </button>

              {activeMenu === 'view' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-float border border-zinc-200/90 py-1.5 z-50 animate-fade-in-up">
                  <button
                    onClick={() => {
                      onToggleSidebar();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Toggle Sidebar</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleInspector();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Toggle Page Details</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleFullWidth();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    {isFullWidth ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Standard Width</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Full Page Width</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Insert Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'insert' ? null : 'insert')}
                className={`px-2 py-1 rounded-md hover:bg-zinc-100 transition cursor-pointer ${
                  activeMenu === 'insert' ? 'bg-zinc-100 text-zinc-900 font-semibold' : ''
                }`}
              >
                Insert
              </button>

              {activeMenu === 'insert' && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-float border border-zinc-200/90 py-1.5 z-50 animate-fade-in-up">
                  <button
                    onClick={() => {
                      editor?.chain().focus().toggleHeading({ level: 1 }).run();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Heading1 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Heading 1</span>
                  </button>

                  <button
                    onClick={() => {
                      editor?.chain().focus().toggleHeading({ level: 2 }).run();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Heading2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Heading 2</span>
                  </button>

                  <button
                    onClick={() => {
                      editor?.chain().focus().toggleHeading({ level: 3 }).run();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Heading3 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Heading 3</span>
                  </button>

                  <div className="h-[1px] bg-zinc-100 my-1" />

                  <button
                    onClick={() => {
                      editor?.chain().focus().toggleBulletList().run();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <List className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Bullet List</span>
                  </button>

                  <button
                    onClick={() => {
                      editor?.chain().focus().toggleOrderedList().run();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Numbered List</span>
                  </button>

                  <button
                    onClick={() => {
                      editor?.chain().focus().toggleTaskList().run();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Task Checklist</span>
                  </button>

                  <button
                    onClick={() => {
                      editor?.chain().focus().setHorizontalRule().run();
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Horizontal Line</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Save Status + Export + Share + Inspector Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cloud Save Pill */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium mr-1">
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Saved just now</span>
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-blue-600 font-semibold text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Unsaved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-red-600 font-semibold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Failed</span>
                <button
                  onClick={retrySave}
                  className="underline ml-0.5 hover:text-red-700 cursor-pointer"
                >
                  Retry
                </button>
              </span>
            )}
          </div>

          {/* Dedicated Export Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'export' ? null : 'export')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Export or download document"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export</span>
            </button>

            {activeMenu === 'export' && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-md shadow-float border border-zinc-200/90 py-1.5 z-50 animate-fade-in-up">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Export Document
                </div>
                <button
                  onClick={() => {
                    exportDocumentToMarkdown(title, editor);
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  onClick={() => {
                    exportDocumentToText(title, editor);
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Plain Text (.txt)</span>
                </button>
                <div className="h-[1px] bg-zinc-100 my-1" />
                <button
                  onClick={() => {
                    printDocument();
                    setActiveMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Print / PDF Document</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary "+ Share" Blue Button (Google Docs style) */}
          {document.isOwner ? (
            <button
              onClick={onOpenShare}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          ) : (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold border ${
                document.permission === 'EDITOR'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200'
              }`}
            >
              {document.permission === 'EDITOR' ? 'Editor' : 'Viewer'}
            </span>
          )}

          {/* Page Details Toggle (ClickUp 3.0 style) */}
          <button
            onClick={onToggleInspector}
            className={`p-2 rounded-md transition cursor-pointer ${
              isInspectorOpen
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
            title="Page Details & Customizer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
