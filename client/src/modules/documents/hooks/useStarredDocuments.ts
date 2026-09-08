import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/modules/auth';

export function useStarredDocuments() {
  const { user } = useAuthStore();
  const storageKey = `collabdocs_starred_${user?.id || 'guest'}`;

  const [starredIds, setStarredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setStarredIds(saved ? JSON.parse(saved) : []);
    } catch {
      setStarredIds([]);
    }
  }, [storageKey]);

  const toggleStar = useCallback(
    (docId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setStarredIds((prev) => {
        const next = prev.includes(docId)
          ? prev.filter((id) => id !== docId)
          : [...prev, docId];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (err) {
          console.error('Failed to save starred state:', err);
        }
        return next;
      });
    },
    [storageKey]
  );

  const isStarred = useCallback(
    (docId: string) => starredIds.includes(docId),
    [starredIds]
  );

  return { starredIds, toggleStar, isStarred };
}
