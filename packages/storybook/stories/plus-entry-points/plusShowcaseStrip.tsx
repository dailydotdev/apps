import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { GenericTagButton } from '@dailydotdev/shared/src/components/filters/TagButton';
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
.pss-row {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 640ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms ease-out;
}
.pss-row > div { min-height: 0; overflow: hidden; padding: 0.5rem 0.5rem 0.25rem; }
.pss-row--gone { grid-template-rows: 0fr; opacity: 0; }
.pss-markable {
  border-radius: 1rem;
  outline: 3px solid transparent;
  outline-offset: 4px;
  transition: outline-color 320ms ease-out;
}
.pss-mark { outline-color: color-mix(in srgb, var(--theme-text-primary) 72%, transparent); }

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
.pss-window { --pss-scale: 0.5; position: relative; display: flex; flex-direction: column; height: 15rem; overflow: hidden; }
@container (max-width: 419px) {
  .pss-title { font-size: 1.25rem; line-height: 1.625rem; }
}
@container (min-width: 600px) {
  .pss-head { flex-direction: row; align-items: center; justify-content: space-between; gap: 1.5rem; }
  .pss-cta { flex-wrap: nowrap; flex-shrink: 0; }
  .pss-stage { flex-direction: row; align-items: stretch; gap: 1rem; }
  .pss-tabs { flex-direction: column; flex-shrink: 0; width: 11.5rem; gap: 0.125rem; overflow: visible; margin: 0; padding: 0; }
  .pss-tab { height: 2rem; padding: 0 0.625rem; }
  .pss-window { --pss-scale: 0.58; flex: 1 1 0%; height: auto; min-height: 13.5rem; }
  .pss-progress { inset: 0.5rem auto 0.5rem 0; width: 2px; height: auto; transform-origin: top center; animation-name: pss-progress-y; }
}
@container (min-width: 1000px) {
  .pss-body {
    display: grid;
    grid-template-columns: minmax(14rem, 1fr) auto;
    gap: 1.5rem;
    padding: 0 0 0 1.25rem;
    min-height: 15.5rem;
  }
  .pss-head { flex-direction: column; align-items: stretch; justify-content: center; gap: 1rem; padding: 1rem 0; }
  .pss-copy { flex: 0 0 auto; }
  .pss-cta { flex-wrap: wrap; }
  .pss-tabs { justify-content: center; padding: 1rem 0; }
  .pss-window { --pss-scale: 0.62; flex: none; width: 30rem; min-height: 0; border-width: 0 0 0 1px; border-radius: 0 0.875rem 0.875rem 0; }
}
@container (min-width: 1400px) {
  .pss-window { width: 36rem; }
}
@keyframes pss-progress-y {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
@media (prefers-reduced-motion: reduce) {
  .pss-row, .pss-markable { transition: none; }
  .pss-orb { animation: none; }
  .pss-progress { animation: none; transform: scaleX(1); }
}
`;

const DWELL_MS = 4200;

// Steps through a vignette: returns how many of the given moments (ms after
// mount) have passed. Reduced motion jumps straight to the end state.
const useTimeline = (moments: number[]): number => {
  const isReducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(isReducedMotion ? moments.length : 0);
  const key = moments.join(',');

  useEffect(() => {
    const times = key.split(',').map(Number);
    if (isReducedMotion) {
      setStep(times.length);
      return undefined;
    }
    const ids = times.map((ms, index) =>
      window.setTimeout(() => setStep(index + 1), ms),
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [key, isReducedMotion]);

  return step;
};

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

/* Each illustration is one short scene built from production components at
   their real size, scaled down: the item Plus is about to change gets
   outlined, then the change happens in place. */

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

const FeedRow = ({ post }: { post: Post }): ReactElement => {
  const Card = PostTypeToListCard[post.type] ?? ArticleList;
  return (
    <div className="overflow-hidden rounded-16">
      <Card post={post} {...cardHandlers} />
    </div>
  );
};

const Row = ({
  gone = false,
  marked = false,
  children,
}: {
  gone?: boolean;
  marked?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div className={classNames('pss-row', gone && 'pss-row--gone')}>
    <div>
      <div className={classNames('pss-markable', marked && 'pss-mark')}>
        {children}
      </div>
    </div>
  </div>
);

const Stage = ({
  scale,
  children,
}: {
  scale?: number;
  children: ReactNode;
}): ReactElement => (
  <div
    className="relative min-h-0 flex-1 overflow-hidden"
    style={scale ? ({ '--pss-scale': scale } as never) : undefined}
  >
    <div className="pss-mini">
      <div className="mx-auto flex max-w-[40rem] flex-col px-3 pt-3">
        {children}
      </div>
    </div>
  </div>
);

const Window = ({
  id,
  perk,
  children,
}: {
  id: string;
  perk: string;
  children: ReactNode;
}): ReactElement => (
  <div
    id={`pss-panel-${id}`}
    role="tabpanel"
    className="pss-window rounded-12 border border-border-subtlest-tertiary bg-background-default"
  >
    <div className="flex h-8 shrink-0 items-center border-b border-border-subtlest-tertiary px-3">
      <span className="truncate font-bold text-text-primary typo-footnote">
        {perk}
      </span>
    </div>
    {children}
  </div>
);

const AdFreePreview = (): ReactElement => {
  const step = useTimeline([700, 1700]);
  return (
    <Stage>
      <Row marked={step === 1} gone={step >= 2}>
        <AdList ad={sampleAd} index={1} feedIndex={1} />
      </Row>
      <Row>
        <FeedRow post={posts.nextjs} />
      </Row>
      <Row>
        <FeedRow post={posts.llm} />
      </Row>
    </Stage>
  );
};

const CleanTitlesPreview = (): ReactElement => {
  const step = useTimeline([700, 1600]);
  const clean = step >= 2;
  return (
    <Stage>
      <Row marked={step >= 1}>
        <div
          key={clean ? 'clean' : 'bait'}
          className={clean ? 'plus-perk-in' : ''}
        >
          <FeedRow post={clean ? cleanTitle : posts.devopsDay2} />
        </div>
      </Row>
      <Row>
        <FeedRow post={posts.readCode} />
      </Row>
    </Stage>
  );
};

const FeedTab = ({
  active = false,
  marked = false,
  children,
}: {
  active?: boolean;
  marked?: boolean;
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'pss-markable flex h-10 items-center gap-2 rounded-12 px-4 font-bold typo-callout',
      active ? 'bg-surface-float text-text-primary' : 'text-text-tertiary',
      marked && 'pss-mark',
    )}
  >
    <HashtagIcon size={IconSize.Small} />
    {children}
  </span>
);

const mixedFeed = [posts.bored, posts.csharp, posts.booking];
const aiCodingFeed = [posts.llm, posts.readCode, posts.nuget];

const CustomFeedsPreview = (): ReactElement => {
  const step = useTimeline([700, 1700]);
  const filtered = step >= 2;
  const feed = filtered ? aiCodingFeed : mixedFeed;
  return (
    <Stage>
      <div className="flex items-center gap-2 px-2 pb-2 pt-1">
        <FeedTab active={!filtered}>My feed</FeedTab>
        {step >= 1 && (
          <span className="plus-perk-in">
            <FeedTab active={filtered} marked={step === 1}>
              AI coding
            </FeedTab>
          </span>
        )}
      </div>
      {feed.map((post, index) => (
        <div
          key={post.id}
          className={filtered ? 'plus-perk-in' : ''}
          style={filtered ? { animationDelay: `${index * 90}ms` } : undefined}
        >
          <Row>
            <FeedRow post={post} />
          </Row>
        </div>
      ))}
    </Stage>
  );
};

const KeywordsPreview = (): ReactElement => {
  const step = useTimeline([600, 1200, 2000]);
  return (
    <Stage>
      <div className="flex min-h-12 items-center gap-3 px-3 pb-2 pt-1">
        <span className="text-text-tertiary typo-callout">Muted words</span>
        {step >= 1 && (
          <span className="plus-perk-in">
            <GenericTagButton
              tagItem="Big AI"
              showHashtag={false}
              className="group btn-tagBlocked"
              icon={<BlockIcon className="ml-2 text-xl" />}
              action={noop}
            />
          </span>
        )}
      </div>
      <Row marked={step === 2} gone={step >= 3}>
        <FeedRow post={posts.pewdiepie} />
      </Row>
      <Row>
        <FeedRow post={posts.rustMicrosoft} />
      </Row>
      <Row>
        <FeedRow post={posts.queue} />
      </Row>
    </Stage>
  );
};

const foldersKey = generateQueryKey(RequestKey.BookmarkFolders);

// A query cache of its own, so the sidebar shows exactly the folders passed.
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

  useLayoutEffect(() => {
    client.setQueryData(foldersKey, folders);
  }, [client, folders]);

  return (
    <QueryClientProvider client={client}>
      <BookmarkSection
        isItemsButton={false}
        sidebarExpanded
        shouldShowLabel
        activePage=""
      />
    </QueryClientProvider>
  );
};

const visibleFolders = sampleFolders
  .map((_, index) => sampleFolders.slice(0, index))
  .concat([sampleFolders]);

const FoldersPreview = (): ReactElement => {
  const shown = useTimeline([800, 1050, 1300, 1550]);
  return (
    <Stage scale={0.8}>
      <div className="mx-auto w-64">
        <SidebarWithFolders folders={visibleFolders[shown]} />
      </div>
    </Stage>
  );
};

const BriefingPreview = (): ReactElement => {
  const arrived = useTimeline([900]) >= 1;
  return (
    <Stage>
      <Row gone={!arrived} marked={arrived}>
        <div className="flex h-[21rem]">
          <BriefCardReady
            post={briefPost}
            title="Brief is ready!"
            targetId={TargetId.Feed}
          />
        </div>
      </Row>
      <Row>
        <FeedRow post={posts.nextjs} />
      </Row>
      <Row>
        <FeedRow post={posts.rustMicrosoft} />
      </Row>
    </Stage>
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
              className="pss-title"
            >
              <span className="block">Still scrolling?</span>
              <span className="block">Upgrade the feed.</span>
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
          <Window key={feature.id} id={feature.id} perk={feature.perk}>
            <feature.Preview />
          </Window>
        </div>
      </div>
    </section>
  );
};
