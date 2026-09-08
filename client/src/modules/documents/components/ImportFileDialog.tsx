import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useImportDocument } from '../hooks/useDocuments';

interface ImportFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportFileDialog: React.FC<ImportFileDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const importMutation = useImportDocument();

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'txt' && ext !== 'md') {
      setError('Unsupported file format. Only .txt and .md files are allowed.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const newDoc = await importMutation.mutateAsync(selectedFile);
      onClose();
      navigate(`/doc/${newDoc.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to import file. Please try again.'
      );
    }
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
                <Upload className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Import Document
                </h2>
                <p className="text-[12px] text-zinc-400">
                  Convert Markdown or plain text into a rich document
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
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200/80 text-red-600 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-violet-500 bg-violet-50/50 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-zinc-200 hover:border-violet-400 bg-zinc-50/60 hover:bg-violet-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                className="hidden"
                onChange={handleFileChange}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5 shadow-xs">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-sm font-bold text-zinc-800 line-clamp-1">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-zinc-400 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready to convert
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-800">
                    Click to browse or drop file here
                  </span>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                    Drop a <code className="text-zinc-600 font-mono">.md</code> or <code className="text-zinc-600 font-mono">.txt</code> file to import
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-500">
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    <span>Max size: 10MB</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-md transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || importMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-md shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <span>Import & Open</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
