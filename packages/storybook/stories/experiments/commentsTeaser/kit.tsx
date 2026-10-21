import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { graphql, HttpResponse } from 'msw';
import { useQueryClient } from '@tanstack/react-query';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { SortCommentsBy } from '@dailydotdev/shared/src/graphql/comments';
import { generateCommentsQueryKey } from '@dailydotdev/shared/src/lib/query';
import { PostContent } from '@dailydotdev/shared/src/components/post/PostContent';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  AuthenticationBanner,
  authBannerHeadlineClassName,
} from '@dailydotdev/shared/src/components/auth/AuthenticationBanner';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/auth/OnboardingHeadline';
import { fullPost } from '../../history/posts';
import { useDeviceUrl } from '../../history/device';
import type { Scenario } from './data';
import { scenarios, toCommentsData, totalOf } from './data';
import type { GateVariant, ReplyMode, SignupReason } from './CommentsTeaser';
import {
  CommentsTeaser,
  formatCount,
  gateCopy,
  visibleComments,
  VISIBLE_LIMIT,
} from './CommentsTeaser';

/** A real article from the History fixtures, reused for its page chrome. */
const BASE_POST_ID = 'XCmmeq8ZC';

export const postFor = (scenario: Scenario): Post => {
  const base = fullPost(BASE_POST_ID);
  return {
    ...base,
    id: `sb-teaser-${scenario.id}`,
    numComments: totalOf(scenario),
  } as Post;
};

/** Every scenario's comments, by the post id its page asks for. */
const commentsByPost = new Map(
  scenarios.map((scenario) => [
    postFor(scenario).id,
    toCommentsData(scenario.comments),
  ]),
);

/**
 * The comments query answers from the scenarios, so the page's own
 * 60-second refetch keeps the same data instead of hitting the network.
 */
export const commentHandlers = [
  graphql.query('PostComments', ({ variables }) =>
    HttpResponse.json({
      data: commentsByPost.get(variables.postId as string) ?? {
        postComments: { edges: [], pageInfo: { hasNextPage: false } },
      },
    }),
  ),
];

/** Seeds both sort orders, so the page renders its comments on first paint. */
export const useSeedComments = (scenario: Scenario): Post => {
  const client = useQueryClient();
  const post = useMemo(() => postFor(scenario), [scenario]);
  useState(() => {
    [SortCommentsBy.NewestFirst, SortCommentsBy.OldestFirst].forEach((sortBy) =>
      client.setQueryData(
        generateCommentsQueryKey({ postId: post.id, sortBy }),
        toCommentsData(scenario.comments),
      ),
    );
    return true;
  });
  return post;
};

/* --------------------------------------------------------- sign-up spy */

export interface SignupEvent {
  reason: SignupReason | 'login';
  at: number;
}

/** What a click would open in the app, shown instead of the auth modal. */
export const SignupToast = ({
  event,
}: {
  event?: SignupEvent;
}): ReactElement | null => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!event) {
      return undefined;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, [event]);
  if (!event || !visible) {
    return null;
  }
  const label: Record<SignupEvent['reason'], string> = {
    gate: 'Sign-up opens · trigger "comments teaser"',
    skeleton: 'Sign-up opens · tapped a skeleton comment',
    replies: 'Sign-up opens · tapped "View replies"',
    login: 'Log-in opens',
  };
  return (
    <div
      role="status"
      className="fixed left-1/2 top-4 z-max -translate-x-1/2 rounded-12 bg-surface-invert px-4 py-2 font-bold text-surface-primary shadow-2 typo-callout"
    >
      {label[event.reason]}
    </div>
  );
};

export const useSignupSpy = (): {
  event?: SignupEvent;
  onSignup: (reason: SignupReason) => void;
  onLogin: () => void;
} => {
  const [event, setEvent] = useState<SignupEvent>();
  return {
    event,
    onSignup: (reason) => setEvent({ reason, at: Date.now() }),
    onLogin: () => setEvent({ reason: 'login', at: Date.now() }),
  };
};

