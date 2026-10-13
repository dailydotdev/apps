import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { BlockIcon } from '@dailydotdev/shared/src/components/icons/Block';
import { ShieldPlusIcon } from '@dailydotdev/shared/src/components/icons/ShieldPlus';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { LabelIcon } from '@dailydotdev/shared/src/components/icons/Label';
import { FolderIcon } from '@dailydotdev/shared/src/components/icons/Folder';
import { BriefIcon } from '@dailydotdev/shared/src/components/icons/Brief';
import type { Ad, Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { BookmarkFolder } from '@dailydotdev/shared/src/graphql/bookmarks';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { AdList } from '@dailydotdev/shared/src/components/cards/ad/AdList';
import { BriefCardReady } from '@dailydotdev/shared/src/components/cards/brief/BriefCard/BriefCardReady';
import { BookmarkSection } from '@dailydotdev/shared/src/components/sidebar/sections/BookmarkSection';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { usePrefersReducedMotion } from '@dailydotdev/shared/src/hooks/usePrefersReducedMotion';
import { realPosts } from '../experiments/cardActions/swap';

// The Plus scroll stopper as a showcase: the landing page's glass frame, and a
// miniature of the real feed (production cards, sidebar and brief card, scaled
// down) that changes with the selected feature. Rotates on its own while in
// view until the reader picks a feature, then holds.
//
// Layout follows the strip's own width (container queries), because in the
// feed that width depends on the column count and the sidebar, not just the
// viewport: stacked below 600px, a header row from 600px, two columns from
// 1000px, and a capped preview from 1400px.

export const STRIP_STYLES = `
.pss-frame {
  border: 1px solid color-mix(in srgb, var(--theme-text-primary) 10%, transparent);
  background: color-mix(in srgb, var(--theme-accent-cabbage-default) 3%, var(--theme-background-default));
}
.pss-glass {
  background: color-mix(in srgb, var(--theme-background-default) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--theme-text-primary) 12%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--theme-text-primary) 10%, transparent);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
}
.pss-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(110px);
  mix-blend-mode: screen;
  pointer-events: none;
  opacity: 0.3;
  animation: pss-breathe 22s ease-in-out infinite;
}
.pss-orb--delay { animation-delay: -8s; }
.light .pss-orb { mix-blend-mode: multiply; opacity: 0.12; animation: none; }
@keyframes pss-breathe {
  0%, 100% { opacity: 0.24; }
  50% { opacity: 0.36; }
}
.pss-topglow {
  background:
    radial-gradient(42% 60% at 50% -8%, color-mix(in srgb, var(--theme-accent-cabbage-default) 18%, transparent) 0%, transparent 70%),
    radial-gradient(30% 50% at 10% -12%, color-mix(in srgb, var(--theme-accent-onion-default) 14%, transparent) 0%, transparent 70%);
}
.pss-progress {
  transform-origin: left center;
  animation: pss-progress var(--pss-dwell) linear both;
}
@keyframes pss-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.pss-chip { transition: background-color 150ms ease-out, color 150ms ease-out; }

.pss-mini {
  position: absolute;
  left: 0;
  top: 0;
  width: calc(100% / var(--pss-scale));
  height: calc(100% / var(--pss-scale));
  transform: scale(var(--pss-scale));
  transform-origin: top left;
  pointer-events: none;
}
.pss-mini .mobileXL\\:w-40,
.pss-mini .mobileXXL\\:w-56,
.pss-mini .mobileXL\\:w-60 { width: 11rem; }
.pss-mark {
  border-radius: 1rem;
  outline: 3px solid color-mix(in srgb, var(--theme-text-primary) 72%, transparent);
  outline-offset: 4px;
}
.pss-note {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2rem;
}
.pss-hidden-row {
  border: 2px dashed var(--theme-border-subtlest-secondary);
}

.pss { container-type: inline-size; }
.pss-body { display: flex; flex-direction: column; gap: 1.25rem; }
.pss-head { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.pss-copy { display: flex; flex: 1 1 0%; flex-direction: column; gap: 0.375rem; min-width: 0; }
.pss-cta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.pss-stage { display: flex; flex-direction: column; gap: 0.75rem; min-width: 0; }
.pss-tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  margin: 0 -1rem;
  padding: 0 1rem 0.125rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.pss-tabs::-webkit-scrollbar { display: none; }
.pss-tab { display: flex; flex-direction: column; justify-content: center; height: 2rem; padding: 0 0.625rem; white-space: nowrap; text-align: left; }
.pss-tab-perk { display: none; }
.pss-window { --pss-scale: 0.5; position: relative; display: grid; grid-template-columns: 1fr 1fr; height: 15rem; overflow: hidden; }
@container (max-width: 419px) {
  .pss-title { font-size: 1.25rem; line-height: 1.625rem; }
}
@container (min-width: 600px) {
  .pss-head { flex-direction: row; align-items: center; justify-content: space-between; gap: 1.5rem; }
  .pss-cta { flex-wrap: nowrap; flex-shrink: 0; }
  .pss-stage { flex-direction: row; align-items: stretch; gap: 1rem; }
  .pss-tabs { flex-direction: column; flex-shrink: 0; width: 11.5rem; gap: 0.125rem; overflow: visible; margin: 0; padding: 0; }
  .pss-tab { height: auto; min-height: 1.75rem; padding: 0.25rem 0.625rem; white-space: normal; }
  .pss-tab-perk { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .pss-tab[aria-selected='true'] { justify-content: flex-start; height: 3.875rem; padding-top: 0.375rem; padding-bottom: 0.375rem; }
  .pss-perk-phone { display: none; }
  .pss-window { --pss-scale: 0.5; flex: 1 1 0%; height: auto; min-height: 13.5rem; }
  .pss-progress { inset: 0.5rem auto 0.5rem 0; width: 2px; height: auto; transform-origin: top center; animation-name: pss-progress-y; }
}
@container (min-width: 1000px) {
  .pss-body {
    display: grid;
    grid-template-columns: minmax(14rem, 1fr) auto;
    gap: 1.5rem;
    padding: 0 0 0 1.25rem;
  }
  .pss-head { flex-direction: column; align-items: stretch; justify-content: center; gap: 1rem; padding: 1rem 0; }
  .pss-copy { flex: 0 0 auto; }
  .pss-cta { flex-wrap: wrap; }
  .pss-tabs { justify-content: center; padding: 1rem 0; }
  .pss-window { flex: none; width: 30rem; min-height: 0; border-width: 0 0 0 1px; border-radius: 0 0.875rem 0.875rem 0; }
  .pss-note { min-height: 0; -webkit-line-clamp: 1; }
}
@container (min-width: 1400px) {
  .pss-window { width: 36rem; }
}
@keyframes pss-progress-y {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
@media (prefers-reduced-motion: reduce) {
  .pss-orb { animation: none; }
  .pss-progress { animation: none; transform: scaleX(1); }
}
`;

const DWELL_MS = 4200;
const REVEAL_MS = 900;

type Feature = {
  id: string;
  label: string;
  perk: string;
  Icon: ComponentType<IconProps>;
  Preview: ComponentType;
};

const useInView = (
  threshold: number,
): [React.RefObject<HTMLElement>, boolean] => {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

/* Real content: posts from the anonymized real-feed fixture. */

const postTitled = (start: string): Post => {
  const post = realPosts.find((item) => item.title?.startsWith(start));
  if (!post) {
    throw new Error(`realFeed.json has no post titled "${start}…"`);
  }
  return post;
};

const posts = {
  nextjs: postTitled('Next.js 16.4'),
  bored: postTitled("I Think We're Forgetting"),
  tanstack: postTitled('TanStack Charts'),
  booking: postTitled('How Booking.com'),
  queue: postTitled('I Built a Distributed Task Queue'),
  rustGoogle: postTitled('Google is using AI to migrate'),
  rustMicrosoft: postTitled('Microsoft doubles down on Rust'),
  csharp: postTitled('A faster, lighter C# Dev Kit'),
  llm: postTitled('The LLM Blindspot'),
  readCode: postTitled('How to read code'),
  nuget: postTitled('AI added a vulnerable NuGet'),
  pewdiepie: postTitled("PewDiePie didn't trust Big AI"),
  devopsDay2: postTitled('Day 2/30 Real-World DevOps Problems'),
};

const cleanTitle: Post = {
  ...posts.devopsDay2,
  title: 'Day 2 of 30: tracing a Java service’s memory limit on Kubernetes',
  clickbaitTitleDetected: false,
} as Post;

const sampleAd: Ad = {
  source: 'daily.dev',
  company: 'Northwind Cloud',
  link: 'https://daily.dev',
  description: 'Ship preview environments for every pull request in seconds',
  image: 'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/3',
  companyLogo: 'https://media.daily.dev/image/upload/f_auto/v1/avatars/default',
  callToAction: 'Try it free',
};

const briefPost = {
  id: 'pss-brief',
  type: PostType.Brief,
  title: 'Rust lands in Microsoft and Google codebases, Next.js 16.4 ships',
  createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  collectionSources: [
    posts.nextjs.source,
    posts.rustMicrosoft.source,
    posts.llm.source,
    posts.tanstack.source,
  ],
  flags: {
    posts: 5214,
    sources: 312,
    savedTime: 180,
    generatedAt: new Date().toISOString(),
  },
} as unknown as Post;

const sampleFolders = [
  'AI coding',
  'Rust',
  'System design',
  'Read on Friday',
].map(
  (name, index): BookmarkFolder => ({
    id: `pss-folder-${index}`,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
);

/* Each illustration compares today's feed with the same feed on Plus, using
   production components at their real size, scaled down. */

const noop = (): void => undefined;
const cardHandlers = {
  onPostClick: noop,
  onPostAuxClick: noop,
  onUpvoteClick: noop,
  onDownvoteClick: noop,
  onCommentClick: noop,
  onBookmarkClick: noop,
  onCopyLinkClick: noop,
  onShare: noop,
  onReadArticleClick: noop,
};

const FeedRow = ({
  post,
  marked = false,
}: {
  post: Post;
  marked?: boolean;
}): ReactElement => {
  const Card = PostTypeToListCard[post.type] ?? ArticleList;
  return (
    <div
      className={classNames('overflow-hidden rounded-16', marked && 'pss-mark')}
    >
      <Card post={post} {...cardHandlers} />
    </div>
  );
};

const Half = ({
  plus = false,
  note,
  children,
}: {
  plus?: boolean;
  note: string;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex min-w-0 flex-col',
      !plus && 'border-r border-border-subtlest-tertiary',
    )}
  >
    <div className="flex shrink-0 flex-col gap-0.5 border-b border-border-subtlest-tertiary px-3 py-2">
      <span
        className={classNames(
          'flex items-center gap-1 font-bold typo-caption1',
          plus ? 'text-text-primary' : 'text-text-tertiary',
        )}
      >
        {plus && <DevPlusIcon secondary size={IconSize.Size16} />}
        {plus ? 'With Plus' : 'Today'}
      </span>
      <span
        className={classNames(
          'pss-note typo-caption2',
          plus ? 'text-text-secondary' : 'text-text-quaternary',
        )}
      >
        {note}
      </span>
    </div>
    <div
      className={classNames(
        'relative min-h-0 flex-1 overflow-hidden',
        plus && 'plus-perk-in',
      )}
      style={plus ? { animationDelay: '260ms' } : undefined}
    >
      <div className="pss-mini">
        <div className="flex flex-col gap-4 p-3">{children}</div>
      </div>
    </div>
  </div>
);

const Window = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}): ReactElement => (
  <div
    id={`pss-panel-${id}`}
    role="tabpanel"
    className="pss-window rounded-12 border border-border-subtlest-tertiary bg-background-default"
  >
    {children}
  </div>
);

const AdFreePreview = (): ReactElement => (
  <>
    <Half note="A promoted card between posts">
      <div className="pss-mark">
        <AdList ad={sampleAd} index={1} feedIndex={1} />
      </div>
      <FeedRow post={posts.nextjs} />
    </Half>
    <Half plus note="A post you came for in its place">
      <FeedRow post={posts.tanstack} marked />
      <FeedRow post={posts.nextjs} />
    </Half>
  </>
);

const CleanTitlesPreview = (): ReactElement => (
  <>
    <Half note="A clickbait title">
      <FeedRow post={posts.devopsDay2} marked />
      <FeedRow post={posts.readCode} />
    </Half>
    <Half plus note="Rewritten to say what it is">
      <FeedRow post={cleanTitle} marked />
      <FeedRow post={posts.readCode} />
    </Half>
  </>
);

const FeedHeading = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex items-center gap-2 px-1 text-text-primary">
    <HashtagIcon size={IconSize.Medium} />
    <span className="font-bold typo-title2">{children}</span>
  </div>
);

