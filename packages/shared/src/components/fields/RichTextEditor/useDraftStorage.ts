import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateStorageKey, StorageTopic } from '../../../lib/storage';
import { storageWrapper } from '../../../lib/storageWrapper';
import { getPlainTextFromRichContent } from '../../../lib/strings';

const DRAFT_SAVE_DELAY = 500;

export const getCommentDraftKey = (identifier: string): string =>
  generateStorageKey(StorageTopic.Comment, 'draft', identifier);

const persistDraft = (key: string, content: string): void => {
  if (content.trim().length > 0) {
    storageWrapper.setItem(key, content);
  } else {
    storageWrapper.removeItem(key);
  }
};

interface PendingDraft {
  key: string;
  content: string;
}

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
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const pendingRef = useRef<PendingDraft | null>(null);

  const draftStorageKey = useMemo(() => {
    if (!postId) {
      return null;
    }
    const identifier = editCommentId || parentCommentId || postId;
    return getCommentDraftKey(identifier);
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

  const flushDraft = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const pending = pendingRef.current;
    if (!pending) {
      return;
    }

    pendingRef.current = null;
    persistDraft(pending.key, pending.content);
  }, []);

  const clearDraft = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingRef.current = null;

    if (draftStorageKey) {
      storageWrapper.removeItem(draftStorageKey);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (!draftStorageKey || !isDirty) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    pendingRef.current = { key: draftStorageKey, content };
    saveTimeoutRef.current = setTimeout(flushDraft, DRAFT_SAVE_DELAY);
  }, [content, draftStorageKey, isDirty, flushDraft]);

  // Save what is still pending when the composer closes or the post changes.
  useEffect(() => flushDraft, [flushDraft]);

  return {
    draftStorageKey,
    getInitialValue,
    clearDraft,
  };
}

export function useStoredCommentDraft(
  postId: string | undefined,
  shouldRead: boolean,
): string | null {
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || !shouldRead) {
      setDraft(null);
      return;
    }

    const markdown = storageWrapper.getItem(getCommentDraftKey(postId));
    setDraft(
      markdown
        ? getPlainTextFromRichContent({
            markdown: markdown.replace(/\s+/g, ' '),
          })
        : null,
    );
  }, [postId, shouldRead]);

  return draft;
}
