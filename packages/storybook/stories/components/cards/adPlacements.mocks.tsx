import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Ad, Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import {
  adImprovementsV3Feature,
  featureAdLabel,
  featureAutorotateAds,
  featureFeedCardGlassActions,
  AdLabelVariant,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { FeatureOverrides } from '../../../mock/GrowthBookProvider';
import { baseAd } from '../../experiments/adLabel.mocks';

const mockSource = {
  id: 'tds',
  handle: 'tds',
  name: 'Towards Data Science',
  permalink: 'https://app.daily.dev/sources/tds',
  image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
  type: 'machine' as const,
  active: true,
};

const mockSquadSource = {
  id: 'squad-1',
  handle: 'devs',
  name: 'Developer Squad',
  permalink: 'https://app.daily.dev/squads/devs',
  image: 'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/squad',
  type: 'squad' as const,
  active: true,
  public: true,
  membersCount: 150,
};

const mockAuthor = {
  id: 'author-1',
  name: 'John Developer',
  image: 'https://media.daily.dev/image/upload/f_auto/v1/avatars/default',
  permalink: 'https://app.daily.dev/johndeveloper',
  username: 'johndeveloper',
  bio: 'Full-stack developer',
};

const coverImage =
  'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/article-placeholder';

const basePost = {
  numUpvotes: 42,
  numComments: 12,
  bookmarked: false,
  read: false,
  upvoted: false,
  commented: false,
  tags: ['javascript', 'react', 'typescript'],
  source: mockSource,
  author: mockAuthor,
  readTime: 8,
  createdAt: '2024-01-15T10:30:00.000Z',
  permalink: 'https://api.daily.dev/r/article-1',
  commentsPermalink: 'https://daily.dev/posts/article-1',
  image: coverImage,
  type: PostType.Article,
  userState: {
    vote: UserVote.None,
    flags: { feedbackDismiss: false },
  },
};

const make = (overrides: Record<string, unknown>): Post =>
  ({ ...basePost, ...overrides } as unknown as Post);

export const articlePost = make({
  id: 'ads-article',
  title:
    'Understanding React Server Components: A Deep Dive into the Future of Web Development',
  summary:
    'Learn how React Server Components change the way we build web applications.',
});

export const videoPost = make({
  id: 'ads-video',
  title: 'Watch: building a realtime collaborative editor from scratch',
  type: PostType.VideoYouTube,
  numUpvotes: 318,
  numComments: 24,
});

export const sharePost = make({
  id: 'ads-share',
  title: 'Great breakdown of edge rendering, worth a read',
  source: mockSquadSource,
  type: PostType.Share,
  sharedPost: {
    id: 'ads-shared-article',
    title: 'TypeScript Best Practices for 2024',
    image: coverImage,
    readTime: 11,
    permalink: 'https://api.daily.dev/r/ads-shared-article',
    commentsPermalink: 'https://app.daily.dev/posts/ads-shared-article',
    summary: 'Learn the best TypeScript practices for modern development.',
    createdAt: '2024-01-07T19:26:43.146Z',
    private: false,
    type: PostType.Article,
    tags: ['typescript'],
    source: mockSource,
  },
});

export const collectionPost = make({
  id: 'ads-collection',
  title: 'Essential React Hooks Every Developer Should Know',
  summary: 'A curated collection of the most useful React hooks.',
  readTime: 15,
  type: PostType.Collection,
  collectionSources: [mockSource, mockSquadSource],
  numCollectionSources: 5,
});

export const freeformPost = make({
  id: 'ads-freeform',
  title: 'Just shipped a new feature that suggests code improvements',
  source: mockSquadSource,
  type: PostType.Freeform,
  contentHtml: '<p>Just shipped a new feature.</p>',
});

export const pollPost = make({
  id: 'ads-poll',
  title: 'What is your favorite programming language for 2024?',
  source: mockSquadSource,
  type: PostType.Poll,
  image: undefined,
  pollOptions: [
    { id: 'opt-1', text: 'JavaScript', order: 1, numVotes: 45 },
    { id: 'opt-2', text: 'Python', order: 2, numVotes: 32 },
    { id: 'opt-3', text: 'TypeScript', order: 3, numVotes: 28 },
  ],
  endsAt: '2026-01-22T10:30:00.000Z',
  numPollVotes: 105,
});

// Served creatives don't carry a `callToAction`, so no fixture here does
// either: the ad card's bottom row is the advertise link and the remove-ads
// button, and that is what has to line up with the post card's action row.
const feedAd: Ad = { ...baseAd, callToAction: undefined };

export const shortCopyAd: Ad = {
  ...feedAd,
  description: 'Deploy your Next.js app in seconds.',
};

export const longCopyAd: Ad = {
  ...feedAd,
  company: 'Datadog',
  source: 'Datadog',
  description:
    'Observability for teams that ship daily: distributed tracing, log search, RUM and synthetic checks in one place, with alerts that route to the on-call engineer who owns the service.',
};

/** Carbon and EthicalAds creatives render contained over a blurred backdrop. */
export const networkAd: Ad = {
  ...feedAd,
  company: 'Carbon',
  source: 'Carbon',
  companyLogo: undefined,
  description: 'A network creative that keeps its own aspect ratio.',
};

export const taggedAd: Ad = {
  ...feedAd,
  matchingTags: ['nextjs', 'react', 'devops', 'webdev'],
};

export const actionHandlers = {
  onPostClick: fn(),
  onPostAuxClick: fn(),
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
  onShare: fn(),
  onReadArticleClick: fn(),
};

export const adProps = { index: 0, feedIndex: 0, onLinkClick: fn() };

// `control` is the blanket value the Storybook mock returns for every flag,
// which would leave autorotation on a NaN timer and force the v3 tag row on.
// Every section pins the flags that change an ad card, so only the one under
// review differs.
const baseFlags: Record<string, unknown> = {
  [featureAutorotateAds.id]: 0,
  [adImprovementsV3Feature.id]: false,
  [featureFeedCardGlassActions.id]: false,
  [featureAdLabel.id]: AdLabelVariant.Control,
};

export const withFlags = (
  overrides: Record<string, unknown>,
  children: ReactNode,
): ReactElement => (
  <FeatureOverrides values={{ ...baseFlags, ...overrides }}>
    {children}
  </FeatureOverrides>
);

interface ToolbarState {
  showHeights: boolean;
  showGuides: boolean;
  v3Tags: boolean;
}

export const defaultToolbar: ToolbarState = {
  showHeights: true,
  showGuides: false,
  v3Tags: false,
};

interface ToolbarProps {
  state: ToolbarState;
  onChange: (next: ToolbarState) => void;
}

const toggles: { key: keyof ToolbarState; label: string; hint: string }[] = [
  {
    key: 'showHeights',
    label: 'Card heights',
    hint: 'rendered px height of every card',
  },
  {
    key: 'showGuides',
    label: 'Content guides',
    hint: 'the 16px inset the card content should sit on',
  },
  {
    key: 'v3Tags',
    label: 'ad_improvements_v3',
    hint: 'adds the matching-tags row to ad cards',
  },
];

/** Frames embed the canvas story, and three stacked toolbars is just noise. */
export const isEmbedded = (): boolean =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('embedded');

export const Toolbar = ({ state, onChange }: ToolbarProps): ReactElement => (
  <div className="sticky top-0 z-3 -mx-6 mb-2 flex flex-wrap items-center gap-4 border-b border-border-subtlest-tertiary bg-background-default px-6 py-3">
    {toggles.map(({ key, label, hint }) => (
      <label
        key={key}
        className="flex cursor-pointer items-center gap-2 typo-footnote"
        title={hint}
      >
        <input
          type="checkbox"
          checked={state[key]}
          onChange={(event) =>
            onChange({ ...state, [key]: event.target.checked })
          }
        />
        <span>{label}</span>
      </label>
    ))}
    <span className="text-text-quaternary typo-footnote">
      Ad slots are outlined in cabbage.
    </span>
  </div>
);

export interface Slot {
  key: string;
  label: string;
  isAd?: boolean;
  node: ReactNode;
  /** Caps the slot for placements that are narrower than a feed card. */
  width?: string;
}

const useMeasuredHeight = (
  enabled: boolean,
): [React.RefObject<HTMLDivElement>, number | undefined] => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const card = ref.current?.firstElementChild;

    if (!enabled || !card) {
      setHeight(undefined);
      return undefined;
    }

    const observer = new ResizeObserver(() =>
      setHeight(Math.round(card.getBoundingClientRect().height)),
    );
    observer.observe(card);

    return () => observer.disconnect();
  }, [enabled]);

  return [ref, height];
};