const CustomFeedsPreview = (): ReactElement => (
  <>
    <Half note="Every topic, mixed together">
      <FeedHeading>My feed</FeedHeading>
      <FeedRow post={posts.bored} />
      <FeedRow post={posts.csharp} />
      <FeedRow post={posts.booking} />
    </Half>
    <Half plus note="A feed for one topic">
      <FeedHeading>AI coding</FeedHeading>
      <FeedRow post={posts.llm} />
      <FeedRow post={posts.readCode} />
      <FeedRow post={posts.nuget} />
    </Half>
  </>
);

const KeywordsPreview = (): ReactElement => (
  <>
    <Half note="Posts about “Big AI” keep showing up">
      <FeedRow post={posts.pewdiepie} marked />
      <FeedRow post={posts.rustMicrosoft} />
    </Half>
    <Half plus note="Muted once, gone from every feed">
      <div className="pss-hidden-row flex items-center gap-3 rounded-16 px-5 py-8 text-text-tertiary">
        <LabelIcon size={IconSize.Medium} />
        <span className="min-w-0 flex-1 typo-title3">
          1 post hidden, mentions “Big AI”
        </span>
      </div>
      <FeedRow post={posts.rustMicrosoft} />
    </Half>
  </>
);

const foldersKey = generateQueryKey(RequestKey.BookmarkFolders);

