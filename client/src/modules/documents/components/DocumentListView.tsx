import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Trash2,
  Share2,
  Crown,
  Users,
  ExternalLink,
  Star,
} from 'lucide-react';
import { IDocumentSummary } from '@/shared/types';

interface DocumentListViewProps {
  documents: IDocumentSummary[];
  onDelete?: (id: string) => void;
  onOpenShare?: (id: string) => void;
  isStarred?: (id: string) => boolean;
  onToggleStar?: (id: string) => void;
  isDeleting?: boolean;
}

export const DocumentListView: React.FC<DocumentListViewProps> = ({
  documents,
  onDelete,
  onOpenShare,
  isStarred,
  onToggleStar,
  isDeleting,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs">
      <div className="grid grid-cols-12 px-5 py-3 border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-[#FAFAFC]">
        <div className="col-span-6">Name</div>
        <div className="col-span-3">Owner / Access</div>
        <div className="col-span-2">Last Modified</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <div className="divide-y divide-zinc-100">
        {documents.map((doc) => {
          const dateStr = new Date(doc.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={doc.id}
              onClick={() => navigate(`/doc/${doc.id}`)}
              className="grid grid-cols-12 items-center px-5 py-3 hover:bg-blue-50/40 transition cursor-pointer group"
            >
              {/* Document Name & Star */}
              <div className="col-span-6 flex items-center gap-3 min-w-0 pr-4">
                {onToggleStar && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(doc.id);
                    }}
                    className="p-1 rounded-md text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 transition cursor-pointer shrink-0"
                    title={isStarred?.(doc.id) ? 'Starred' : 'Add to Starred'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isStarred?.(doc.id)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-zinc-400 hover:text-amber-500'
                      }`}
                    />
                  </button>
                )}
                <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-900 group-hover:text-blue-700 transition truncate">
                  {doc.title || 'Untitled Document'}
                </span>
              </div>

              {/* Owner / Permission */}
              <div className="col-span-3 flex items-center gap-2">
                {doc.isOwner ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    <Crown className="w-3 h-3" />
                    <span>Owner (You)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Users className="w-3 h-3" />
                    <span>{doc.owner.name}</span>
                  </span>
                )}
              </div>

              {/* Last Modified */}
              <div className="col-span-2 text-xs text-zinc-500 font-medium">
                {dateStr}
              </div>

              {/* Action Buttons */}
              <div
                className="col-span-1 flex items-center justify-end gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {onOpenShare && (
                  <button
                    onClick={() => onOpenShare(doc.id)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 transition cursor-pointer"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {doc.isOwner && onDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${doc.title}"?`)) {
                        onDelete(doc.id);
                      }
                    }}
                    disabled={isDeleting}
                    className="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
