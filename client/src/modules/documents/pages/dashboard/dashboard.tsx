import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Upload,
  LogOut,
  FolderOpen,
  Users,
  Star,
  Trash2,
  Loader2,
  Search,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  Bell,
  Crown,
  Home,
  Check,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/modules/auth';
import {
  useDashboardDocuments,
  useCreateDocument,
  useDeleteDocument,
} from '../../hooks/useDocuments';
import { DocumentCard } from '../../components/DocumentCard';
import { DocumentListView } from '../../components/DocumentListView';
import { ImportFileDialog } from '../../components/ImportFileDialog';
import { useStarredDocuments } from '../../hooks/useStarredDocuments';
import { ShareModal } from '@/modules/sharing';

type FilterTab = 'all' | 'owned' | 'shared' | 'starred';
type SortOption = 'updated' | 'created' | 'title';
type ViewMode = 'grid' | 'list';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('updated');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [shareDocId, setShareDocId] = useState<string | null>(null);

  const { data, isLoading, error } = useDashboardDocuments();
  const createMutation = useCreateDocument();
  const deleteMutation = useDeleteDocument();
  const { starredIds, toggleStar, isStarred } = useStarredDocuments();

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const handleCreateDocument = async () => {
    try {
      const newDoc = await createMutation.mutateAsync('Untitled Document');
      navigate(`/doc/${newDoc.id}`);
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const ownedList = data?.owned || [];
  const sharedList = data?.shared || [];
  const allList = [...ownedList, ...sharedList];
  const starredList = allList.filter((d) => isStarred(d.id));

  // Filter & Search
  const filteredDocs = useMemo(() => {
    let docs = allList;
    if (activeTab === 'owned') docs = ownedList;
    if (activeTab === 'shared') docs = sharedList;
    if (activeTab === 'starred') docs = starredList;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.owner.name.toLowerCase().includes(q)
      );
    }

    // Sort
    return [...docs].sort((a, b) => {
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [allList, ownedList, sharedList, starredList, activeTab, searchQuery, sortOption]);

  const recentShortcuts = allList.slice(0, 5);
  const totalCount = allList.length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-zinc-900 antialiased font-sans">
      {/* 1. Left Workspace Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200/80 hidden md:flex flex-col justify-between select-none shrink-0 sticky top-0 h-screen p-4">
        <div className="flex flex-col">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 px-2 py-1.5 mb-4 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4 stroke-[2.4]" />
            </div>
            <span className="font-extrabold text-zinc-900 tracking-tight text-base">
              CollabDocs
            </span>
          </div>

          {/* Primary Sidebar "+ New" Button (Google Drive Style) */}
          <div className="mb-4 px-1">
            <button
              onClick={() => handleCreateDocument()}
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>New Document</span>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === 'all'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                }`}
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('owned')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === 'owned'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                }`}
            >
              <FolderOpen className="w-4 h-4 text-zinc-400" />
              <span>My Documents</span>
            </button>

            <button
              onClick={() => setActiveTab('shared')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === 'shared'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                }`}
            >
              <Users className="w-4 h-4 text-zinc-400" />
              <span>Shared with Me</span>
            </button>

            <button
              onClick={() => setActiveTab('starred')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === 'starred'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                }`}
            >
              <Star className="w-4 h-4 text-amber-500" />
              <span>Starred</span>
              {starredList.length > 0 && (
                <span className="ml-auto text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">
                  {starredList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-zinc-400" />
              <span>Trash</span>
            </button>
          </nav>

          {/* Recent Shortcuts List */}
          <div className="mt-8 pt-6 border-t border-zinc-100">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Recent
            </span>
            <div className="space-y-0.5">
              {recentShortcuts.length === 0 ? (
                <p className="px-3 py-1 text-xs text-zinc-400 italic">No recent docs</p>
              ) : (
                recentShortcuts.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => navigate(`/doc/${doc.id}`)}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 transition truncate cursor-pointer text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate flex-1">
                      {doc.title || 'Untitled Document'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Workspace Summary Card */}
        <div className="p-3 rounded-md bg-[#FAFAFC] border border-zinc-200/80 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-900 truncate">Workspace</div>
              <div className="text-[11px] text-zinc-500">
                {totalCount} {totalCount === 1 ? 'document' : 'documents'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-6 py-3 flex items-center justify-between gap-4">
          {/* Centered Search Bar */}
          <div className="relative flex-1 max-w-2xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search documents, people, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 rounded-md border border-zinc-200/80 bg-zinc-50/80 hover:bg-white focus:bg-white text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 bg-zinc-200/60 px-1.5 py-0.5 rounded">
              ⌘K
            </div>
          </div>

          {/* Right Header Actions & Profile */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Profile Popover Pill */}
            <div className="relative">
              <div
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-zinc-200/80 hover:border-zinc-300 bg-white transition cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {userInitial}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold text-zinc-800">
                    {user?.name || 'User'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </div>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-float border border-zinc-200/80 p-2 z-50 animate-fade-in-up">
                  <div className="px-3 py-2 border-b border-zinc-100">
                    <p className="text-xs font-bold text-zinc-900">{user?.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-md text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1">
          {/* Hero Greeting & Action CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                {greeting}, {firstName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Create, organize, and collaborate on your documents.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-500" />
                <span>Import File</span>
              </button>

              <button
                onClick={() => handleCreateDocument()}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>New Document</span>
              </button>
            </div>
          </div>

          {/* Recent Documents Section with Filter Pills & Toggles */}
          <div className="space-y-4">
            {/* Header & Filter Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Filter Pills */}
              <div className="inline-flex items-center gap-1.5 p-1 bg-zinc-200/50 rounded-md w-fit">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${activeTab === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                >
                  All ({allList.length})
                </button>
                <button
                  onClick={() => setActiveTab('owned')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${activeTab === 'owned'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                >
                  My Documents ({ownedList.length})
                </button>
                <button
                  onClick={() => setActiveTab('shared')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${activeTab === 'shared'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                >
                  Shared with Me ({sharedList.length})
                </button>
                <button
                  onClick={() => setActiveTab('starred')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${activeTab === 'starred'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                >
                  Starred ({starredList.length})
                </button>
              </div>

              {/* Sort & Grid/List View Toggles */}
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
                  >
                    <span>
                      {sortOption === 'updated'
                        ? 'Last modified'
                        : sortOption === 'title'
                          ? 'Title (A-Z)'
                          : 'Date created'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-xl border border-zinc-200 py-1 z-30 animate-fade-in-up">
                      <button
                        onClick={() => {
                          setSortOption('updated');
                          setIsSortOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                      >
                        <span>Last modified</span>
                        {sortOption === 'updated' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                      <button
                        onClick={() => {
                          setSortOption('title');
                          setIsSortOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                      >
                        <span>Title (A-Z)</span>
                        {sortOption === 'title' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                      <button
                        onClick={() => {
                          setSortOption('created');
                          setIsSortOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                      >
                        <span>Date created</span>
                        {sortOption === 'created' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid / List View Toggle */}
                <div className="flex items-center p-1 bg-zinc-200/60 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    title="List view"
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Section Title */}
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight pt-2">
              Recent documents
            </h3>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center mb-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-zinc-500">
                  Loading workspace documents...
                </span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                Failed to load documents. Please check your connection.
              </div>
            )}

            {/* Content: Grid or List */}
            {!isLoading && (
              <>
                {filteredDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-white rounded-md border border-dashed border-zinc-200 text-center">
                    <div className="w-12 h-12 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                      <FolderOpen className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <h3 className="font-bold text-zinc-800 text-sm">
                      No documents found
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-xs mt-1 mb-4">
                      Create your first document or import an existing file to get started.
                    </p>
                    <button
                      onClick={handleCreateDocument}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Document</span>
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredDocs.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onDelete={handleDelete}
                        onOpenShare={(id) => setShareDocId(id)}
                        isStarred={isStarred(doc.id)}
                        onToggleStar={toggleStar}
                        isDeleting={deleteMutation.isPending}
                      />
                    ))}

                    {/* "Create something amazing" End Card (Matching Reference Screenshot 2) */}
                    <div
                      onClick={handleCreateDocument}
                      className="flex flex-col items-center justify-center p-6 rounded-md border-2 border-dashed border-zinc-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer text-center group min-h-[250px]"
                    >
                      <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                        <Plus className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <h4 className="text-xs font-bold text-zinc-800 mb-1">
                        Create something amazing
                      </h4>
                      <p className="text-[11px] text-zinc-400 mb-4 max-w-[160px]">
                        Start a new document or import a file.
                      </p>
                      <div className="flex flex-col gap-2 w-full max-w-[150px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateDocument();
                          }}
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-2xs transition"
                        >
                          + New Document
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsImportOpen(true);
                          }}
                          className="w-full py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-md shadow-2xs transition flex items-center justify-center gap-1"
                        >
                          <Upload className="w-3 h-3 text-zinc-500" />
                          <span>Import File</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <DocumentListView
                    documents={filteredDocs}
                    onDelete={handleDelete}
                    onOpenShare={(id) => setShareDocId(id)}
                    isStarred={isStarred}
                    onToggleStar={toggleStar}
                    isDeleting={deleteMutation.isPending}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Share Modal */}
      {shareDocId && (
        <ShareModal
          documentId={shareDocId}
          isOpen={!!shareDocId}
          onClose={() => setShareDocId(null)}
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
