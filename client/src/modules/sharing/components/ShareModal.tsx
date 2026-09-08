import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UserPlus,
  Users,
  Trash2,
  ShieldCheck,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { apiClient } from '@/shared/api-client/axios';
import { IDocumentShare } from '@/shared/types';
import { documentKeys } from '@/modules/documents';

interface ShareModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  documentId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'VIEWER' | 'EDITOR'>('EDITOR');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: shares, isLoading: isLoadingShares } = useQuery<IDocumentShare[]>({
    queryKey: documentKeys.shares(documentId),
    queryFn: async () => {
      const res = await apiClient.get(`/documents/${documentId}/shares`);
      return res.data.data;
    },
    enabled: isOpen,
  });

  const addShareMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/documents/${documentId}/share`, {
        email,
        permission,
      });
      return res.data.data;
    },
    onSuccess: () => {
      setSuccessMsg(`Access granted to ${email}`);
      setEmail('');
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: documentKeys.shares(documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.dashboard() });
    },
    onError: (err: any) => {
      setErrorMsg(
        err.response?.data?.message || 'Failed to share document. Please check the email address.'
      );
      setSuccessMsg(null);
    },
  });

  const removeShareMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      await apiClient.delete(`/documents/${documentId}/shares/${targetUserId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.shares(documentId) });
      queryClient.invalidateQueries({ queryKey: documentKeys.dashboard() });
    },
  });

  if (!isOpen) return null;

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    addShareMutation.mutate();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-float border border-zinc-200/80 p-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Share Document
                </h2>
                <p className="text-[12px] text-zinc-400">
                  Manage team access and collaboration permissions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Invite Form */}
            <form onSubmit={handleShareSubmit} className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Invite by Email
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="bob@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-md border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition"
                />

                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as 'VIEWER' | 'EDITOR')}
                  className="px-3 py-2 rounded-md border border-zinc-200 text-xs font-semibold bg-white text-zinc-700 focus:outline-none focus:border-violet-600 cursor-pointer"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>

                <button
                  type="submit"
                  disabled={addShareMutation.isPending || !email}
                  className="px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {addShareMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>Invite</span>
                </button>
              </div>
            </form>

            {/* Collaborators List */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Collaborators With Access
              </span>

              {isLoadingShares ? (
                <div className="py-6 flex justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                </div>
              ) : !shares || shares.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-center text-xs text-zinc-400 italic">
                  This document is private to you.
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {shares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl border border-zinc-100 bg-zinc-50/70"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[10px] font-bold uppercase">
                          {share.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-800">
                            {share.user.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {share.user.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            share.permission === 'EDITOR'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          {share.permission === 'EDITOR' ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-amber-600" />
                              <span>Editor</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-zinc-500" />
                              <span>Viewer</span>
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeShareMutation.mutate(share.userId)}
                          disabled={removeShareMutation.isPending}
                          title="Revoke access"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