interface CardSlotProps extends Omit<Slot, 'key'> {
  showHeights: boolean;
  showGuides: boolean;
}

const CardSlot = ({
  label,
  isAd,
  node,
  width,
  showHeights,
  showGuides,
}: CardSlotProps): ReactElement => {
  const [ref, height] = useMeasuredHeight(showHeights);

  return (
    <div className="flex h-full flex-col gap-2" style={{ maxWidth: width }}>
      <div className="flex h-5 items-center gap-2">
        <span
          className={classNames(
            'truncate font-bold typo-footnote',
            isAd ? 'text-accent-cabbage-default' : 'text-text-tertiary',
          )}
        >
          {label}
        </span>
        {showHeights && height ? (
          <span className="ml-auto shrink-0 rounded-6 bg-surface-float px-1.5 tabular-nums text-text-tertiary typo-caption2">
            {height}px
          </span>
        ) : null}
      </div>
      <div
        ref={ref}
        className={classNames(
          'relative flex-1',
          isAd && 'rounded-16 ring-2 ring-accent-cabbage-default',
        )}
      >
        {node}
        {showGuides && (
          <span className="pointer-events-none absolute inset-y-0 left-4 right-4 z-3 border-x border-dashed border-accent-ketchup-default opacity-64" />
        )}
      </div>
    </div>
  );
};

