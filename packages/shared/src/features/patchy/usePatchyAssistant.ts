import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import useFeedSettings from '../../hooks/useFeedSettings';
import useTagAndSource from '../../hooks/useTagAndSource';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import { useVotePost } from '../../hooks/vote/useVotePost';
import { useToastNotification } from '../../hooks/useToastNotification';
import { webappUrl } from '../../lib/constants';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { storageWrapper } from '../../lib/storageWrapper';
import type {
  PatchyOfferKind,
  PatchyOfferMemory,
  PatchyQuickRead,
} from './patchyAssistant';
import {
  canPatchyOffer,
  countPatchyTagOpen,
  getPatchyCurrentPost,
  getPatchyHoursLeftToday,
  getPatchyQuickReads,
  PATCHY_LONG_READ_MINUTES,
  readPatchyOfferMemory,
  setPatchyReadingPost,
  withPatchyOfferAnswer,
  withPatchyOfferShown,
  writePatchyOfferMemory,
} from './patchyAssistant';
import { getPatchyConfig } from './patchyConfig';
import type { PatchyEvent } from './patchyEvents';
import { subscribePatchyEvents } from './patchyEvents';
import { isAway } from './patchyTriggers';

export type PatchyOfferAnswer = 'accept' | 'dismiss' | 'never' | 'ignore';

export interface PatchyOffer {
  id: number;
  kind: PatchyOfferKind;
  text: string;
  primary: string;
  secondary: string;
  post?: PatchyQuickRead;
  // Shown over the post modal (reading-along offers) instead of waiting for
  // it to close.
  isOverModal: boolean;
  onPrimary: () => void;
}

type PendingOffer = Omit<PatchyOffer, 'id'> & {
  notBefore: number;
  expiresAt: number;
  tag?: string;
  // Checked when it's about to show and when it's accepted: false drops it
  // (you already did it yourself in the meantime).
  isStillUseful?: () => boolean;
};

const POLL_MS = 500;
const SCROLL_IDLE_MS = 800;
// A suggestion nobody answers leaves on its own.
export const PATCHY_OFFER_TIMEOUT_MS = 12000;
// Reading this long before the end counts as having read it.
const MIN_READ_MS = 20000;
const FINISHED_AT = 0.9;
const STREAK_CHECK_MS = 60 * 1000;
const MAX_WAITING = 2;

const welcomeOfferKey = (userId: string) => `patchy_welcome_offer:${userId}`;

const isModalOpen = (): boolean =>
  !!document.querySelector(
    '.ReactModal__Overlay, [role="dialog"][aria-modal="true"]',
  );

interface ReadingSession {
  post: Partial<Post>;
  openedAt: number;
  isUpvoted: boolean;
  isBookmarked: boolean;
  isFinishOffered: boolean;
}

interface UsePatchyAssistantProps {
  isEnabled: boolean;
  isStreakLoading: boolean;
  state: StreakRingState;
  hasReadToday: boolean;
  lastViewAt?: Date | string | null;
}

interface UsePatchyAssistant {
  offer: PatchyOffer | null;
  // Whether a post is open and he's reading along.
  isReading: boolean;
  onAnswer: (
    answer: PatchyOfferAnswer,
    button?: 'primary' | 'secondary',
  ) => void;
}