/* ------------------------------------------------- the real post page */

const findCommentsSlot = (body: HTMLElement): HTMLElement | null => {
  // The teaser renders MainComments too; only production's list counts.
  const firstComment = [
    ...body.querySelectorAll('section[data-testid="comment"]'),
  ].find((node) => !node.closest('[data-teaser-slot]'));
  if (firstComment?.parentElement) {
    return firstComment.parentElement;
  }
  // No comments: PostComments renders the charm empty state instead.
  const charm = body.querySelector('img[alt^="daily.dev charm peeking"]');
  let node = charm?.parentElement ?? null;
  while (node && !node.className.toString().includes('mb-12')) {
    node = node.parentElement;
  }
  return node;
};

const findEndOfThread = (body: HTMLElement): HTMLElement | null => {
  const title = [...body.querySelectorAll('h2,h3,p,span')].find(
    (node) => node.textContent === 'Enjoyed this discussion?',
  );
  let node = title?.parentElement ?? null;
  while (node && !node.className.toString().includes('my-6')) {
    node = node.parentElement;
  }
  return node;
};

/**
 * Puts the teaser where production renders the comment list. The page is
 * the real PostContent, so the swap happens in the DOM: the list is hidden
 * and the teaser portals into a slot right before it. In the app this is a
 * branch inside PostComments; nothing here needs a production change to
 * review.
 */
const CommentSlotSwap = ({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}): ReactElement => {
  const marker = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const body = marker.current?.ownerDocument.body;
    if (!body || !enabled) {
      return undefined;
    }
    let slot: HTMLElement | null = null;
    let created: HTMLElement | null = null;
    const hidden = new Set<HTMLElement>();
    const sync = () => {
      const found = findCommentsSlot(body);
      if (found && found !== slot) {
        slot = found;
        created?.remove();
        created = body.ownerDocument.createElement('div');
        created.dataset.teaserSlot = 'true';
        found.before(created);
        setHost(created);
      }
      [slot, findEndOfThread(body)].forEach((node) => {
        if (node && node.style.display !== 'none') {
          node.style.display = 'none';
          hidden.add(node);
        }
      });
    };
    const observer = new MutationObserver(sync);
    observer.observe(body, { childList: true, subtree: true });
    sync();
    return () => {
      observer.disconnect();
      hidden.forEach((node) => {
        node.style.display = '';
      });
      created?.remove();
      setHost(null);
    };
  }, [enabled]);

  return (
    <>
      <span ref={marker} hidden />
      {host && createPortal(children, host)}
    </>
  );
};

/** True while the teaser's gate is on screen, read in the frame's window. */
const useGateInView = (
  enabled: boolean,
): [React.RefObject<HTMLSpanElement>, boolean] => {
  const marker = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const doc = marker.current?.ownerDocument;
    const view = doc?.defaultView;
    if (!doc || !view || !enabled) {
      return undefined;
    }
    // Scroll position, not IntersectionObserver: the observer is inert in a
    // hidden pane and the review should not depend on it.
    const check = () => {
      const gate = doc.querySelector('[data-testid="comments-teaser-gate"]');
      if (!gate) {
        setInView(false);
        return;
      }
      const { top } = gate.getBoundingClientRect();
      // From the moment the comments start until the page ends.
      const slot = doc.querySelector('[data-teaser-slot]');
      const start = slot?.getBoundingClientRect().top ?? top;
      setInView(start < view.innerHeight);
    };
    view.addEventListener('scroll', check, true);
    const timer = view.setInterval(check, 500);
    check();
    return () => {
      view.removeEventListener('scroll', check, true);
      view.clearInterval(timer);
    };
  }, [enabled]);
  return [marker, inView];
};

/**
 * The bottom sign-up bar the post page shows a logged-out laptop reader
 * (control of post_signup_strip), real component. In the "bar" variant its
 * headline speaks for the comments while they are on screen.
 */