// The two halves need different folder lists, so each sidebar reads its own
// query cache.
const SidebarWithFolders = ({
  folders,
}: {
  folders: BookmarkFolder[];
}): ReactElement => {
  const [client] = useState(() => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    queryClient.setQueryData(foldersKey, folders);
    return queryClient;
  });

  return (
    <QueryClientProvider client={client}>
      <div className="w-full">
        <BookmarkSection
          isItemsButton={false}
          sidebarExpanded
          shouldShowLabel
          activePage=""
        />
      </div>
    </QueryClientProvider>
  );
};

const FoldersPreview = (): ReactElement => (
  <>
    <Half note="Every save in one long list">
      <SidebarWithFolders folders={[]} />
    </Half>
    <Half plus note="Sorted into folders you name">
      <SidebarWithFolders folders={sampleFolders} />
    </Half>
  </>
);

const BriefingPreview = (): ReactElement => (
  <>
    <Half note="Catching up post by post">
      <FeedRow post={posts.nextjs} />
      <FeedRow post={posts.rustMicrosoft} />
      <FeedRow post={posts.llm} />
    </Half>
    <Half plus note="One briefing, a 3 minute read">
      <div className="flex h-[22rem]">
        <BriefCardReady
          post={briefPost}
          title="Brief is ready!"
          targetId={TargetId.Feed}
        />
      </div>
    </Half>
  </>
);