export const usePatchyAssistant = ({
  isEnabled,
  isStreakLoading,
  state,
  hasReadToday,
  lastViewAt,
}: UsePatchyAssistantProps): UsePatchyAssistant => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const router = useRouter();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { feedSettings } = useFeedSettings({ enabled: isEnabled });
  const { onFollowTags } = useTagAndSource({ origin: Origin.Patchy });
  const { toggleBookmark } = useBookmarkPost();
  const { toggleUpvote } = useVotePost();
  const [offer, setOffer] = useState<PatchyOffer | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [pendingVersion, setPendingVersion] = useState(0);
  const pendingRef = useRef<PendingOffer[]>([]);
  const sessionRef = useRef<ReadingSession | null>(null);
  const lastScrollAtRef = useRef(0);
  const offerIdRef = useRef(0);
  const isActive = isEnabled && !!user;

  const memory = useCallback(
    (): PatchyOfferMemory => readPatchyOfferMemory(user?.id ?? ''),
    [user?.id],
  );
  const remember = useCallback(
    (next: PatchyOfferMemory) => user && writePatchyOfferMemory(user.id, next),
    [user],
  );

  // Queues a suggestion when he's allowed to make it. Two can wait; the
  // reading-along ones (time-sensitive) go first.
  const queue = useCallback(
    (pending: PendingOffer) => {
      if (
        !user ||
        !canPatchyOffer(memory(), pending.kind) ||
        pendingRef.current.some(({ kind }) => kind === pending.kind)
      ) {
        return;
      }
      pendingRef.current = [...pendingRef.current, pending]
        .sort((a, b) => Number(b.isOverModal) - Number(a.isOverModal))
        .slice(0, MAX_WAITING);
      setPendingVersion((version) => version + 1);
    },
    [user, memory],
  );

  const goTo = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  // What he notices: tags you keep opening, long posts, reaching the end.
  useEffect(() => {
    if (!isActive || !user) {
      return undefined;
    }
    return subscribePatchyEvents((event: PatchyEvent) => {
      if (event.type === 'upvote' || event.type === 'bookmark') {
        const { current } = sessionRef;
        if (current && event.postId && current.post.id === event.postId) {
          if (event.type === 'upvote') {
            current.isUpvoted = true;
          } else {
            current.isBookmarked = true;
          }
        }
        return;
      }
      const post = event.type === 'post_open' ? event.post : undefined;
      if (event.type !== 'post_open' || !post?.id) {
        return;
      }
      const now = Date.now();
      setPatchyReadingPost(post);
      const session: ReadingSession = {
        post,
        openedAt: now,
        isUpvoted: post.userState?.vote === UserVote.Up,
        isBookmarked: !!post.bookmarked,
        isFinishOffered: false,
      };
      sessionRef.current = session;
      setIsReading(true);

      const counted = countPatchyTagOpen(memory(), post.id, event.tags, {
        followed: feedSettings?.includeTags ?? [],
        blocked: feedSettings?.blockedTags ?? [],
      });
      remember(counted.memory);
      if (counted.tag) {
        const { tag } = counted;
        queue({
          kind: 'follow_tag',
          tag,
          text: `That’s your third #${tag} post today. Want more of it in your feed?`,
          primary: `Follow #${tag}`,
          secondary: 'Not now',
          isOverModal: false,
          notBefore: now,
          expiresAt: now + 5 * 60 * 1000,
          onPrimary: () => {
            onFollowTags({ tags: [tag] }).then(({ successful }) => {
              if (successful) {
                displayToast(`#${tag} added to your feed`);
              }
            });
          },
        });
      }

      if (
        (post.readTime ?? 0) >= PATCHY_LONG_READ_MINUTES &&
        !post.bookmarked
      ) {
        queue({
          kind: 'long_read',
          text: `${post.readTime} minutes? Want me to save it for later?`,
          primary: 'Save for later',
          secondary: 'I’ve got time',
          isOverModal: true,
          notBefore: now + 4000,
          expiresAt: now + 30000,
          isStillUseful: () =>
            !session.isBookmarked &&
            !getPatchyCurrentPost(client, post).bookmarked,
          onPrimary: () =>
            toggleBookmark({
              post: getPatchyCurrentPost(client, post) as Post,
              origin: Origin.Patchy,
            }),
        });
      }
    });
  }, [
    isActive,
    user,
    client,
    memory,
    remember,
    queue,
    feedSettings,
    onFollowTags,
    displayToast,
    toggleBookmark,
  ]);

  // Reaching the end of the post you're reading.
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const onScroll = (event: Event) => {
      lastScrollAtRef.current = Date.now();
      const session = sessionRef.current;
      if (
        !session ||
        session.isUpvoted ||
        session.isFinishOffered ||
        Date.now() - session.openedAt < MIN_READ_MS
      ) {
        return;
      }
      const target = event.target as Element | Document | null;
      let scroller: Element | null = null;
      if (
        target instanceof Element &&
        target.classList.contains('post-modal-overlay')
      ) {
        scroller = target;
      } else if (
        target === document &&
        window.location.pathname.startsWith('/posts/')
      ) {
        scroller = document.scrollingElement;
      }
      if (!scroller || scroller.scrollHeight <= scroller.clientHeight) {
        return;
      }
      const progress =
        (scroller.scrollTop + scroller.clientHeight) / scroller.scrollHeight;
      if (progress < FINISHED_AT) {
        return;
      }
      session.isFinishOffered = true;
      const now = Date.now();
      queue({
        kind: 'finished',
        text: 'Done! Worth an upvote?',
        primary: 'Upvote',
        secondary: 'Nah',
        isOverModal: true,
        notBefore: now + 600,
        expiresAt: now + 30000,
        isStillUseful: () =>
          !session.isUpvoted &&
          getPatchyCurrentPost(client, session.post).userState?.vote !==
            UserVote.Up,
        onPrimary: () =>
          toggleUpvote({
            payload: getPatchyCurrentPost(client, session.post) as Post,
            origin: Origin.Patchy,
          }),
      });
    };
    window.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener('scroll', onScroll, { capture: true });
  }, [isActive, client, queue, toggleUpvote]);

  // The reading session ends when no post is open anymore.
  useEffect(() => {
    if (!isReading) {
      return undefined;
    }
    const id = setInterval(() => {
      const isPostOpen =
        !!document.querySelector('.post-modal-overlay') ||
        window.location.pathname.startsWith('/posts/');
      if (!isPostOpen) {
        sessionRef.current = null;
        setPatchyReadingPost(null);
        setIsReading(false);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isReading]);

  // A streak at risk: one heads-up a day, with a short read from the feed.
  useEffect(() => {
    if (!isActive || isStreakLoading || hasReadToday) {
      return undefined;
    }
    const check = () => {
      if (state !== 'at_risk' && state !== 'critical') {
        return;
      }
      const [post] = getPatchyQuickReads(client, { limit: 1 });
      const now = new Date();
      const hours = getPatchyHoursLeftToday(now, user?.timezone);
      queue({
        kind: 'streak_risk',
        text: post
          ? `${hours} ${hours === 1 ? 'hour' : 'hours'} left on your streak. Here’s a ${post.readTime}-minute read:`
          : `${hours} ${hours === 1 ? 'hour' : 'hours'} left on your streak. One quick read keeps it going.`,
        primary: post ? 'Read it' : 'Find a quick read',
        secondary: 'Not tonight',
        post,
        isOverModal: false,
        notBefore: now.getTime(),
        expiresAt: now.getTime() + 10 * 60 * 1000,
        onPrimary: () => goTo(post?.commentsPermalink ?? `${webappUrl}posts`),
      });
    };
    check();
    const id = setInterval(check, STREAK_CHECK_MS);
    return () => clearInterval(id);
  }, [
    isActive,
    isStreakLoading,
    hasReadToday,
    state,
    user?.timezone,
    client,
    queue,
    goTo,
  ]);

  // Back after a while: after his wave, an offer to catch up.
  useEffect(() => {
    if (
      !isActive ||
      !user ||
      isStreakLoading ||
      !lastViewAt ||
      !isAway(lastViewAt, hasReadToday, new Date(), getPatchyConfig().awayMs)
    ) {
      return;
    }
    const marker = new Date(lastViewAt).toISOString();
    if (storageWrapper.getItem(welcomeOfferKey(user.id)) === marker) {
      return;
    }
    storageWrapper.setItem(welcomeOfferKey(user.id), marker);
    const now = Date.now();
    queue({
      kind: 'welcome_back',
      text: 'Welcome back! Want to catch up on what you missed?',
      primary: 'Show me',
      secondary: 'Later',
      isOverModal: false,
      notBefore: now + 4000,
      expiresAt: now + 10 * 60 * 1000,
      onPrimary: () => goTo(`${webappUrl}highlights`),
    });
  }, [isActive, user, isStreakLoading, lastViewAt, hasReadToday, queue, goTo]);

  // Shows a waiting suggestion at a calm moment.
  useEffect(() => {
    if (!isActive || offer || !pendingRef.current.length) {
      return undefined;
    }
    const id = setInterval(() => {
      const now = Date.now();
      pendingRef.current = pendingRef.current.filter(
        ({ kind, expiresAt, isStillUseful }) =>
          now <= expiresAt &&
          canPatchyOffer(memory(), kind) &&
          (isStillUseful?.() ?? true),
      );
      if (!pendingRef.current.length) {
        clearInterval(id);
        return;
      }
      if (document.hidden || now - lastScrollAtRef.current < SCROLL_IDLE_MS) {
        return;
      }
      const isPostModal = !!document.querySelector('.post-modal-overlay');
      const isOtherModal = isModalOpen() && !isPostModal;
      const pending = pendingRef.current.find(
        ({ notBefore, isOverModal }) =>
          now >= notBefore &&
          !isOtherModal &&
          // General suggestions wait until you're done reading.
          (isOverModal || (!isPostModal && !sessionRef.current)),
      );
      if (!pending) {
        return;
      }
      clearInterval(id);
      pendingRef.current = pendingRef.current.filter(
        (item) => item !== pending,
      );
      remember(withPatchyOfferShown(memory(), pending.kind, pending.tag));
      offerIdRef.current += 1;
      const { notBefore, expiresAt, tag, isStillUseful, ...shown } = pending;
      setOffer({
        ...shown,
        id: offerIdRef.current,
        onPrimary: () => {
          if (isStillUseful?.() ?? true) {
            shown.onPrimary();
          }
        },
      });
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.PatchyOffer,
        target_id: pending.kind,
      });
    }, POLL_MS);
    return () => clearInterval(id);
  }, [isActive, offer, pendingVersion, memory, remember, logEvent]);

  const onAnswer = useCallback(
    (answer: PatchyOfferAnswer, button?: 'primary' | 'secondary') => {
      if (!offer) {
        return;
      }
      if (button === 'primary') {
        offer.onPrimary();
      }
      remember(withPatchyOfferAnswer(memory(), offer.kind, answer));
      if (answer !== 'ignore') {
        logEvent({
          event_name: LogEvent.Click,
          target_type: TargetType.PatchyOffer,
          target_id: offer.kind,
          extra: JSON.stringify({ action: answer, button }),
        });
      }
      setOffer(null);
    },
    [offer, memory, remember, logEvent],
  );

  return { offer: isActive ? offer : null, isReading, onAnswer };
};
