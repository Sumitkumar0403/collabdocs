import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { FontSize } from '../../extensions/fontSize';
import { Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/shared/api-client/axios';
import { IDocumentDetail } from '@/shared/types';
import { documentKeys, ImportFileDialog } from '@/modules/documents';
import { ShareModal } from '@/modules/sharing';
import { EditorSidebar } from '../../components/EditorSidebar';
import { EditorHeader } from '../../components/EditorHeader';
import { EditorToolbar } from '../../components/EditorToolbar';
import { PageDetailsSidebar } from '../../components/PageDetailsSidebar';
import { useAutosave } from '../../hooks/useAutosave';

export const DocumentEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSizeMode, setFontSizeMode] = useState<'small' | 'normal' | 'large'>('normal');
  const [fontSize, setFontSize] = useState<number>(16);

  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  const isLoadedForDocRef = useRef<string | null>(null);

  // Fetch document details
  const { data: document, isLoading, error } = useQuery<IDocumentDetail>({
    queryKey: documentKeys.detail(id || ''),
    queryFn: async () => {
      const res = await apiClient.get(`/documents/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const isEditable = document?.permission !== 'VIEWER';

  const { saveStatus, triggerAutosave, flushSave, retrySave } = useAutosave({
    documentId: id || '',
  });

  // TipTap editor instance with full extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    editable: isEditable,
    onUpdate: ({ editor }) => {
      if (isEditable && isLoadedForDocRef.current === id) {
        triggerAutosave({ content: editor.getJSON() });
        const text = editor.getText();
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
        setCharacterCount(text.length);
      }
    },
  });

  // Sync document data on initial load
  useEffect(() => {
    if (document && editor && id) {
      setTitle(document.title);

      if (isLoadedForDocRef.current !== id) {
        if (document.content && typeof document.content === 'object') {
          editor.commands.setContent(document.content);
        }
        isLoadedForDocRef.current = id;
        const text = editor.getText();
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
        setCharacterCount(text.length);
      }
    }
  }, [document, editor, id]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (isEditable) {
      triggerAutosave({ title: newTitle });
    }
  };

  const handleTitleBlur = () => {
    if (isEditable) {
      flushSave();
    }
  };

  const handleChangeFontSizeMode = (mode: 'small' | 'normal' | 'large') => {
    setFontSizeMode(mode);
    if (mode === 'small') setFontSize(14);
    if (mode === 'normal') setFontSize(16);
    if (mode === 'large') setFontSize(20);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
        <span className="text-xs font-semibold text-zinc-500">Opening document...</span>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4">
        <div className="p-8 max-w-md bg-white rounded-3xl border border-red-100 shadow-float text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 mb-1">
            Access Denied or Not Found
          </h2>
          <p className="text-xs text-zinc-500 mb-5">
            You may not have permission to view this document or it was deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-semibold transition cursor-pointer"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const fontFamilyClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#F0F2F5] text-zinc-900 antialiased">
      {/* 1. Left Studio Sidebar (Collapsible) */}
      <EditorSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onNewDocSuccess={(newId) => {
          navigate(`/doc/${newId}`);
        }}
      />

      {/* 2. Center Studio Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Menubar (File, Edit, View, Insert) */}
        <EditorHeader
          document={document}
          title={title}
          onTitleChange={handleTitleChange}
          onTitleBlur={handleTitleBlur}
          isEditable={isEditable}
          saveStatus={saveStatus}
          retrySave={retrySave}
          editor={editor}
          onOpenShare={() => setIsShareOpen(true)}
          onOpenImport={() => setIsImportOpen(true)}
          onNewDoc={() => {
            apiClient.post('/documents', { title: 'Untitled Document' }).then((res) => {
              navigate(`/doc/${res.data.data.id}`);
            });
          }}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
          isInspectorOpen={isInspectorOpen}
          isFullWidth={isFullWidth}
          onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
        />

        {/* Ribbon Formatting Toolbar */}
        <EditorToolbar
          editor={editor}
          disabled={!isEditable}
          fontFamily={fontFamily}
          onChangeFontFamily={setFontFamily}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
        />

        {/* Scrollable Canvas Area */}
        <div className="flex-1 overflow-y-auto bg-[#F0F2F5] py-8 px-4 sm:px-8 flex justify-center">
          <div
            className={`w-full transition-all duration-300 ${
              isFullWidth ? 'max-w-full px-2' : 'max-w-[850px]'
            }`}
          >
            {/* Elevated Paper Document Page (Google Docs Style) */}
            <div
              className={`bg-white rounded-md shadow-md border border-zinc-200/90 min-h-[1050px] p-10 sm:p-20 relative transition-all ${fontFamilyClass}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              <EditorContent editor={editor} />

              {/* Bottom Page Layout Indicator */}
              <div className="mt-20 pt-6 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium select-none">
                <span>
                  {wordCount} {wordCount === 1 ? 'word' : 'words'} • {characterCount} characters
                </span>
                <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-500">
                  1 of 1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right "Page Details & Customizer" Inspector (Collapsible) */}
      <PageDetailsSidebar
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        document={document}
        fontFamily={fontFamily}
        onChangeFontFamily={setFontFamily}
        fontSizeMode={fontSizeMode}
        onChangeFontSizeMode={handleChangeFontSizeMode}
        isFullWidth={isFullWidth}
        onChangeFullWidth={setIsFullWidth}
        wordCount={wordCount}
        characterCount={characterCount}
        editor={editor}
      />

      {/* Share Modal */}
      {id && (
        <ShareModal
          documentId={id}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {/* Import File Dialog */}
      <ImportFileDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
};
