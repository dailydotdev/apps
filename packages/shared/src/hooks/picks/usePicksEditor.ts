import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { useSharePicks } from './useSharePicks';
import {
  myCurrentPicksQueryOptions,
  PICKS_MAX_ITEMS,
  PICKS_NOTE_MAX_LENGTH,
  picksSuggestionsQueryOptions,
  upsertPicks,
} from '../../graphql/picks';
import type { Picks, PicksSuggestion } from '../../graphql/picks';
import { LogEvent, Origin } from '../../lib/log';
import { labels } from '../../lib/labels';

export const PICKS_LIMIT_HINT = `You can pick up to ${PICKS_MAX_ITEMS} posts`;

export const getPicksOrigin = (
  value?: string | string[] | null,
): Origin | undefined => {
  switch (Array.isArray(value) ? value[0] : value) {
    case 'bookmarks':
      return Origin.Bookmarks;
    case 'notification':
      return Origin.Notification;
    case 'picks_page':
      return Origin.PicksPage;
    default:
      return undefined;
  }
};

export interface UsePicksEditor {
  rows: PicksSuggestion[];
  isLoading: boolean;
  isEdit: boolean;
  isEmpty: boolean;
  isPublishing: boolean;
  currentPicks: Picks | null | undefined;
  selectedIds: string[];
  notes: Record<string, string>;
  showLimitHint: boolean;
  isSelected: (postId: string) => boolean;
  toggle: (row: PicksSuggestion) => void;
  setNote: (postId: string, note: string) => void;
  commitNote: (postId: string) => void;
  publish: () => Promise<void>;
}

export const usePicksEditor = ({
  origin,
}: { origin?: Origin } = {}): UsePicksEditor => {
  const { user, isAuthReady } = useAuthContext();
  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { openShareSheet } = useSharePicks();
  const { data: currentPicks, isFetched: isCurrentFetched } = useQuery(
    myCurrentPicksQueryOptions(user),
  );
  const { data: suggestions, isFetched: isSuggestionsFetched } = useQuery(
    picksSuggestionsQueryOptions(user),
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showLimitHint, setShowLimitHint] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const prefilled = useRef(false);
  const started = useRef(false);
  const loggedNotes = useRef<Record<string, string>>({});
  const isLoading = !isCurrentFetched || !isSuggestionsFetched;
  const isEdit = !!currentPicks;

  useEffect(() => {
    if (prefilled.current || !isCurrentFetched) {
      return;
    }
    prefilled.current = true;
    if (!currentPicks) {
      return;
    }
    const items = [...currentPicks.items].sort(
      (a, b) => a.position - b.position,
    );
    setSelectedIds(items.map((item) => item.post.id));
    setNotes(
      Object.fromEntries(
        items.filter((item) => item.note).map((i) => [i.post.id, i.note]),
      ) as Record<string, string>,
    );
  }, [isCurrentFetched, currentPicks]);

  useEffect(() => {
    if (started.current || !isAuthReady || !user || !isCurrentFetched) {
      return;
    }
    started.current = true;
    logEvent({
      event_name: LogEvent.StartPicks,
      extra: JSON.stringify({ origin, is_edit: !!currentPicks }),
    });
  }, [isAuthReady, user, isCurrentFetched, currentPicks, origin, logEvent]);

  // Current picks missing from the suggestions stay visible on top, so
  // editing never drops an item.
  const rows = useMemo<PicksSuggestion[]>(() => {
    const list = suggestions ?? [];
    const known = new Set(list.map((row) => row.post.id));
    const extra: PicksSuggestion[] = (currentPicks?.items ?? [])
      .filter((item) => !known.has(item.post.id))
      .map((item) => ({
        post: item.post,
        reason: 'read',
        upvoted: false,
        bookmarked: false,
        read: false,
      }));
    return [...extra, ...list];
  }, [suggestions, currentPicks]);

  const reasonLog = (row: PicksSuggestion) =>
    JSON.stringify({ post_id: row.post.id, reason: row.reason });

  const toggle = useCallback(
    (row: PicksSuggestion) => {
      const postId = row.post.id;
      if (selectedIds.includes(postId)) {
        setSelectedIds((ids) => ids.filter((id) => id !== postId));
        setShowLimitHint(false);
        logEvent({ event_name: LogEvent.DeselectPick, extra: reasonLog(row) });
        return;
      }
      if (selectedIds.length >= PICKS_MAX_ITEMS) {
        setShowLimitHint(true);
        return;
      }
      setSelectedIds((ids) => [...ids, postId]);
      setShowLimitHint(false);
      logEvent({ event_name: LogEvent.SelectPick, extra: reasonLog(row) });
    },
    [selectedIds, logEvent],
  );

  const setNote = useCallback((postId: string, note: string) => {
    setNotes((current) => ({
      ...current,
      [postId]: note.slice(0, PICKS_NOTE_MAX_LENGTH),
    }));
  }, []);

  const commitNote = useCallback(
    (postId: string) => {
      const note = (notes[postId] ?? '').trim();
      if (!note || loggedNotes.current[postId] === note) {
        return;
      }
      loggedNotes.current[postId] = note;
      logEvent({
        event_name: LogEvent.AddPickNote,
        extra: JSON.stringify({ post_id: postId, length: note.length }),
      });
    },
    [notes, logEvent],
  );

  const publish = useCallback(async () => {
    if (isPublishing || !selectedIds.length) {
      return;
    }
    setIsPublishing(true);
    try {
      const items = selectedIds.map((postId) => ({
        postId,
        note: notes[postId]?.trim() || null,
      }));
      await upsertPicks(items);
      logEvent({
        event_name: LogEvent.PublishPicks,
        extra: JSON.stringify({
          count: items.length,
          notes_count: items.filter((item) => !!item.note).length,
          is_edit: isEdit,
        }),
      });
      const picks = await client.fetchQuery({
        ...myCurrentPicksQueryOptions(user),
        staleTime: 0,
      });
      if (picks) {
        openShareSheet(picks, origin ?? Origin.PicksPage);
      }
    } catch (error) {
      displayToast(labels.error.generic);
    } finally {
      setIsPublishing(false);
    }
  }, [
    isPublishing,
    selectedIds,
    notes,
    isEdit,
    client,
    user,
    origin,
    logEvent,
    openShareSheet,
    displayToast,
  ]);

  return {
    rows,
    isLoading,
    isEdit,
    isEmpty: !isLoading && !rows.length,
    isPublishing,
    currentPicks,
    selectedIds,
    notes,
    showLimitHint,
    isSelected: (postId) => selectedIds.includes(postId),
    toggle,
    setNote,
    commitNote,
    publish,
  };
};
