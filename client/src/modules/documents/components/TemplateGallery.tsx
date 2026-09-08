import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Sparkles, Loader2, X } from 'lucide-react';
import { apiClient } from '@/shared/api-client/axios';
import { DOCUMENT_TEMPLATES, IDocTemplate } from '../constants/templates';

interface TemplateGalleryProps {
  onStartCreating?: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onStartCreating }) => {
  const navigate = useNavigate();
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectTemplate = async (template: IDocTemplate) => {
    try {
      setCreatingTemplateId(template.id);
      if (onStartCreating) onStartCreating();

      const res = await apiClient.post('/documents', {
        title: template.initialDocTitle,
        content: template.content,
      });

      const newId = res.data.data.id;
      navigate(`/doc/${newId}`);
    } catch (err) {
      console.error('Failed to create template document:', err);
      setCreatingTemplateId(null);
    }
  };

  return (
    <div className="mb-10 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
          Start a new document
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-blue-600 transition cursor-pointer group"
        >
          <span>Template gallery</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Horizontal Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {DOCUMENT_TEMPLATES.map((tpl) => {
          const isCreating = creatingTemplateId === tpl.id;
          const isBlank = tpl.id === 'blank';

          return (
            <div
              key={tpl.id}
              onClick={() => !creatingTemplateId && handleSelectTemplate(tpl)}
              className="group flex flex-col cursor-pointer"
            >
              {/* Card Preview Container */}
              <div
                className={`w-full aspect-[4/3] rounded-2xl bg-white border border-zinc-200/90 p-3.5 flex flex-col justify-between shadow-2xs group-hover:shadow-md group-hover:border-blue-500/60 transition-all duration-200 relative overflow-hidden ${
                  isCreating ? 'opacity-70 pointer-events-none' : ''
                }`}
              >
                {isBlank ? (
                  /* Blank Template Large Plus Icon */
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-110">
                      {isCreating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-6 h-6 stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                ) : (
                  /* Formatted Document Simulation Lines */
                  <div className="w-full h-full flex flex-col justify-center space-y-1.5 px-1 py-1">
                    {tpl.previewLines.map((line, idx) => (
                      <div
                        key={idx}
                        className="h-1.5 rounded-full transition-all duration-200 group-hover:opacity-90"
                        style={{
                          width: line.width,
                          backgroundColor: line.color || '#E2E8F0',
                        }}
                      />
                    ))}
                    {isCreating && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Labels */}
              <div className="mt-2.5 px-0.5">
                <div className="text-xs font-bold text-zinc-900 group-hover:text-blue-600 transition truncate">
                  {tpl.title}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {tpl.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Template Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl p-6 relative animate-fade-in-up">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Template Gallery
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Select a starter blueprint to accelerate your document workflow.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 max-h-[60vh] overflow-y-auto pr-1">
              {DOCUMENT_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setIsModalOpen(false);
                    handleSelectTemplate(tpl);
                  }}
                  className="p-4 rounded-2xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                      {tpl.category}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-900 group-hover:text-blue-700 transition truncate">
                      {tpl.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {tpl.subtitle}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-md bg-zinc-100 group-hover:bg-blue-600 group-hover:text-white text-zinc-400 flex items-center justify-center shrink-0 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
