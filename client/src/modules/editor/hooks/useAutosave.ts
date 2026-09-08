import { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api-client/axios';
import { documentKeys } from '@/modules/documents';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface UseAutosaveProps {
  documentId: string;
  debounceMs?: number;
  onSuccess?: () => void;
}

export function useAutosave({
  documentId,
  debounceMs = 600,
  onSuccess,
}: UseAutosaveProps) {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<{ title?: string; content?: any } | null>(null);

  const saveToServer = useCallback(
    async (data: { title?: string; content?: any }) => {
      if (!data || Object.keys(data).length === 0) return;
      setSaveStatus('saving');
      try {
        await apiClient.patch(`/documents/${documentId}`, data);
        setSaveStatus('saved');
        pendingDataRef.current = null;
        queryClient.invalidateQueries({ queryKey: documentKeys.dashboard() });
        queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
        onSuccess?.();
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('error');
      }
    },
    [documentId, queryClient, onSuccess]
  );

  const triggerAutosave = useCallback(
    (data: { title?: string; content?: any }) => {
      setSaveStatus('unsaved');
      pendingDataRef.current = { ...pendingDataRef.current, ...data };

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (pendingDataRef.current) {
          saveToServer(pendingDataRef.current);
        }
      }, debounceMs);
    },
    [debounceMs, saveToServer]
  );

  const flushSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingDataRef.current) {
      await saveToServer(pendingDataRef.current);
    }
  }, [saveToServer]);

  const retrySave = useCallback(() => {
    if (pendingDataRef.current) {
      saveToServer(pendingDataRef.current);
    }
  }, [saveToServer]);

  // Clean up timer on unmount and flush pending save
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (pendingDataRef.current) {
        saveToServer(pendingDataRef.current);
      }
    };
  }, [saveToServer]);

  return {
    saveStatus,
    triggerAutosave,
    flushSave,
    retrySave,
  };
}