interface SlotGridProps {
  slots: Slot[];
  columns?: number;
  showHeights: boolean;
  showGuides: boolean;
}

// Columns are pinned to the 20rem the feed gives a grid card, not to the
// Storybook panel width: a squeezed card clamps its title and overlaps its
// action row, which would read as an inconsistency that production never has.
export const SlotGrid = ({
  slots,
  columns = 3,
  showHeights,
  showGuides,
}: SlotGridProps): ReactElement => (
  <div className="w-full overflow-x-auto pb-2">
    <div
      className="grid w-fit items-stretch"
      style={{
        gridTemplateColumns: `repeat(${columns}, 20rem)`,
        gap: '2rem',
      }}
    >
      {slots.map(({ key, ...slot }) => (
        <CardSlot
          key={key}
          {...slot}
          showHeights={showHeights}
          showGuides={showGuides}
        />
      ))}
    </div>
  </div>
);

interface SlotStackProps extends Omit<SlotGridProps, 'columns'> {
  /**
   * `desktop` matches list mode on laptop (FeedPageLayoutList caps the feed at
   * 42.5rem); `viewport` fills the frame, which is what the mobile layout does.
   */
  fit?: 'desktop' | 'viewport';
}

export const SlotStack = ({
  slots,
  showHeights,
  showGuides,
  fit = 'desktop',
}: SlotStackProps): ReactElement => (
  <div
    className={classNames(
      'flex w-full flex-col gap-6',
      fit === 'desktop' && 'min-w-[42.5rem] max-w-[42.5rem]',
    )}
  >
    {slots.map(({ key, ...slot }) => (
      <CardSlot
        key={key}
        {...slot}
        showHeights={showHeights}
        showGuides={showGuides}
      />
    ))}
  </div>
);

/**
 * Tailwind breakpoints answer to the viewport, not to a container, so a card
 * squeezed into a narrow div still renders its laptop layout. Embedding the
 * canvas story in a real iframe gives it a real viewport, which is the only
 * way the mobile list card (stacked cover, action row moved below the text)
 * shows up truthfully.
 */
export const DeviceFrame = ({
  label,
  storyId,
  width,
  height = 1600,
}: {
  label: string;
  storyId: string;
  width: number;
  height?: number;
}): ReactElement => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const read = () =>
      setTheme(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      );
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <span className="font-bold text-text-tertiary typo-footnote">
        {label} ({width}px)
      </span>
      <iframe
        title={label}
        src={`/iframe.html?id=${storyId}&viewMode=story&globals=theme:${theme}&embedded=1`}
        width={width}
        height={height}
        className="rounded-16 border border-border-subtlest-tertiary bg-background-default"
      />
    </div>
  );
};