const StickyBar = ({
  scenario,
  replies,
  speakForComments,
}: {
  scenario: Scenario;
  replies: ReplyMode;
  speakForComments: boolean;
}): ReactElement => {
  const [marker, inView] = useGateInView(speakForComments);
  const total = totalOf(scenario);
  const { count } = visibleComments(scenario.comments, VISIBLE_LIMIT, replies);
  const copy = gateCopy(total, total - count);
  return (
    <>
      <span ref={marker} hidden />
      <AuthenticationBanner>
        {speakForComments && inView ? (
          <OnboardingHeadline
            className={authBannerHeadlineClassName}
            title={copy.title}
            description={
              total - count > 0
                ? `${formatCount(
                    total - count,
                  )} more comments are waiting. Join millions of developers reading, voting, and replying on daily.dev.`
                : 'Join millions of developers reading, voting, and replying on daily.dev.'
            }
          />
        ) : undefined}
      </AuthenticationBanner>
    </>
  );
};

export const TeaserPostPage = ({
  scenario,
  variant,
  replies = 'locked',
  teaser = true,
  stickyBar = false,
  onSignup,
  onLogin,
}: {
  scenario: Scenario;
  variant: GateVariant;
  replies?: ReplyMode;
  /** False shows today's page: every comment, no gate. */
  teaser?: boolean;
  /** Laptop: the page's bottom sign-up bar, as production mounts it. */
  stickyBar?: boolean;
  onSignup: (reason: SignupReason) => void;
  onLogin: () => void;
}): ReactElement => {
  const post = useSeedComments(scenario);
  // The bar variant needs the bar; without it (phone, tablet) the inline
  // gate asks with the sign-up buttons instead, so the reader is never left
  // with no way in.
  const gateVariant = variant === 'bar' && !stickyBar ? 'providers' : variant;
  const setUrl = useDeviceUrl();
  useEffect(() => setUrl(`/posts/${post.slug ?? post.id}`), [post, setUrl]);
  return (
    <ActivePostContextProvider post={post}>
      <div className={classNames(stickyBar && 'pb-[18rem]')}>
        <PostContent
          key={post.id}
          post={post}
          isPostPage
          origin={Origin.ArticlePage}
          className={{
            container:
              '!mt-0 mb-16 max-w-[69.25rem] tablet:mb-8 laptop:mb-0 laptop:pb-6 laptopL:pb-0',
            fixedNavigation: { container: 'flex laptop:hidden' },
            navigation: {
              container: 'flex tablet:hidden',
              actions: 'flex-1 justify-between',
            },
          }}
        />
      </div>
      <CommentSlotSwap enabled={teaser}>
        <CommentsTeaser
          post={post}
          comments={scenario.comments}
          numComments={totalOf(scenario)}
          variant={gateVariant}
          replies={replies}
          onSignup={onSignup}
          onLogin={onLogin}
        />
      </CommentSlotSwap>
      {stickyBar && (
        <StickyBar
          scenario={scenario}
          replies={replies}
          speakForComments={teaser && variant === 'bar'}
        />
      )}
    </ActivePostContextProvider>
  );
};

/** Scrolls a Device's frame to the comments once they render. */
export const ScrollToComments = ({
  offset = 160,
}: {
  offset?: number;
}): ReactElement => {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const doc = marker.current?.ownerDocument;
    const view = doc?.defaultView;
    if (!doc || !view) {
      return undefined;
    }
    let tries = 0;
    const timer = view.setInterval(() => {
      tries += 1;
      const slot = doc.querySelector('[data-teaser-slot]');
      const target =
        slot ?? doc.querySelector('section[data-testid="comment"]');
      if (target || tries > 40) {
        view.clearInterval(timer);
        if (target) {
          const top =
            target.getBoundingClientRect().top + view.scrollY - offset;
          view.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
        }
      }
    }, 250);
    return () => view.clearInterval(timer);
  }, [offset]);
  return <span ref={marker} hidden />;
};
