import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  ChevronDown,
  RotateCcw,
  Minus,
  Plus,
  Type,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  fontFamily: 'sans' | 'serif' | 'mono';
  onChangeFontFamily: (font: 'sans' | 'serif' | 'mono') => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  disabled = false,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
}) => {
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);

  const styleMenuRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const highlightMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target as Node)) {
        setIsStyleMenuOpen(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setIsFontMenuOpen(false);
      }
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(e.target as Node)) {
        setIsHighlightMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) return null;

  // Determine current heading label
  let currentStyle = 'Normal text';
  if (editor.isActive('heading', { level: 1 })) currentStyle = 'Heading 1';
  else if (editor.isActive('heading', { level: 2 })) currentStyle = 'Heading 2';
  else if (editor.isActive('heading', { level: 3 })) currentStyle = 'Heading 3';

  // Determine active font family from selection textStyle mark, fallback to page default
  let displayedFontFamily: 'sans' | 'serif' | 'mono' = fontFamily;
  const currentFontFamilyAttr = editor.getAttributes('textStyle').fontFamily as string | undefined;
  if (currentFontFamilyAttr) {
    if (currentFontFamilyAttr.includes('Merriweather') || currentFontFamilyAttr.includes('serif')) {
      displayedFontFamily = 'serif';
    } else if (currentFontFamilyAttr.includes('JetBrains') || currentFontFamilyAttr.includes('mono')) {
      displayedFontFamily = 'mono';
    } else if (currentFontFamilyAttr.includes('Jakarta') || currentFontFamilyAttr.includes('sans')) {
      displayedFontFamily = 'sans';
    }
  }

  // Determine active font size from selection textStyle mark, fallback to page default
  const textStyleFontSize = editor.getAttributes('textStyle').fontSize as string | undefined;
  const displayedFontSize = textStyleFontSize ? parseInt(textStyleFontSize, 10) : fontSize;

  const btnClass = (isActive: boolean) =>
    `p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
      isActive
        ? 'bg-blue-100 text-blue-700 shadow-2xs'
        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
    } ${disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`;

  const highlightColors = [
    { name: 'Yellow', color: '#fef08a' },
    { name: 'Green', color: '#bbf7d0' },
    { name: 'Blue', color: '#bae6fd' },
    { name: 'Purple', color: '#e9d5ff' },
    { name: 'Pink', color: '#fbcfe8' },
  ];

  const handleApplyFont = (fontKey: 'sans' | 'serif' | 'mono') => {
    const fontName =
      fontKey === 'serif'
        ? 'Merriweather, serif'
        : fontKey === 'mono'
        ? 'JetBrains Mono, monospace'
        : 'Plus Jakarta Sans, sans-serif';

    // Apply font to selected text if text is selected, without affecting whole page theme
    if (!editor.state.selection.empty) {
      editor.chain().focus().setFontFamily(fontName).run();
    } else {
      onChangeFontFamily(fontKey);
    }
    setIsFontMenuOpen(false);
  };

  const handleDecreaseFontSize = () => {
    const newSize = Math.max(10, displayedFontSize - 1);
    if (!editor.state.selection.empty) {
      editor.chain().focus().setFontSize(`${newSize}px`).run();
    } else {
      onChangeFontSize(newSize);
    }
  };

  const handleIncreaseFontSize = () => {
    const newSize = Math.min(72, displayedFontSize + 1);
    if (!editor.state.selection.empty) {
      editor.chain().focus().setFontSize(`${newSize}px`).run();
    } else {
      onChangeFontSize(newSize);
    }
  };

  return (
    <div className="bg-[#F9F9FA] border-b border-zinc-200 px-6 py-1.5 flex items-center gap-1 select-none relative z-30 shadow-2xs">
      {/* Undo / Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled || !editor.can().undo()}
        title="Undo (Ctrl+Z)"
        className={btnClass(false)}
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled || !editor.can().redo()}
        title="Redo (Ctrl+Y)"
        className={btnClass(false)}
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-200 mx-1 shrink-0" />

      {/* Style Dropdown (Normal, H1, H2, H3) */}
      <div ref={styleMenuRef} className="relative">
        <button
          onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-200/60 transition cursor-pointer"
        >
          <span>{currentStyle}</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        {isStyleMenuOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-2xl shadow-2xl border border-zinc-200 py-1.5 z-[100] animate-fade-in-up">
            <button
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setIsStyleMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-zinc-800 hover:bg-blue-50 hover:text-blue-700 font-medium transition cursor-pointer"
            >
              Normal text
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setIsStyleMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-sm text-zinc-900 font-bold hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
            >
              Heading 1
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setIsStyleMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-zinc-900 font-semibold hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
            >
              Heading 2
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setIsStyleMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-zinc-700 font-medium hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
            >
              Heading 3
            </button>
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-zinc-200 mx-1 shrink-0" />

      {/* Font Family Picker */}
      <div ref={fontMenuRef} className="relative">
        <button
          onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-200/60 transition cursor-pointer"
        >
          <span className="capitalize">{displayedFontFamily}</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        {isFontMenuOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-2xl shadow-2xl border border-zinc-200 py-1.5 z-[100] animate-fade-in-up">
            <button
              onClick={() => handleApplyFont('sans')}
              className="w-full text-left px-3.5 py-2 text-xs font-sans text-zinc-800 hover:bg-blue-50 hover:text-blue-700 font-semibold transition cursor-pointer"
            >
              Sans (Plus Jakarta)
            </button>
            <button
              onClick={() => handleApplyFont('serif')}
              className="w-full text-left px-3.5 py-2 text-xs font-serif text-zinc-800 hover:bg-blue-50 hover:text-blue-700 font-semibold transition cursor-pointer"
            >
              Serif (Merriweather)
            </button>
            <button
              onClick={() => handleApplyFont('mono')}
              className="w-full text-left px-3.5 py-2 text-xs font-mono text-zinc-800 hover:bg-blue-50 hover:text-blue-700 font-semibold transition cursor-pointer"
            >
              Mono (JetBrains)
            </button>
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-zinc-200 mx-1 shrink-0" />

      {/* Font Size Stepper */}
      <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-zinc-200/50">
        <button
          onClick={handleDecreaseFontSize}
          disabled={disabled || displayedFontSize <= 10}
          className="p-1 rounded-md text-zinc-600 hover:bg-white hover:text-zinc-900 disabled:opacity-40 transition cursor-pointer"
          title="Decrease font size"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-xs font-bold text-zinc-800 px-1 min-w-[20px] text-center font-mono">
          {displayedFontSize}
        </span>
        <button
          onClick={handleIncreaseFontSize}
          disabled={disabled || displayedFontSize >= 72}
          className="p-1 rounded-md text-zinc-600 hover:bg-white hover:text-zinc-900 disabled:opacity-40 transition cursor-pointer"
          title="Increase font size"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-zinc-200 mx-1 shrink-0" />

      {/* Basic Marks: B, I, U, Strike */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled}
        title="Bold (Ctrl+B)"
        className={btnClass(editor.isActive('bold'))}
      >
        <Bold className="w-3.5 h-3.5 stroke-[2.4]" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled}
        title="Italic (Ctrl+I)"
        className={btnClass(editor.isActive('italic'))}
      >
        <Italic className="w-3.5 h-3.5 stroke-[2.4]" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={disabled}
        title="Underline (Ctrl+U)"
        className={btnClass(editor.isActive('underline'))}
      >
        <UnderlineIcon className="w-3.5 h-3.5 stroke-[2.4]" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={disabled}
        title="Strikethrough"
        className={btnClass(editor.isActive('strike'))}
      >
        <Strikethrough className="w-3.5 h-3.5 stroke-[2.4]" />
      </button>

      {/* Text Highlight Color */}
      <div ref={highlightMenuRef} className="relative">
        <button
          onClick={() => setIsHighlightMenuOpen(!isHighlightMenuOpen)}
          disabled={disabled}
          title="Highlight Color"
          className={btnClass(editor.isActive('highlight'))}
        >
          <Highlighter className="w-3.5 h-3.5 text-amber-500" />
        </button>

        {isHighlightMenuOpen && (
          <div className="absolute top-full left-0 mt-1.5 p-2 bg-white rounded-2xl shadow-2xl border border-zinc-200 flex items-center gap-1.5 z-[100] animate-fade-in-up">
            {highlightColors.map((hc) => (
              <button
                key={hc.name}
                onClick={() => {
                  editor.chain().focus().toggleHighlight({ color: hc.color }).run();
                  setIsHighlightMenuOpen(false);
                }}
                className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition cursor-pointer shadow-2xs"
                style={{ backgroundColor: hc.color }}
                title={hc.name}
              />
            ))}
            <button
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setIsHighlightMenuOpen(false);
              }}
              className="p-1 text-[10px] text-zinc-500 hover:text-red-600 hover:bg-zinc-100 rounded-md transition cursor-pointer"
              title="Remove Highlight"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-zinc-200 mx-1 shrink-0" />

      {/* Alignment (Left, Center, Right, Justify) */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        disabled={disabled}
        title="Align Left"
        className={btnClass(editor.isActive({ textAlign: 'left' }))}
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        disabled={disabled}
        title="Align Center"
        className={btnClass(editor.isActive({ textAlign: 'center' }))}
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        disabled={disabled}
        title="Align Right"
        className={btnClass(editor.isActive({ textAlign: 'right' }))}
      >
        <AlignRight className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        disabled={disabled}
        title="Justify"
        className={btnClass(editor.isActive({ textAlign: 'justify' }))}
      >
        <AlignJustify className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-200 mx-1 shrink-0" />

      {/* Lists (Bullet, Numbered, Checklist) */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled}
        title="Bulleted List"
        className={btnClass(editor.isActive('bulletList'))}
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled}
        title="Numbered List"
        className={btnClass(editor.isActive('orderedList'))}
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        disabled={disabled}
        title="Task Checklist"
        className={btnClass(editor.isActive('taskList'))}
      >
        <CheckSquare className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-zinc-200 mx-1 shrink-0" />

      {/* Clear Formatting */}
      <button
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        disabled={disabled}
        title="Clear Formatting"
        className={btnClass(false)}
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
