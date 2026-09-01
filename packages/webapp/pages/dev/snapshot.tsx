import type { ReactElement, ReactNode, RefObject } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BookmarkIcon,
  DiscussIcon,
  DownvoteIcon,
  LinkIcon,
  MenuIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { HighlightTextSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/HighlightTextSnapshotCard';
import { PollSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/PollSnapshotCard';
import { CopySummaryButton } from '@dailydotdev/shared/src/features/snapshot/CopySummaryButton';
import { SelectionSnapshotBar } from '@dailydotdev/shared/src/features/snapshot/SelectionSnapshotBar';
import { PollSnapshotButton } from '@dailydotdev/shared/src/features/snapshot/PollSnapshotButton';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { captureShareImage } from '@dailydotdev/shared/src/lib/imageShare/captureShareImage';
import { useCopyText } from '@dailydotdev/shared/src/hooks/useCopy';
import {
  ToastType,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { LogContextData } from '@dailydotdev/shared/src/hooks/log/useLogContextData';

/* Both reach for the auth context — squads, and the link shortener — which is
   only populated on the client, and this page renders outside the app shell. */
const DiscussionShareRow = dynamic(
  () =>
    import(
      '@dailydotdev/shared/src/components/post/focus/DiscussionShareRow'
    ).then((mod) => mod.DiscussionShareRow),
  { ssr: false },
);

const EndOfThreadShare = dynamic(
  () =>
    import('@dailydotdev/shared/src/features/snapshot/EndOfThreadShare').then(
      (mod) => mod.EndOfThreadShare,
    ),
  { ssr: false },
);

/**
 * /dev/snapshot — internal review surface for every share placement the
 * Storybook post-page page argues for, with working controls rather than
 * pictures of them: each copy button really copies and each Snapshot really
 * rasterizes the card it would share.
 *
 * On the post page itself only the text-selection bar is wired, behind
 * `snapshot_selection_share`. Everything else is a placement mock, so the
 * behaviour can be judged before any of it is committed to a surface. Carries
 * `noindex`/`nofollow`; reachable on preview + local but blocked on the
 * canonical production hosts.
 */

const SOURCE = {
  name: 'XDA Developers',
  image:
    'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
};

const LINK = 'https://app.daily.dev/posts/dev-snapshot-post';

const TITLE = 'Why iconic tech brands lost their dominance';

const SUMMARY_LEAD =
  'Nokia, BlackBerry and Kodak all led their categories and all missed the same turn. ';

const QUOTE =
  'Every one of them optimised the product they had instead of the one their customers were moving to.';

const POST = {
  id: 'dev-snapshot-post',
  title: TITLE,
  domain: 'xda-developers.com',
  commentsPermalink: LINK,
  source: { id: 'xda', ...SOURCE },
} as Post;

const POLL = {
  question: 'Which do you reach for first in a new service?',
  options: [
    { text: 'Postgres', share: 62 },
    { text: 'Redis', share: 21 },
    { text: 'SQLite', share: 11 },
    { text: 'Something else', share: 6 },
  ],
  votes: '1,284 votes',
  source: { name: 'Frontend Fans' },
};

/* The real PollSnapshotButton reads a post, so the poll above is expressed as
   one — the same numbers, in the shape production hands it. */
const POLL_POST = {
  id: 'dev-snapshot-poll',
  title: POLL.question,
  numPollVotes: 1284,
  commentsPermalink: LINK,
  source: { id: 'frontend-fans', name: 'Frontend Fans' },
  pollOptions: [
    { id: '1', text: 'Postgres', order: 0, numVotes: 796 },
    { id: '2', text: 'Redis', order: 1, numVotes: 270 },
    { id: '3', text: 'SQLite', order: 2, numVotes: 141 },
    { id: '4', text: 'Something else', order: 3, numVotes: 77 },
  ],
} as unknown as Post;

const QUOTE_TIERS = [
  { label: '<=70 chars . 72px', text: 'They optimised the product they had.' },
  { label: '<=140 chars . 60px', text: QUOTE },
  { label: '<=240 chars . 48px', text: `${SUMMARY_LEAD}${QUOTE}` },
  {
    label: '>280 chars . truncated at the last word',
    text: `${SUMMARY_LEAD}${QUOTE} ${SUMMARY_LEAD}${QUOTE}`,
  },
];

const CAPTURE_OPTIONS = {
  width: SNAPSHOT_SIZE,
  height: SNAPSHOT_SIZE,
  padding: 0,
  branded: false,
};

const useIsAllowedHost = () => {
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const { hostname } = window.location;
    // Block the canonical production hosts only; allow localhost and the
    // *.preview.app.daily.dev preview deployments so reviewers can open it.
    setAllowed(hostname !== 'app.daily.dev' && hostname !== 'www.daily.dev');
  }, []);

  return allowed;
};

const LogContext = getLogContextStatic();

/**
 * `/dev/*` short-circuits to a QueryClient-only tree in _app — no boot, no
 * auth — which is what makes these pages load without the API. The production
 * share components reach for both, so the review harness stands in for them:
 * signed out, no squads, and logging swallowed.
 */
const AUTH_STUB = {
  isLoggedIn: false,
  isAuthReady: true,
  tokenRefreshed: true,
  shouldShowLogin: false,
  squads: [],
  showLogin: () => {},
  closeLogin: () => {},
  logout: async () => {},
  updateUser: async () => {},
  getRedirectUri: () => '',
} as unknown as AuthContextData;

const LOG_STUB = {
  logEvent: () => {},
  logEventStart: () => {},
  logEventEnd: () => {},
} as unknown as LogContextData;

const DevProviders = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider value={AUTH_STUB}>
    <LogContext.Provider value={LOG_STUB}>{children}</LogContext.Provider>
  </AuthContext.Provider>
);