export const features: Feature[] = [
  {
    id: 'ad-free',
    label: 'Ad-free',
    perk: 'Removes every ad',
    Icon: BlockIcon,
    Preview: AdFreePreview,
  },
  {
    id: 'clean-titles',
    label: 'Clean titles',
    perk: 'Rewrites clickbait titles',
    Icon: ShieldPlusIcon,
    Preview: CleanTitlesPreview,
  },
  {
    id: 'custom-feeds',
    label: 'Custom feeds',
    perk: 'Builds feeds you can query, like AI coding',
    Icon: HashtagIcon,
    Preview: CustomFeedsPreview,
  },
  {
    id: 'keywords',
    label: 'Keywords',
    perk: 'Hides posts with words you mute, like “Big AI”',
    Icon: LabelIcon,
    Preview: KeywordsPreview,
  },
  {
    id: 'folders',
    label: 'Folders',
    perk: 'Organizes bookmarks into folders',
    Icon: FolderIcon,
    Preview: FoldersPreview,
  },
  {
    id: 'briefing',
    label: 'Briefing',
    perk: 'Unlocks Presidential Briefing',
    Icon: BriefIcon,
    Preview: BriefingPreview,
  },
];

interface PlusShowcaseStripProps {
  autoplay?: boolean;
  initialFeature?: string;
}

