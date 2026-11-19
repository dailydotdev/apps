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
  getPatchyQuickReads,
  isPatchyPeeking,
  PATCHY_LONG_READ_MINUTES,
  readPatchyOfferMemory,
  setPatchyOfferOpen,
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
  // Whether the second button is a real action (else it is "not now").
  isSecondaryAction?: boolean;
  post?: PatchyQuickRead;
  // Shown over the post modal (reading-along offers) instead of waiting for
  // it to close.
  isOverModal: boolean;
  onPrimary: () => void;
  onSecondary?: () => void;
}

type PendingOffer = Omit<PatchyOffer, 'id'> & {
  notBefore: number;
  expiresAt: number;
  tag?: string;
};

const POLL_MS = 500;
const SCROLL_IDLE_MS = 800;
// A suggestion nobody answers leaves on its own.
export const PATCHY_OFFER_TIMEOUT_MS = 12000;
// Reading this long before the end counts as having read it.
const MIN_READ_MS = 20000;
const FINISHED_AT = 0.9;
const STREAK_CHECK_MS = 60 * 1000;

const welcomeOfferKey = (userId: string) => `patchy_welcome_offer:${userId}`;

const isModalOpen = (): boolean =>
  !!document.querySelector(
    '.ReactModal__Overlay, [role="dialog"][aria-modal="true"]',
  );

interface ReadingSession {
  post: Partial<Post>;
  openedAt: number;
  isUpvoted: boolean;
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
  const pendingRef = useRef<PendingOffer | null>(null);
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

  // Queues a suggestion when he's allowed to make it. One waits at a time;
  // a reading-along one (time-sensitive) replaces a waiting general one.
  const queue = useCallback(
    (pending: PendingOffer) => {
      if (!user || !canPatchyOffer(memory(), pending.kind)) {
        return;
      }
      const { current } = pendingRef;
      if (current && !(pending.isOverModal && !current.isOverModal)) {
        return;
      }
      pendingRef.current = pending;
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
      const session = sessionRef.current;
      if (event.type === 'upvote') {
        if (session && event.postId && session.post.id === event.postId) {
          session.isUpvoted = true;
        }
        return;
      }
      if (event.type !== 'post_open' || !event.post?.id) {
        return;
      }
      const { post } = event;
      const now = Date.now();
      sessionRef.current = {
        post,
        openedAt: now,
        isUpvoted: post.userState?.vote === UserVote.Up,
        isFinishOffered: false,
      };
      setIsReading(true);

      const counted = countPatchyTagOpen(memory(), event.tags, {
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

      if ((post.readTime ?? 0) >= PATCHY_LONG_READ_MINUTES && post.summary) {
        queue({
          kind: 'tldr',
          text: `${post.readTime} minutes? Want the TL;DR first?`,
          primary: 'Show TL;DR',
          secondary: post.bookmarked ? 'Not now' : 'Save for later',
          isSecondaryAction: !post.bookmarked,
          isOverModal: true,
          notBefore: now + 2500,
          expiresAt: now + 20000,
          onPrimary: () => {
            const tldr = document.querySelector<HTMLElement>(
              '[data-testid="tldr-container"]',
            );
            tldr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            tldr?.animate?.(
              [
                { boxShadow: '0 0 0 0 rgba(206, 61, 243, 0)' },
                { boxShadow: '0 0 0 4px rgba(206, 61, 243, 0.55)' },
                { boxShadow: '0 0 0 0 rgba(206, 61, 243, 0)' },
              ],
              { duration: 1800, delay: 300 },
            );
          },
          onSecondary: post.bookmarked
            ? undefined
            : () =>
                toggleBookmark({ post: post as Post, origin: Origin.Patchy }),
        });
      }
    });
  }, [
    isActive,
    user,
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
        onPrimary: () =>
          toggleUpvote({
            payload: session.post as Post,
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
  }, [isActive, queue, toggleUpvote]);

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
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const hours = Math.max(
        1,
        Math.ceil((midnight.getTime() - now.getTime()) / (60 * 60 * 1000)),
      );
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
  }, [isActive, isStreakLoading, hasReadToday, state, client, queue, goTo]);

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

  // Shows the waiting suggestion at a calm moment.
  useEffect(() => {
    if (!isActive || offer || !pendingRef.current) {
      return undefined;
    }
    const id = setInterval(() => {
      const pending = pendingRef.current;
      const now = Date.now();
      if (!pending || now > pending.expiresAt) {
        pendingRef.current = null;
        clearInterval(id);
        return;
      }
      const isPostModal = !!document.querySelector('.post-modal-overlay');
      const isBlocked =
        now < pending.notBefore ||
        document.hidden ||
        isPatchyPeeking() ||
        now - lastScrollAtRef.current < SCROLL_IDLE_MS ||
        (pending.isOverModal ? !isPostModal && isModalOpen() : isModalOpen());
      if (isBlocked) {
        return;
      }
      if (
        pending.kind === 'tldr' &&
        !document.querySelector('[data-testid="tldr-container"]')
      ) {
        pendingRef.current = null;
        clearInterval(id);
        return;
      }
      if (!canPatchyOffer(memory(), pending.kind)) {
        pendingRef.current = null;
        clearInterval(id);
        return;
      }
      clearInterval(id);
      pendingRef.current = null;
      remember(withPatchyOfferShown(memory(), pending.kind, pending.tag));
      offerIdRef.current += 1;
      const { notBefore, expiresAt, tag, ...shown } = pending;
      setOffer({ ...shown, id: offerIdRef.current });
      setPatchyOfferOpen(true);
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
      } else if (button === 'secondary') {
        offer.onSecondary?.();
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
      setPatchyOfferOpen(false);
    },
    [offer, memory, remember, logEvent],
  );

  useEffect(() => () => setPatchyOfferOpen(false), []);

  return { offer: isActive ? offer : null, isReading, onAnswer };
};
