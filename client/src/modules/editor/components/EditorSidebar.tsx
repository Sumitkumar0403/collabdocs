import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Home,
  Users,
  Star,
  Trash2,
  ChevronDown,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/modules/auth';
import { useDashboardDocuments, useCreateDocument } from '@/modules/documents';

interface EditorSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewDocSuccess?: (id: string) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onNewDocSuccess,
}) => {
  const navigate = useNavigate();
  const { id: activeDocId } = useParams<{ id: string }>();
  const { user, logout, setAuth } = useAuthStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMyDocsOpen, setIsMyDocsOpen] = useState(true);
  const [isSharedOpen, setIsSharedOpen] = useState(true);
  const [isRecentOpen, setIsRecentOpen] = useState(true);

  const { data } = useDashboardDocuments();
  const createMutation = useCreateDocument();

  const handleCreateDocument = async () => {
    try {
      const newDoc = await createMutation.mutateAsync('Untitled Document');
      if (onNewDocSuccess) {
        onNewDocSuccess(newDoc.id);
      } else {
        navigate(`/doc/${newDoc.id}`);
      }
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  const ownedDocs = data?.owned || [];
  const sharedDocs = data?.shared || [];

  // Combine and sort recent documents
  const allDocs = [
    ...ownedDocs,
    ...sharedDocs,
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  if (isCollapsed) {
    return (
      <div className="w-14 bg-[#FAFAFA] border-r border-zinc-200/80 flex flex-col items-center py-4 justify-between select-none shrink-0 transition-all">
        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs cursor-pointer hover:bg-blue-700 transition"
            title="CollabDocs Home"
          >
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>

          <button
            onClick={handleCreateDocument}
            disabled={createMutation.isPending}
            className="w-9 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm transition cursor-pointer"
            title="New document"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold uppercase cursor-pointer hover:ring-2 hover:ring-violet-400 transition"
            title={user?.name}
          >
            {userInitial}
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-[#F9F9FA] border-r border-zinc-200/80 flex flex-col justify-between select-none shrink-0 transition-all relative">
      {/* Top Header & CTA */}
      <div className="p-4 flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4 stroke-[2.4]" />
            </div>
            <span className="font-extrabold text-zinc-900 tracking-tight text-base">
              CollabDocs
            </span>
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 transition cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Primary "+ New document" Button */}
        <button
          onClick={handleCreateDocument}
          disabled={createMutation.isPending}
          className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New document</span>
        </button>

        {/* Main Navigation: Home Button */}
        <nav className="mt-4 mb-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/50 transition cursor-pointer"
          >
            <Home className="w-4 h-4 text-zinc-500" />
            <span>Home</span>
          </button>
        </nav>

        {/* Accordion Sections Container */}
        <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
          {/* 1. Accordion: My Documents */}
          <div className="bg-white/60 rounded-2xl border border-zinc-200/70 overflow-hidden shadow-2xs">
            <button
              onClick={() => setIsMyDocsOpen(!isMyDocsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>My documents</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  {ownedDocs.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${
                    isMyDocsOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isMyDocsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="min-h-0 overflow-hidden px-2 pb-2 space-y-0.5 border-t border-zinc-100 pt-1">
                {ownedDocs.length === 0 ? (
                  <p className="px-2 py-1.5 text-[11px] text-zinc-400 italic">
                    No owned documents
                  </p>
                ) : (
                  ownedDocs.map((doc) => {
                    const isActive = doc.id === activeDocId;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => navigate(`/doc/${doc.id}`)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all truncate cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600 shadow-2xs'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        <FileText
                          className={`w-3 h-3 shrink-0 ${
                            isActive ? 'text-blue-600' : 'text-zinc-400'
                          }`}
                        />
                        <span className="truncate flex-1">
                          {doc.title || 'Untitled Document'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 2. Accordion: Shared with me */}
          <div className="bg-white/60 rounded-2xl border border-zinc-200/70 overflow-hidden shadow-2xs">
            <button
              onClick={() => setIsSharedOpen(!isSharedOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Shared with me</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  {sharedDocs.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${
                    isSharedOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isSharedOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="min-h-0 overflow-hidden px-2 pb-2 space-y-0.5 border-t border-zinc-100 pt-1">
                {sharedDocs.length === 0 ? (
                  <p className="px-2 py-1.5 text-[11px] text-zinc-400 italic">
                    No shared documents
                  </p>
                ) : (
                  sharedDocs.map((doc) => {
                    const isActive = doc.id === activeDocId;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => navigate(`/doc/${doc.id}`)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all truncate cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600 shadow-2xs'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        <FileText
                          className={`w-3 h-3 shrink-0 ${
                            isActive ? 'text-indigo-600' : 'text-zinc-400'
                          }`}
                        />
                        <span className="truncate flex-1">
                          {doc.title || 'Untitled Document'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 3. Accordion: Recent documents */}
          <div className="bg-white/60 rounded-2xl border border-zinc-200/70 overflow-hidden shadow-2xs">
            <button
              onClick={() => setIsRecentOpen(!isRecentOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Recent documents</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700">
                  {allDocs.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${
                    isRecentOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isRecentOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="min-h-0 overflow-hidden px-2 pb-2 space-y-0.5 border-t border-zinc-100 pt-1">
                {allDocs.length === 0 ? (
                  <p className="px-2 py-1.5 text-[11px] text-zinc-400 italic">
                    No documents found
                  </p>
                ) : (
                  allDocs.map((doc) => {
                    const isActive = doc.id === activeDocId;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => navigate(`/doc/${doc.id}`)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all truncate cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600 shadow-2xs'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        <FileText
                          className={`w-3 h-3 shrink-0 ${
                            isActive ? 'text-blue-600' : 'text-zinc-400'
                          }`}
                        />
                        <span className="truncate flex-1">
                          {doc.title || 'Untitled Document'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-zinc-200/80 bg-white relative">
        <div
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-100/80 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-xs">
              {userInitial}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-bold text-zinc-900 truncate">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {user?.email}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
        </div>

        {/* User Popover Menu */}
        {isUserMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl shadow-float border border-zinc-200/80 p-2 z-50 animate-fade-in-up">
            <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 mb-1">
              Account
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