export const PlusShowcaseStrip = ({
  autoplay = true,
  initialFeature = features[0].id,
}: PlusShowcaseStripProps): ReactElement => {
  const isReducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState(initialFeature);
  const [pinned, setPinned] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [inViewRef, inView] = useInView(0.4);
  const isPlaying = autoplay && inView && !pinned && !isReducedMotion;
  const feature = features.find((item) => item.id === selected) ?? features[0];

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const id = window.setTimeout(() => {
      setSelected((current) => {
        const index = features.findIndex((item) => item.id === current);
        return features[(index + 1) % features.length].id;
      });
    }, DWELL_MS);
    return () => window.clearTimeout(id);
  }, [isPlaying, selected]);

  // Keeps the active chip visible when the row scrolls (phones, tablets).
  useEffect(() => {
    const chips = chipsRef.current;
    const chip = chips?.querySelector<HTMLElement>(`[data-id="${selected}"]`);
    if (!chips || !chip || chips.scrollWidth <= chips.clientWidth) {
      return;
    }
    chips.scrollTo({
      left: chip.offsetLeft - 16,
      behavior: isReducedMotion ? 'auto' : 'smooth',
    });
  }, [selected, isReducedMotion]);

  const pick = (id: string) => {
    setPinned(true);
    setSelected(id);
  };

  return (
    <section
      ref={inViewRef as React.RefObject<HTMLElement>}
      aria-label="daily.dev Plus"
      className="pss pss-frame relative isolate overflow-hidden rounded-20 p-1.5"
    >
      <span
        aria-hidden
        className="pss-orb -left-24 -top-32 size-80 bg-accent-cabbage-default"
      />
      <span
        aria-hidden
        className="pss-orb pss-orb--delay -right-16 -top-24 size-72 bg-accent-onion-default"
      />
      <div className="pss-body pss-glass relative rounded-14 p-4">
        <span
          aria-hidden
          className="pss-topglow pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-14"
        />
        <div className="pss-head relative">
          <div className="pss-copy">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title2}
              bold
              className="pss-title text-balance"
            >
              Still scrolling? Upgrade the feed.
            </Typography>
          </div>
          <div className="pss-cta">
            <Button
              tag="a"
              href="/plus"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<DevPlusIcon secondary />}
            >
              Get Plus
            </Button>
            <span className="whitespace-nowrap text-text-tertiary tabular-nums typo-footnote">
              $7.49/mo, cancel anytime
            </span>
          </div>
        </div>
        <div className="pss-stage relative">
          <div
            ref={chipsRef}
            role="tablist"
            aria-label="Plus features"
            aria-orientation="vertical"
            className="pss-tabs"
          >
            {features.map((item) => {
              const active = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  data-id={item.id}
                  aria-selected={active}
                  aria-controls={`pss-panel-${item.id}`}
                  onClick={() => pick(item.id)}
                  className={classNames(
                    'pss-tab pss-chip relative shrink-0 overflow-hidden rounded-10 typo-footnote',
                    active
                      ? 'bg-surface-float text-text-primary'
                      : 'text-text-tertiary hover:bg-surface-hover hover:text-text-secondary',
                  )}
                >
                  <span
                    className={classNames(
                      'flex items-center gap-1.5',
                      active && 'font-bold',
                    )}
                  >
                    <item.Icon secondary={active} size={IconSize.Size16} />
                    {item.label}
                  </span>
                  {active && (
                    <span className="pss-tab-perk pl-[1.375rem] text-text-tertiary typo-caption1">
                      {item.perk}
                    </span>
                  )}
                  {active && isPlaying && (
                    <span
                      key={selected}
                      aria-hidden
                      className="pss-progress absolute inset-x-2.5 bottom-0 h-px bg-text-primary"
                      style={{ '--pss-dwell': `${DWELL_MS}ms` } as never}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="pss-perk-phone text-text-tertiary typo-footnote">
            {feature.perk}
          </p>
          <Window key={feature.id} id={feature.id}>
            <feature.Preview />
          </Window>
        </div>
      </div>
    </section>
  );
};
