import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../useToastNotification';
import { useSharePicks } from './useSharePicks';
import {
  getPicksPath,
  myCurrentPicksQueryOptions,
  PICKS_MAX_ITEMS,
  PICKS_NOTE_MAX_LENGTH,
  picksQueryOptions,
  picksSuggestionsQueryOptions,
  upsertPicks,
} from '../../graphql/picks';
import type {
  Picks,
  PicksSuggestion,
  PicksSuggestionReason,
} from '../../graphql/picks';
import type { GraphQLError } from '../../lib/errors';
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

/** Suggestion reasons plus rows kept from the user's current picks. */
export type PickRowReason = PicksSuggestionReason | 'current';

export interface PickRowData extends Omit<PicksSuggestion, 'reason'> {
  reason: PickRowReason;
}

const getErrorMessage = (error: unknown): string =>
  (error as GraphQLError)?.response?.errors?.[0]?.message ||
  labels.error.generic;

export interface UsePicksEditorParams {
  origin?: Origin;
  /** The picks page the user came from; fills a thin suggestion list */
  fromPicksId?: string;
  /** A post from that page to preselect, with its note field focused */
  addPostId?: string;
}

export interface UsePicksEditor {
  rows: PickRowData[];
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
  isEdit: boolean;
  isEmpty: boolean;
  isPublishing: boolean;
  currentPicks: Picks | null | undefined;
  selectedIds: string[];
  notes: Record<string, string>;
  showLimitHint: boolean;
  /** The preselected post, whose note field should take focus */
  focusNotePostId: string | null;
  isSelected: (postId: string) => boolean;
  toggle: (row: PickRowData) => void;
  setNote: (postId: string, note: string) => void;
  commitNote: (postId: string) => void;
  publish: () => Promise<void>;
}

export const usePicksEditor = ({
  origin,
  fromPicksId,
  addPostId,
}: UsePicksEditorParams = {}): UsePicksEditor => {
  const { user, isAuthReady } = useAuthContext();
  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const router = useRouter();
  const { openShareSheet } = useSharePicks();
  const {
    data: currentPicks,
    isError: isCurrentError,
    refetch: refetchCurrent,
  } = useQuery(myCurrentPicksQueryOptions(user));
  const {
    data: suggestions,
    isError: isSuggestionsError,
    refetch: refetchSuggestions,
  } = useQuery(picksSuggestionsQueryOptions(user, fromPicksId));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showLimitHint, setShowLimitHint] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  // State, not a ref: the add-on selection below must see the prefilled
  // selection, so it waits for the render after the prefill.
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [focusNotePostId, setFocusNotePostId] = useState<string | null>(null);
  const added = useRef(false);
  const started = useRef(false);
  const loggedNotes = useRef<Record<string, string>>({});
  // A failed background refetch keeps the cached data and flips the status to
  // error; only a load with nothing to show is an error state for the editor.
  const hasCurrent = currentPicks !== undefined;
  // Prefill, the start event and publishing wait for a settled current list.
  const isCurrentFetched = hasCurrent;
  const hasSuggestions = suggestions !== undefined;
  const isError =
    (isCurrentError && !hasCurrent) || (isSuggestionsError && !hasSuggestions);
  const isLoading = !isError && (!hasCurrent || !hasSuggestions);
  const retry = useCallback(() => {
    if (isCurrentError) {
      refetchCurrent();
    }
    if (isSuggestionsError) {
      refetchSuggestions();
    }
  }, [isCurrentError, isSuggestionsError, refetchCurrent, refetchSuggestions]);
  const isEdit = !!currentPicks;

  useEffect(() => {
    if (isPrefilled || !isCurrentFetched) {
      return;
    }
    setIsPrefilled(true);
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
  }, [isPrefilled, isCurrentFetched, currentPicks]);

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
  const rows = useMemo<PickRowData[]>(() => {
    const list = suggestions ?? [];
    const known = new Set(list.map((row) => row.post.id));
    const extra: PickRowData[] = (currentPicks?.items ?? [])
      .filter((item) => !known.has(item.post.id))
      .map((item) => ({
        post: item.post,
        reason: 'current',
        upvoted: false,
        bookmarked: false,
        read: false,
      }));
    return [...extra, ...list];
  }, [suggestions, currentPicks]);

  const reasonLog = (row: PickRowData) =>
    JSON.stringify({ post_id: row.post.id, reason: row.reason });

  // "Add to my picks" from a picks page: preselect that post once the list
  // and the current picks are in, or show the limit hint if 5 are picked.
  useEffect(() => {
    if (added.current || !addPostId || !isPrefilled || isLoading || isError) {
      return;
    }
    added.current = true;
    const row = rows.find((item) => item.post.id === addPostId);
    if (!row) {
      return;
    }
    if (selectedIds.includes(addPostId)) {
      setFocusNotePostId(addPostId);
      return;
    }
    if (selectedIds.length >= PICKS_MAX_ITEMS) {
      setShowLimitHint(true);
      return;
    }
    setSelectedIds((ids) => [...ids, addPostId]);
    setFocusNotePostId(addPostId);
    logEvent({ event_name: LogEvent.SelectPick, extra: reasonLog(row) });
  }, [addPostId, isPrefilled, isLoading, isError, rows, selectedIds, logEvent]);

  const toggle = useCallback(
    (row: PickRowData) => {
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
    if (isPublishing || !selectedIds.length || !isCurrentFetched) {
      return;
    }
    setIsPublishing(true);
    try {
      const items = selectedIds.map((postId) => ({
        postId,
        note: notes[postId]?.trim() || null,
      }));
      const result = await upsertPicks(items);
      logEvent({
        event_name: LogEvent.PublishPicks,
        extra: JSON.stringify({
          count: items.length,
          notes_count: items.filter((item) => !!item.note).length,
          is_edit: isEdit,
          origin,
        }),
      });
      client.invalidateQueries({
        queryKey: myCurrentPicksQueryOptions(user).queryKey,
      });
      // The mutation result is the source of truth; the share sheet must not
      // depend on the "current week" read agreeing with the write.
      let picks: Picks | null = null;
      try {
        picks = await client.fetchQuery({
          ...picksQueryOptions(result.id),
          staleTime: 0,
        });
      } catch (fetchError) {
        picks = null;
      }
      if (picks) {
        client.setQueryData(myCurrentPicksQueryOptions(user).queryKey, picks);
        openShareSheet(picks, origin ?? Origin.PicksPage);
      } else {
        router.push(getPicksPath(result.id));
      }
    } catch (error) {
      displayToast(getErrorMessage(error));
    } finally {
      setIsPublishing(false);
    }
  }, [
    isPublishing,
    selectedIds,
    notes,
    isEdit,
    isCurrentFetched,
    router,
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
    isError,
    retry,
    isEdit,
    isEmpty: !isLoading && !rows.length,
    isPublishing,
    currentPicks,
    selectedIds,
    notes,
    showLimitHint,
    focusNotePostId,
    isSelected: (postId) => selectedIds.includes(postId),
    toggle,
    setNote,
    commitNote,
    publish,
  };
};
