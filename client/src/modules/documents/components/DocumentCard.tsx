import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Trash2,
  Users,
  MoreVertical,
  Crown,
  ExternalLink,
  Share2,
  CheckSquare,
  Square,
  BarChart2,
  Lightbulb,
  Bookmark,
  Sparkles,
  Star,
} from 'lucide-react';
import { IDocumentSummary } from '@/shared/types';

interface DocumentCardProps {
  document: IDocumentSummary;
  onDelete?: (id: string) => void;
  onOpenShare?: (id: string) => void;
  isStarred?: boolean;
  onToggleStar?: (id: string) => void;
  isDeleting?: boolean;
}

function getRelativeTimeString(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Updated just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Updated ${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Updated ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Updated ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return `Updated ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } catch {
    return 'Updated recently';
  }
}

interface ParsedPreview {
  leadHeading?: string;
  subheading?: string;
  leadParagraph?: string;
  bullets: string[];
  tasks: Array<{ text: string; checked: boolean }>;
  isResearch?: boolean;
  categoryIcon?: 'meeting' | 'ideas' | 'research' | 'workspace' | 'default';
}

function parseDocumentContent(content: any, title: string): ParsedPreview {
  const result: ParsedPreview = {
    bullets: [],
    tasks: [],
    categoryIcon: 'default',
  };

  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('meeting')) result.categoryIcon = 'meeting';
  else if (lowerTitle.includes('idea')) result.categoryIcon = 'ideas';
  else if (lowerTitle.includes('research')) {
    result.categoryIcon = 'research';
    result.isResearch = true;
  } else if (lowerTitle.includes('workspace') || lowerTitle.includes('overview')) {
    result.categoryIcon = 'workspace';
  }

  if (content && typeof content === 'object' && Array.isArray(content.content)) {
    for (const node of content.content) {
      if (node.type === 'heading') {
        const text = node.content?.map((c: any) => c.text).join('') || '';
        if (text) {
          if (!result.leadHeading) result.leadHeading = text;
          else if (!result.subheading) result.subheading = text;
        }
      } else if (node.type === 'paragraph') {
        const text = node.content?.map((c: any) => c.text).join('') || '';
        if (text && !result.leadParagraph) {
          result.leadParagraph = text;
        }
      } else if (node.type === 'bulletList' && Array.isArray(node.content)) {
        for (const item of node.content) {
          const itemText =
            item.content?.[0]?.content?.map((c: any) => c.text).join('') || '';
          if (itemText && result.bullets.length < 4) {
            result.bullets.push(itemText);
          }
        }
      } else if (node.type === 'taskList' && Array.isArray(node.content)) {
        for (const item of node.content) {
          const itemText =
            item.content?.[0]?.content?.map((c: any) => c.text).join('') || '';
          if (itemText && result.tasks.length < 4) {
            result.tasks.push({
              text: itemText,
              checked: !!item.attrs?.checked,
            });
          }
        }
      }
    }
  }

  return result;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDelete,
  onOpenShare,
  isStarred,
  onToggleStar,
  isDeleting,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleOpen = () => {
    navigate(`/doc/${document.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      onDelete?.(document.id);
    }
  };

  const relativeTime = getRelativeTimeString(document.updatedAt);
  const preview = useMemo(
    () => parseDocumentContent(document.content, document.title),
    [document.content, document.title]
  );

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={handleOpen}
      className="group flex flex-col bg-white rounded-md border border-zinc-200/90 hover:border-blue-400/80 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden relative select-none"
    >
      {/* Top Document Preview Simulation Sheet (Realistic content snippet, no skeletons) */}
      <div className="p-4 bg-white border-b border-zinc-100 flex-1 min-h-[190px] flex flex-col justify-between relative overflow-hidden">
        {/* Mock Content Header & 3-dots Menu */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                {preview.categoryIcon === 'meeting' && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    🎙️ Meeting
                  </span>
                )}
                {preview.categoryIcon === 'ideas' && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    💡 Ideas
                  </span>
                )}
                {preview.categoryIcon === 'research' && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    🔬 Research
                  </span>
                )}
                {preview.categoryIcon === 'workspace' && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    👥 Workspace
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:text-blue-600 transition">
                {document.title || 'Untitled Document'}
              </h4>
              <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                {preview.subheading || (document.isOwner ? `By ${document.owner.name}` : `Shared by ${document.owner.name}`)}
              </p>
            </div>

            {/* Action Buttons: Star & 3-Dots Menu */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              {onToggleStar && (
                <button
                  onClick={() => onToggleStar(document.id)}
                  className="p-1 rounded-md text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 transition cursor-pointer"
                  title={isStarred ? 'Starred' : 'Add to Starred'}
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-colors ${
                      isStarred
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-zinc-400 hover:text-amber-500'
                    }`}
                  />
                </button>
              )}

              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                  title="More actions"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-xl border border-zinc-200 py-1.5 z-40 animate-fade-in-up">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleOpen();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Document</span>
                  </button>

                  {onOpenShare && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenShare(document.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Settings</span>
                    </button>
                  )}

                  {document.isOwner && onDelete && (
                    <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition cursor-pointer border-t border-zinc-100 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Realistic Content Section (No Skeleton Lines) */}
          <div className="space-y-1.5 text-[11px] text-zinc-600 font-normal leading-relaxed pt-1">
            {preview.tasks.length > 0 ? (
              <div className="space-y-1">
                {preview.tasks.slice(0, 3).map((t, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px] text-zinc-600 truncate">
                    {t.checked ? (
                      <CheckSquare className="w-3 h-3 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="w-3 h-3 text-zinc-400 shrink-0" />
                    )}
                    <span className={`truncate ${t.checked ? 'line-through text-zinc-400' : ''}`}>
                      {t.text}
                    </span>
                  </div>
                ))}
              </div>
            ) : preview.bullets.length > 0 ? (
              <div className="space-y-0.5">
                {preview.bullets.slice(0, 3).map((b, idx) => (
                  <div key={idx} className="flex items-start gap-1 text-[10px] text-zinc-600 truncate">
                    <span className="text-zinc-400 font-bold">•</span>
                    <span className="truncate">{b}</span>
                  </div>
                ))}
              </div>
            ) : preview.leadParagraph ? (
              <p className="line-clamp-3 text-[10px] text-zinc-500 italic">
                "{preview.leadParagraph}"
              </p>
            ) : (
              /* Fallback rich text intro */
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 font-medium line-clamp-2">
                  An active workspace document with real-time collaboration.
                </p>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <span>1. Introduction & Overview</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visual Mini Chart Accent for Research Reports */}
        {preview.isResearch && (
          <div className="flex items-end gap-1 h-6 pt-2">
            <div className="w-3 bg-blue-200 rounded-xs h-3" />
            <div className="w-3 bg-blue-300 rounded-xs h-5" />
            <div className="w-3 bg-blue-500 rounded-xs h-4" />
            <div className="w-3 bg-blue-600 rounded-xs h-6" />
            <div className="w-3 bg-blue-400 rounded-xs h-3.5" />
          </div>
        )}
      </div>

      {/* Bottom Metadata Row */}
      <div className="p-3 bg-[#FAFAFC] border-t border-zinc-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-zinc-900 truncate">
              {document.title || 'Untitled Document'}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">
              {relativeTime}
            </div>
          </div>
        </div>

        {/* Ownership Badge */}
        {document.isOwner ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
            <Crown className="w-2.5 h-2.5" />
            <span>Owner</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
            <Users className="w-2.5 h-2.5" />
            <span>Shared</span>
          </span>
        )}
      </div>
    </motion.div>
  );
};