/* ----------------------------------------------------------- page furniture */

const Section = ({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-6 border-t border-border-subtlest-tertiary pt-8">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold text-text-primary typo-title2">{title}</h2>
      <p className="max-w-[52rem] text-text-tertiary typo-callout">{caption}</p>
    </div>
    {children}
  </section>
);

const Placement = ({
  step,
  headline,
  note,
  children,
}: {
  step: string;
  headline: string;
  note: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span className="font-bold uppercase text-text-quaternary typo-caption2">
        {step}
      </span>
      <span className="font-bold text-text-primary typo-callout">
        {headline}
      </span>
      <span className="max-w-[46rem] text-text-tertiary typo-footnote">
        {note}
      </span>
    </div>
    <div className="w-full max-w-[42rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      {children}
    </div>
  </div>
);

/** Inert on purpose: only the control under review does anything here. */
const Inert = ({ icon, label }: { icon: ReactElement; label: string }) => (
  <Button
    aria-label={label}
    disabled
    icon={icon}
    size={ButtonSize.Small}
    type="button"
    variant={ButtonVariant.Tertiary}
  />
);

const CopyLink = ({
  label,
  iconRight,
  variant = ButtonVariant.Tertiary,
  size = ButtonSize.Small,
}: {
  label?: boolean;
  iconRight?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) => {
  const [, copy] = useCopyText(LINK);
  const { displayToast } = useToastNotification();
  // The clipboard rejects outright when the document is not focused, and a
  // press that reports nothing at all reads as a dead button.
  const onCopy = async () => {
    try {
      await copy({ message: '✅ Copied link' });
    } catch {
      displayToast('❌ Your browser blocked the clipboard', {
        variant: ToastType.Error,
      });
    }
  };

  return (
    <Button
      aria-label="Copy link"
      icon={<LinkIcon />}
      iconPosition={
        iconRight ? ButtonIconPosition.Right : ButtonIconPosition.Left
      }
      onClick={onCopy}
      size={size}
      type="button"
      variant={variant}
    >
      {label ? 'Copy link' : undefined}
    </Button>
  );
};

/* --------------------------------------------------------------- the mocks */

const ArticleBody = ({ trailing }: { trailing?: ReactNode }) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
      <img
        alt=""
        className="size-8 rounded-full object-cover"
        src={SOURCE.image}
      />
      <span className="text-text-secondary typo-callout">{SOURCE.name}</span>
      <Inert icon={<MenuIcon />} label="Options" />
    </div>
    <h3 className="break-words font-bold text-text-primary typo-title2">
      {TITLE}
    </h3>
    <p className="select-text break-words text-text-secondary typo-callout">
      {SUMMARY_LEAD}
      {QUOTE}
      {trailing}
    </p>
  </div>
);

const PollResults = () => (
  <div className="flex flex-col gap-2">
    {POLL.options.map((option) => (
      <div
        key={option.text}
        className="relative flex items-center overflow-hidden rounded-10 border border-border-subtlest-tertiary"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-overlay-float-cabbage"
          style={{ width: `${option.share}%` }}
        />
        <span className="relative flex-1 px-3 py-2 text-text-primary typo-footnote">
          {option.text}
        </span>
        <span className="relative px-3 font-bold text-text-primary typo-footnote">
          {option.share}%
        </span>
      </div>
    ))}
  </div>
);

/* ---------------------------------------------------- capture + its output */

const ScaledCard = ({
  label,
  children,
  size = 300,
}: {
  label: string;
  children: ReactNode;
  size?: number;
}) => (
  <figure className="flex flex-col gap-2">
    <figcaption className="font-bold uppercase text-text-quaternary typo-caption2">
      {label}
    </figcaption>
    <div
      className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
      style={{ width: size, height: size }}
    >
      <div
        style={{
          transform: `scale(${size / SNAPSHOT_SIZE})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  </figure>
);

const CaptureOutput = ({
  target,
  label,
}: {
  target: RefObject<HTMLDivElement>;
  label: string;
}): ReactElement => {
  const [image, setImage] = useState<{ url: string; size: number } | null>(
    null,
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCapture = useCallback(async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const blob = await captureShareImage(target, CAPTURE_OPTIONS);
      setImage({ url: URL.createObjectURL(blob), size: blob.size });
    } catch (e) {
      setError(String(e));
    } finally {
      setIsCapturing(false);
    }
  }, [target]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button
          disabled={isCapturing}
          loading={isCapturing}
          onClick={onCapture}
          type="button"
          variant={ButtonVariant.Primary}
        >
          {label}
        </Button>
        {image && (
          <span className="text-text-tertiary typo-footnote">
            {SNAPSHOT_SIZE}x{SNAPSHOT_SIZE} · {Math.round(image.size / 1024)} KB
          </span>
        )}
        {error && (
          <span className="text-status-error typo-footnote">{error}</span>
        )}
      </div>
      {image && (
        <img
          alt="The captured snapshot"
          className="w-full max-w-[22rem] rounded-16 border border-border-subtlest-tertiary"
          src={image.url}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------ the sections */

const TheTwoAdditions = ({
  quoteRef,
}: {
  quoteRef: RefObject<HTMLDivElement>;
}): ReactElement => {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <Section
      caption="Two payloads on this page stand alone without the article: the summary we generated and a line the reader chose. The summary goes out as text so it can be pasted into a thread; the selection goes out as an image, because a quote is worth looking at."
      title="The two additions"
    >
      <Placement
        headline="Copy summary — a tiny icon at the end of the TLDR"
        note="Press it: the clipboard gets the headline, the summary and the link as three paragraphs. Icon only and XSmall, so it reads as punctuation on the paragraph rather than a button under it."
        step="Recommended · working"
      >
        <ArticleBody
          trailing={
            <CopySummaryButton
              link={LINK}
              summary={`${SUMMARY_LEAD}${QUOTE}`}
              title={TITLE}
            />
          }
        />
      </Placement>

      <Placement
        headline="Floating bar on selected text"
        note="Drag-select any part of the paragraph. The bar follows the quote; Snapshot puts the PNG on your clipboard, or downloads it where the clipboard refuses images. This is the one placement already wired into the real post page."
        step="Recommended · working"
      >
        <main ref={containerRef}>
          <SelectionSnapshotBar containerRef={containerRef} post={POST} />
          <ArticleBody />
        </main>
      </Placement>

      <Placement
        headline="What the selection exports"
        note="The card at every size tier, and the real capture underneath — this is the file, not a preview of it."
        step="Result"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-6">
            {QUOTE_TIERS.map((tier) => (
              <ScaledCard key={tier.label} label={tier.label} size={220}>
                <HighlightTextSnapshotCard
                  domain={POST.domain}
                  postTitle={TITLE}
                  seed={tier.label}
                  source={SOURCE}
                  text={tier.text}
                />
              </ScaledCard>
            ))}
          </div>
          <CaptureOutput label="Capture the quote PNG" target={quoteRef} />
        </div>
      </Placement>
    </Section>
  );
};

const ThePromptedMoments = (): ReactElement => (
  <Section
    caption="Three controls that appear on their own rather than waiting to be found, all additive to the action bar. Copy link works in each; the named targets and squad avatars are inert, since what is under review is where the control sits."
    title="The prompted moments"
  >
    <Placement
      headline="Share strip under the comment bar"
      note="DiscussionShareRow, already shipping in the discussion panel but not on the post page. The densest share affordance we have: named targets and squads, no menu, no modal, directly under the composer."
      step="Share strip"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <img
            alt=""
            className="size-8 rounded-full object-cover"
            src={SOURCE.image}
          />
          <div className="flex-1 rounded-12 border border-border-subtlest-tertiary px-3 py-2 text-text-quaternary typo-footnote">
            Share your thoughts
          </div>
        </div>
        <DiscussionShareRow post={POST} withSquads />
      </div>
    </Placement>

    <Placement
      headline="Band under the last comment"
      note="Peak-end: it sits where reading actually stops, and copy link is the whole offer — a still image of a live thread goes stale within hours."
      step="End of thread"
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <img
            alt=""
            className="size-8 rounded-full object-cover"
            src={SOURCE.image}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="font-bold text-text-primary typo-footnote">
              Bobby Iliev
            </span>
            <span className="text-text-tertiary typo-footnote">
              The org chart point is the whole article, honestly.
            </span>
          </div>
        </div>
        <EndOfThreadShare commentsCount={24} post={POST} />
      </div>
    </Placement>

    <Placement
      headline="Prompt after an upvote — already ships"
      note="PostContentShare renders this the moment you upvote a post, with a copy-link input rather than a button. Nothing was built for it: the Storybook page proposed a placement production already had. Snapshot stays out either way — it would be the payload the post's own OG image already carries."
      step="After upvote · shipping"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="min-w-0 flex-1 font-bold text-text-tertiary typo-callout">
          Should anyone else see this post?
        </span>
        <CopyLink iconRight label variant={ButtonVariant.Secondary} />
      </div>
    </Placement>
  </Section>
);

const ThePoll = ({
  pollRef,
}: {
  pollRef: RefObject<HTMLDivElement>;
}): ReactElement => (
  <Section
    caption="Of the eleven post types this is the one where snapshot beats a link outright: the result is a bar chart, self-contained and visual, and worthless as a URL once voting closes. Both Snapshot buttons below capture the poll card for real."
    title="The recommendation: put snapshot on the poll"
  >
    <Placement
      headline="Snapshot beside the vote count"
      note="Icon only, on the metadata line under the bars, where the eye already lands after reading the result."
      step="Recommended · working"
    >
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-text-primary typo-title3">
          {POLL.question}
        </h3>
        <PollResults />
        <div className="flex items-center gap-2">
          <span className="flex-1 text-text-quaternary typo-caption1">
            {POLL.votes} · 2 days left
          </span>
          <PollSnapshotButton post={POLL_POST} showLabel={false} />
        </div>
      </div>
    </Placement>

    <Placement
      headline="Snapshot on the post-vote prompt"
      note="The same payload one moment later, on the prompt that already appears after voting — labelled and primary here, because the prompt is the offer."
      step="Push · working"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-16 bg-action-comment-float p-3">
        <span className="flex items-center gap-1 font-bold text-text-primary typo-footnote">
          <DiscussIcon className="text-action-comment-default" secondary />
          Why did you vote this way?
        </span>
        <div className="flex items-center gap-2">
          <PollSnapshotButton
            post={POLL_POST}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
          />
          <Button
            size={ButtonSize.XSmall}
            type="button"
            variant={ButtonVariant.Subtle}
          >
            Comment
          </Button>
        </div>
      </div>
    </Placement>

    <Placement
      headline="What the poll exports"
      note="The winner is drawn in the accent and the rest stay quiet, so the answer reads before the bars do."
      step="Result"
    >
      <div className="flex flex-wrap items-start gap-6">
        <ScaledCard label="Poll result · 1080 square" size={260}>
          <PollSnapshotCard {...POLL} />
        </ScaledCard>
        <CaptureOutput label="Capture the poll PNG" target={pollRef} />
      </div>
    </Placement>
  </Section>
);

const TheStickyNav = (): ReactElement => (
  <Section
    caption="The sticky nav appears on scroll and carries the post title and its controls. It is a share slot nobody uses — one copy-link icon is the whole recommendation, and snapshot stays out of it."
    title="The sticky nav"
  >
    <Placement
      headline="One copy-link icon in the sticky nav"
      note="Beside the existing controls, at the same size as its neighbours."
      step="Sticky nav · working"
    >
      <div className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary p-2">
        <img
          alt=""
          className="size-8 rounded-full object-cover"
          src={SOURCE.image}
        />
        <span className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
          {TITLE}
        </span>
        <Inert icon={<UpvoteIcon />} label="Upvote" />
        <Inert icon={<BookmarkIcon />} label="Bookmark" />
        <CopyLink />
        <Inert icon={<MenuIcon />} label="Options" />
      </div>
    </Placement>
  </Section>
);

const ShipsToday = (): ReactElement => (
  <Section
    caption="Two share affordances already exist on the post page and neither needs building — open any real post to try them. They are here so the additions above are judged against what is already there rather than against nothing."
    title="What ships today"
  >
    <Placement
      headline="The ⋯ menu opens with Share via, and the bar ends with Copy"
      note="Copy link in the action bar is live below — the same action the production bar performs. The ⋯ menu and its share sheet are inert here; they already work on a real post."
      step="Today"
    >
      <div className="flex flex-col">
        <ArticleBody />
        <div className="mt-3 flex items-center justify-between gap-1 rounded-16 border border-border-subtlest-tertiary p-2">
          <Inert icon={<UpvoteIcon />} label="Upvote" />
          <Inert icon={<DownvoteIcon />} label="Downvote" />
          <Inert icon={<DiscussIcon />} label="Comment" />
          <Inert icon={<BookmarkIcon />} label="Bookmark" />
          <CopyLink label />
        </div>
      </div>
    </Placement>
  </Section>
);

/* ------------------------------------------------------------------- page */

const SnapshotDevPage = (): ReactElement => {
  const allowed = useIsAllowedHost();
  const quoteRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<HTMLDivElement>(null);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-default p-12">
        <p className="text-text-secondary typo-callout">
          The snapshot review page is not available on production.
        </p>
      </div>
    );
  }

  return (
    <>
      <NextSeo nofollow noindex title="Snapshot review · daily.dev" />
      <Toast autoDismissNotifications />
      <DevProviders>
        <div className="min-h-screen bg-background-default">
          <div className="mx-auto flex max-w-[72rem] flex-col gap-8 p-8">
            <div className="flex flex-col gap-3">
              <h1 className="font-bold text-text-primary typo-mega3">
                Post page share placements
              </h1>
              <p className="max-w-[52rem] text-text-secondary typo-body">
                Every placement the Storybook post-page page argues for, with
                working controls instead of pictures of them. Each copy button
                really copies; each Snapshot really rasterizes the card it would
                share.
              </p>
              <p className="max-w-[52rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-callout">
                Every control below is the production component, wired to the
                real post page. On a branch preview all of them are on, so open
                any post on this deployment and they are there — no GrowthBook
                needed. On app.daily.dev each sits behind its own flag:{' '}
                <code>snapshot_selection_share</code>,{' '}
                <code>post_copy_summary</code>, <code>post_share_prompts</code>,{' '}
                <code>poll_snapshot</code> and <code>post_nav_copy_link</code>,
                all defaulting to off.
              </p>
            </div>

            <TheTwoAdditions quoteRef={quoteRef} />
            <ThePromptedMoments />
            <ThePoll pollRef={pollRef} />
            <TheStickyNav />
            <ShipsToday />
          </div>
        </div>
      </DevProviders>

      {/* The full-size cards every capture on the page reads from. */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[-300vw] top-0"
      >
        <HighlightTextSnapshotCard
          ref={quoteRef}
          domain={POST.domain}
          postTitle={TITLE}
          seed={POST.id}
          source={SOURCE}
          text={QUOTE}
        />
        <PollSnapshotCard ref={pollRef} {...POLL} />
      </div>
    </>
  );
};

SnapshotDevPage.getLayout = (page: ReactNode): ReactNode => page;

export default SnapshotDevPage;
