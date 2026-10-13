import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
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
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { PostTypeToGridCard } from '@dailydotdev/shared/src/components/cards/common/gridCards';
import { AdGrid } from '@dailydotdev/shared/src/components/cards/ad/AdGrid';
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

const MINIATURE_SCALE = 0.45;

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
  width: calc(100% / ${MINIATURE_SCALE});
  height: calc(100% / ${MINIATURE_SCALE});
  transform: scale(${MINIATURE_SCALE});
  transform-origin: top left;
  pointer-events: none;
}
.pss-slot {
  flex-shrink: 0;
  width: 19rem;
  padding-right: 1rem;
  overflow: hidden;
  transition: width 560ms cubic-bezier(0.16, 1, 0.3, 1), padding 560ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms ease-out;
}
.pss-slot--gone { width: 0; padding-right: 0; opacity: 0; }

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
.pss-window { position: relative; height: 12.5rem; overflow: hidden; }
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
  .pss-window { flex: 1 1 0%; height: auto; min-height: 13.5rem; }
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
  .pss-window { flex: none; width: 26rem; min-height: 0; border-width: 0 0 0 1px; border-radius: 0 0.875rem 0.875rem 0; }
}
@container (min-width: 1400px) {
  .pss-window { width: 32rem; }
}
@keyframes pss-progress-y {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
@media (prefers-reduced-motion: reduce) {
  .pss-orb { animation: none; }
  .pss-progress { animation: none; transform: scaleX(1); }
  .pss-slot { transition: none; }
}
`;

const DWELL_MS = 4200;
const REVEAL_MS = 900;

type PreviewProps = { active: boolean };

type Feature = {
  id: string;
  label: string;
  perk: string;
  Icon: ComponentType<IconProps>;
  Preview: ComponentType<PreviewProps>;
};

const useReveal = (active: boolean): boolean => {
  const isReducedMotion = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(isReducedMotion);

  useEffect(() => {
    if (!active) {
      setRevealed(isReducedMotion);
      return undefined;
    }
    if (isReducedMotion) {
      setRevealed(true);
      return undefined;
    }
    const id = window.setTimeout(() => setRevealed(true), REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [active, isReducedMotion]);

  return revealed;
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
  readTime: 3,
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

/* The miniature: production components at their real size, scaled down. */

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

const FeedCard = ({ post }: { post: Post }): ReactElement => {
  const Card = PostTypeToGridCard[post.type] ?? ArticleGrid;
  return <Card post={post} {...cardHandlers} />;
};

const Slot = ({
  gone = false,
  enter = false,
  children,
}: {
  gone?: boolean;
  enter?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div className={classNames('pss-slot', gone && 'pss-slot--gone')}>
    <div className={classNames('w-72', enter && 'plus-perk-in')}>
      {children}
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
    <div key={id} aria-hidden className="plus-perk-in absolute inset-0">
      <div className="pss-mini">{children}</div>
    </div>
  </div>
);

const Row = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex p-4">{children}</div>
);

const AdFreePreview = ({ active }: PreviewProps): ReactElement => {
  const gone = useReveal(active);
  return (
    <Row>
      <Slot>
        <FeedCard post={posts.nextjs} />
      </Slot>
      <Slot gone={gone}>
        <AdGrid ad={sampleAd} index={1} feedIndex={1} />
      </Slot>
      <Slot>
        <FeedCard post={posts.llm} />
      </Slot>
      <Slot>
        <FeedCard post={posts.tanstack} />
      </Slot>
      <Slot>
        <FeedCard post={posts.booking} />
      </Slot>
    </Row>
  );
};

const CleanTitlesPreview = ({ active }: PreviewProps): ReactElement => {
  const clean = useReveal(active);
  return (
    <Row>
      <Slot key={clean ? 'clean' : 'bait'} enter={clean}>
        <FeedCard post={clean ? cleanTitle : posts.devopsDay2} />
      </Slot>
      <Slot>
        <FeedCard post={posts.readCode} />
      </Slot>
      <Slot>
        <FeedCard post={posts.csharp} />
      </Slot>
      <Slot>
        <FeedCard post={posts.queue} />
      </Slot>
    </Row>
  );
};

const mixedFeed = [posts.nextjs, posts.bored, posts.csharp, posts.booking];
const aiCodingFeed = [posts.llm, posts.readCode, posts.nuget, posts.rustGoogle];

const CustomFeedsPreview = ({ active }: PreviewProps): ReactElement => {
  const filtered = useReveal(active);
  const feed = filtered ? aiCodingFeed : mixedFeed;
  return (
    <Row>
      {feed.map((post) => (
        <Slot key={post.id} enter={filtered}>
          <FeedCard post={post} />
        </Slot>
      ))}
    </Row>
  );
};

const KeywordsPreview = ({ active }: PreviewProps): ReactElement => {
  const gone = useReveal(active);
  return (
    <Row>
      <Slot>
        <FeedCard post={posts.rustMicrosoft} />
      </Slot>
      <Slot gone={gone}>
        <FeedCard post={posts.pewdiepie} />
      </Slot>
      <Slot>
        <FeedCard post={posts.queue} />
      </Slot>
      <Slot>
        <FeedCard post={posts.csharp} />
      </Slot>
      <Slot>
        <FeedCard post={posts.nextjs} />
      </Slot>
    </Row>
  );
};

const foldersKey = generateQueryKey(RequestKey.BookmarkFolders);
const savedPosts = [posts.llm, posts.rustMicrosoft, posts.queue].map(
  (post) => ({ ...post, bookmarked: true } as Post),
);

const FoldersPreview = ({ active }: PreviewProps): ReactElement => {
  const sorted = useReveal(active);
  const queryClient = useQueryClient();
  useState(() => queryClient.setQueryData(foldersKey, []));

  useLayoutEffect(() => {
    queryClient.setQueryData(foldersKey, sorted ? sampleFolders : []);
  }, [queryClient, sorted]);

  return (
    <div className="flex p-4">
      <div className="mr-4 w-60 shrink-0">
        <BookmarkSection
          isItemsButton={false}
          sidebarExpanded
          shouldShowLabel
          activePage=""
        />
      </div>
      {savedPosts.map((post) => (
        <Slot key={post.id}>
          <FeedCard post={post} />
        </Slot>
      ))}
    </div>
  );
};

const BriefingPreview = ({ active }: PreviewProps): ReactElement => {
  const arrived = useReveal(active);
  return (
    <Row>
      <Slot gone={!arrived}>
        <div className="flex h-card">
          <BriefCardReady
            post={briefPost}
            title="Brief is ready!"
            targetId={TargetId.Feed}
          />
        </div>
      </Slot>
      <Slot>
        <FeedCard post={posts.nextjs} />
      </Slot>
      <Slot>
        <FeedCard post={posts.rustMicrosoft} />
      </Slot>
      <Slot>
        <FeedCard post={posts.llm} />
      </Slot>
      <Slot>
        <FeedCard post={posts.tanstack} />
      </Slot>
    </Row>
  );
};

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
          <Window id={feature.id}>
            <feature.Preview active />
          </Window>
        </div>
      </div>
    </section>
  );
};
