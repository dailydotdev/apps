import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
// @ts-expect-error react-dom ships no types in this package
import { createPortal } from 'react-dom';
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
import type { ReplyMode, SignupReason } from './CommentsTeaser';
import { commentsTitle, CommentsTeaser } from './CommentsTeaser';
import type { Reveal } from './footers';
import { DesktopColumnFooter, PhoneFooter, PhoneFooterSpacer } from './footers';
import type { PromptAction } from './prompts';
import {
  DesktopActionPrompt,
  PhoneAppPrompt,
  useActionIntercept,
} from './prompts';

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

export type SpyReason = SignupReason | 'login' | 'app' | 'dismiss';

export interface SignupEvent {
  reason: SpyReason;
  at: number;
}

const spyLabel: Record<SpyReason, string> = {
  footer: 'Sign-up opens · from the footer',
  skeleton: 'Sign-up opens · tapped a skeleton comment',
  replies: 'Sign-up opens · tapped the folded replies',
  action: 'Sign-up opens · from the action prompt',
  login: 'Log-in opens',
  app: 'App store opens (daily.dev app)',
  dismiss: 'Dismissed',
};

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
  return (
    <div
      role="status"
      className="fixed left-1/2 top-4 z-max -translate-x-1/2 rounded-12 bg-surface-invert px-4 py-2 font-bold text-surface-primary shadow-2 typo-callout"
    >
      {spyLabel[event.reason]}
    </div>
  );
};

export const useSignupSpy = (): {
  event?: SignupEvent;
  emit: (reason: SpyReason) => void;
} => {
  const [event, setEvent] = useState<SignupEvent>();
  const emit = useCallback(
    (reason: SpyReason) => setEvent({ reason, at: Date.now() }),
    [],
  );
  return { event, emit };
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

/** True once the comments are on screen, read in the frame's window. */
const useCommentsInView = (
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
      const slot = doc.querySelector('[data-teaser-slot]');
      setInView(!!slot && slot.getBoundingClientRect().top < view.innerHeight);
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
 * The bottom sign-up bar a logged-out laptop reader gets today, the real
 * component (its column layout won signup_strip_column, +14% sign-ups). In
 * the "banner" option its headline speaks for the comments while they are
 * on screen.
 */
const LaptopBanner = ({
  title,
  speakForComments,
}: {
  title: string;
  speakForComments: boolean;
}): ReactElement => {
  const [marker, inView] = useCommentsInView(speakForComments);
  return (
    <>
      <span ref={marker} hidden />
      <AuthenticationBanner>
        {speakForComments && inView ? (
          <OnboardingHeadline
            className={authBannerHeadlineClassName}
            title={title}
            description="Join millions of developers reading, voting, and replying on daily.dev."
          />
        ) : undefined}
      </AuthenticationBanner>
    </>
  );
};

/** How the laptop page asks. */
export type LaptopAsk =
  /** Today: the full-width bottom banner, untouched. */
  | 'today'
  /** The mobile footer's design at the post column, instead of the banner. */
  | 'footer'
  /** The banner stays and its headline takes the comment copy. */
  | 'banner';

export interface TeaserPageProps {
  scenario: Scenario;
  /** Tablet has no bottom bar today; the teaser gives it the laptop footer. */
  device: 'phone' | 'tablet' | 'laptop';
  replies?: ReplyMode;
  /** False shows today's comment list: every comment, no skeleton. */
  teaser?: boolean;
  laptopAsk?: LaptopAsk;
  /** Phone: X's "See this post in the app" card on load. */
  appPrompt?: boolean;
  /** Laptop: X's per-action sign-up card on upvote / comment / bookmark. */
  actionPrompts?: boolean;
  /** When the pinned footer arrives: X's rule, or on load. */
  reveal?: Reveal;
  emit: (reason: SpyReason) => void;
}

export const TeaserPostPage = ({
  scenario,
  device,
  replies = 'locked',
  teaser = true,
  laptopAsk = 'footer',
  appPrompt = false,
  actionPrompts = false,
  reveal = 'x',
  emit,
}: TeaserPageProps): ReactElement => {
  const post = useSeedComments(scenario);
  const total = totalOf(scenario);
  const title = teaser ? commentsTitle(total) : 'See all posts';
  const setUrl = useDeviceUrl();
  useEffect(() => setUrl(`/posts/${post.slug ?? post.id}`), [post, setUrl]);

  const [isAppPromptOpen, setAppPromptOpen] = useState(appPrompt);
  const [action, setAction] = useState<PromptAction>();
  const onAction = useCallback((next: PromptAction) => setAction(next), []);
  const interceptRef = useActionIntercept(
    device !== 'phone' && actionPrompts,
    onAction,
  );
  // X on a phone: every action goes to the app store.
  const phoneInterceptRef = useActionIntercept(
    device === 'phone' && appPrompt,
    useCallback(() => emit('app'), [emit]),
  );

  const isPhone = device === 'phone';
  const isLaptop = device === 'laptop';
  // Laptop picks its ask; tablet has no banner today, so the teaser is the
  // footer and today is nothing.
  const showBanner =
    isLaptop && (laptopAsk === 'today' || laptopAsk === 'banner');
  const showColumnFooter =
    (isLaptop && laptopAsk === 'footer') || (device === 'tablet' && teaser);
  const authorName = post.author?.name ?? post.source?.name ?? 'the author';

  return (
    <ActivePostContextProvider post={post}>
      <span ref={interceptRef} hidden />
      <span ref={phoneInterceptRef} hidden />
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
      <CommentSlotSwap enabled={teaser}>
        <CommentsTeaser
          post={post}
          comments={scenario.comments}
          replies={replies}
          onSignup={emit}
        />
      </CommentSlotSwap>

      {isPhone && (
        <div
          data-sb-footer
          onClickCapture={(event) => {
            // The real footer's button is an app-store link; keep the
            // review on the page.
            if ((event.target as HTMLElement).closest('a')) {
              event.preventDefault();
              emit('app');
            }
          }}
        >
          <PhoneFooterSpacer />
          <PhoneFooter title={title} reveal={teaser ? reveal : 'onLoad'} />
        </div>
      )}

      {showBanner && (
        <div data-sb-footer>
          <div aria-hidden className="h-[18rem]" />
          <LaptopBanner
            title={title}
            speakForComments={teaser && laptopAsk === 'banner'}
          />
        </div>
      )}
      {showColumnFooter && (
        <div data-sb-footer>
          <div aria-hidden className="h-[11rem]" />
          <DesktopColumnFooter
            title={title}
            reveal={reveal}
            onContinue={() => emit('footer')}
          />
        </div>
      )}

      {isPhone && isAppPromptOpen && (
        <PhoneAppPrompt
          post={post}
          onClose={() => setAppPromptOpen(false)}
          onOpenApp={() => emit('app')}
        />
      )}
      {!isPhone && action && (
        <DesktopActionPrompt
          action={action}
          name={authorName}
          onClose={() => setAction(undefined)}
          onLogin={() => {
            setAction(undefined);
            emit('login');
          }}
          onSignup={() => {
            setAction(undefined);
            emit('action');
          }}
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
