import { useCallback, useEffect, useMemo, useRef } from 'react';
import { generateStorageKey, StorageTopic } from '../../../lib/storage';
import { storageWrapper } from '../../../lib/storageWrapper';

interface UseDraftStorageProps {
  postId?: string;
  editCommentId?: string;
  parentCommentId?: string;
  content: string;
  isDirty: boolean;
}

export function useDraftStorage({
  postId,
  editCommentId,
  parentCommentId,
  content,
  isDirty,
}: UseDraftStorageProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const draftStorageKey = useMemo(() => {
    if (!postId) {
      return null;
    }
    const identifier = editCommentId || parentCommentId || postId;
    return generateStorageKey(StorageTopic.Comment, 'draft', identifier);
  }, [postId, editCommentId, parentCommentId]);

  const getInitialValue = useCallback(
    (initialContent: string) => {
      if (initialContent) {
        return initialContent;
      }
      if (!draftStorageKey) {
        return '';
      }

      return storageWrapper.getItem(draftStorageKey) || '';
    },
    [draftStorageKey],
  );

  const clearDraft = useCallback(() => {
    if (draftStorageKey) {
      storageWrapper.removeItem(draftStorageKey);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (!draftStorageKey || !isDirty) {
      return undefined;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (content && content.trim().length > 0) {
        storageWrapper.setItem(draftStorageKey, content);
      } else {
        storageWrapper.removeItem(draftStorageKey);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, draftStorageKey, isDirty]);

  return {
    draftStorageKey,
    getInitialValue,
    clearDraft,
  };
}
