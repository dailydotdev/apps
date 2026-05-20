import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import Logo, { LogoPosition } from '../../../components/Logo';
import { FooterLinks } from '../../../components/footer/FooterLinks';
import SignupDisclaimer from '../../../components/auth/SignupDisclaimer';
import { RootPortal } from '../../../components/tooltips/Portal';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { ArticleGrid } from '../../../components/cards/article/ArticleGrid';
import { ActiveFeedContext } from '../../../contexts/ActiveFeedContext';
import { ActiveFeedNameContext } from '../../../contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '../../../components/utilities';
import { RequestKey } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import { MOST_UPVOTED_FEED_QUERY } from '../../../graphql/feed';
import type { Post } from '../../../graphql/posts';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';

type AccentKey = 'cabbage' | 'water' | 'onion' | 'bacon' | 'cheese' | 'avocado';

const ACCENT_TEXT: Record<AccentKey, string> = {
  cabbage: 'text-accent-cabbage-default',
  water: 'text-accent-water-default',
  onion: 'text-accent-onion-default',
  bacon: 'text-accent-bacon-default',
  cheese: 'text-accent-cheese-default',
  avocado: 'text-accent-avocado-default',
};

const HERO_STYLES = `
.onb-bg {
  background:
    radial-gradient(ellipse 65% 50% at 15% 18%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 8%, transparent) 0%,
      transparent 65%),
    radial-gradient(ellipse 55% 45% at 88% 32%,
      color-mix(in srgb, var(--theme-accent-water-default) 7%, transparent) 0%,
      transparent 70%),
    var(--theme-background-default);
}
.onb-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(110px);
  mix-blend-mode: screen;
  pointer-events: none;
  opacity: 0.55;
  animation: onb-breathe 22s ease-in-out infinite;
}
.onb-orb--delay { animation-delay: -8s; }
@keyframes onb-breathe {
  0%, 100% { opacity: 0.48; }
  50% { opacity: 0.68; }
}
@media (prefers-reduced-motion: reduce) {
  .onb-orb { animation: none; opacity: 0.55; }
}
.onb-form-halo {
  background:
    radial-gradient(
      ellipse 78% 55% at 50% 92%,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.98) 20%,
      rgba(0, 0, 0, 0.9) 36%,
      rgba(0, 0, 0, 0.7) 52%,
      rgba(0, 0, 0, 0.4) 68%,
      rgba(0, 0, 0, 0.15) 82%,
      transparent 94%
    );
}
.onb-center-halo {
  background:
    radial-gradient(
      ellipse 55% 36% at 50% 54%,
      rgba(0, 0, 0, 0.96) 0%,
      rgba(0, 0, 0, 0.88) 22%,
      rgba(0, 0, 0, 0.68) 42%,
      rgba(0, 0, 0, 0.42) 60%,
      rgba(0, 0, 0, 0.18) 76%,
      transparent 92%
    );
}
.onb-bottom-vignette {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 32%,
    rgba(0, 0, 0, 0.45) 56%,
    rgba(0, 0, 0, 0.85) 78%,
    rgba(0, 0, 0, 1) 100%
  );
}
.onb-top-fade {
  background: linear-gradient(
    to bottom,
    rgba(8, 8, 12, 0.55) 0%,
    rgba(8, 8, 12, 0.12) 28%,
    transparent 44%
  );
}
.onb-headline { text-shadow: 0 2px 32px rgba(0, 0, 0, 0.95), 0 0 64px rgba(0, 0, 0, 0.6); }
.onb-grid-mask {
  -webkit-mask-image:
    radial-gradient(
      ellipse 78% 58% at 50% 95%,
      transparent 0%,
      transparent 16%,
      rgba(0, 0, 0, 0.45) 36%,
      rgba(0, 0, 0, 0.95) 62%,
      black 100%
    );
  mask-image:
    radial-gradient(
      ellipse 78% 58% at 50% 95%,
      transparent 0%,
      transparent 16%,
      rgba(0, 0, 0, 0.45) 36%,
      rgba(0, 0, 0, 0.95) 62%,
      black 100%
    );
}
.onb-cover-shade {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.35) 100%
  );
}
.onb-split-grid-mask {
  -webkit-mask-image:
    linear-gradient(
      to right,
      black 0%,
      black 55%,
      rgba(0, 0, 0, 0.75) 78%,
      transparent 100%
    );
  mask-image:
    linear-gradient(
      to right,
      black 0%,
      black 55%,
      rgba(0, 0, 0, 0.75) 78%,
      transparent 100%
    );
}
.onb-split-left-fade {
  background:
    linear-gradient(
      to right,
      transparent 0%,
      rgba(0, 0, 0, 0.25) 55%,
      rgba(0, 0, 0, 0.72) 82%,
      rgba(8, 8, 12, 1) 100%
    );
}
.onb-split-right-panel {
  background:
    radial-gradient(
      ellipse 90% 70% at 0% 40%,
      color-mix(in srgb, var(--theme-accent-water-default) 6%, transparent) 0%,
      transparent 55%
    ),
    var(--theme-background-default);
}
.onb-glow-cabbage { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-cabbage-default) 65%, transparent); }
.onb-glow-water { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-water-default) 65%, transparent); }
.onb-glow-onion { text-shadow: 0 0 28px color-mix(in srgb, var(--theme-accent-onion-default) 70%, transparent); }
.onb-glow-bacon { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-bacon-default) 65%, transparent); }
.onb-glow-cheese { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-cheese-default) 65%, transparent); }
.onb-glow-avocado { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-avocado-default) 65%, transparent); }
`;

// =============================================================
// Variant A — Cards: real daily.dev feed cards
// =============================================================

type FeedQueryResult = {
  page: { edges: Array<{ node: Post }> };
};

const noop = (): void => undefined;

const useExplorePosts = (): Post[] => {
  const { data } = useQuery({
    queryKey: ['onboarding-explore-feed'],
    queryFn: async () => {
      const res = await gqlClient.request<FeedQueryResult>(
        MOST_UPVOTED_FEED_QUERY,
        {
          first: 30,
          period: 7,
          loggedIn: false,
          supportedTypes: ['article', 'video:youtube'],
        },
      );
      return res.page.edges
        .map((edge) => edge.node)
        .filter((post): post is Post => !!post && !!post.id && !!post.title)
        .map((post) => ({ ...post, clickbaitTitleDetected: false }));
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
  return data ?? [];
};

const ExplorePostCard = ({ post }: { post: Post }): ReactElement => (
  <ErrorBoundary fallback={null}>
    <ArticleGrid
      post={post}
      onPostClick={noop}
      onPostAuxClick={noop}
      onUpvoteClick={noop}
      onDownvoteClick={noop}
      onCommentClick={noop}
      onBookmarkClick={noop}
      onShare={noop}
      onCopyLinkClick={noop}
      onReadArticleClick={noop}
    />
  </ErrorBoundary>
);

const CardsBackground = ({
  splitMode = false,
}: {
  splitMode?: boolean;
}): ReactElement => {
  const posts = useExplorePosts();
  return (
    <ActiveFeedContext.Provider
      value={{ items: [], queryKey: [RequestKey.FeedPreview] }}
    >
      <ActiveFeedNameContext.Provider
        value={{ feedName: SharedFeedPage.Popular }}
      >
        <div
          aria-hidden
          className={classNames(
            'pointer-events-none absolute select-none overflow-hidden opacity-[0.4] [&_*]:!pointer-events-none',
            splitMode
              ? 'onb-split-grid-mask inset-y-0 left-0 -z-1 w-full laptop:w-1/2'
              : 'onb-grid-mask inset-0 -z-1',
          )}
        >
          <div
            className={classNames(
              'grid auto-rows-min gap-8 px-10 pb-5 pt-10 tablet:px-14 tablet:pb-7 tablet:pt-14',
              splitMode
                ? 'grid-cols-2 laptop:grid-cols-2 laptopL:grid-cols-3'
                : 'grid-cols-2 laptop:grid-cols-3 laptopL:grid-cols-4 laptopXL:grid-cols-5 desktop:grid-cols-6',
            )}
          >
            {posts.map((post) => (
              <ExplorePostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </ActiveFeedNameContext.Provider>
    </ActiveFeedContext.Provider>
  );
};

// =============================================================
// Variant B — Tags: topic constellation
// =============================================================

type TagVariant = 'xs' | 'sm' | 'md' | 'lg';

type TagItem = {
  label: string;
  x: number;
  y: number;
  variant: TagVariant;
  accent?: AccentKey;
};

const TAGS: TagItem[] = [
  { label: 'TypeScript', x: 10, y: 11, variant: 'md', accent: 'water' },
  { label: 'React', x: 28, y: 6, variant: 'sm' },
  { label: 'AI', x: 50, y: 14, variant: 'lg', accent: 'onion' },
  { label: 'Next.js', x: 70, y: 7, variant: 'sm' },
  { label: 'Rust', x: 85, y: 13, variant: 'md', accent: 'bacon' },
  { label: 'Open Source', x: 6, y: 22, variant: 'xs' },
  { label: 'JavaScript', x: 35, y: 24, variant: 'sm' },
  { label: 'Vue', x: 60, y: 22, variant: 'xs' },
  { label: 'Python', x: 92, y: 24, variant: 'xs' },
  { label: 'WebAssembly', x: 18, y: 32, variant: 'xs' },
  { label: 'GraphQL', x: 40, y: 36, variant: 'sm' },
  { label: 'LLM', x: 72, y: 32, variant: 'sm', accent: 'cabbage' },
  { label: 'Svelte', x: 90, y: 36, variant: 'xs' },
  { label: 'Tailwind CSS', x: 8, y: 42, variant: 'sm' },
  { label: 'Node.js', x: 28, y: 46, variant: 'xs' },
  { label: 'Edge Computing', x: 58, y: 44, variant: 'sm' },
  { label: 'PostgreSQL', x: 80, y: 46, variant: 'xs' },
  { label: 'Docker', x: 12, y: 54, variant: 'xs' },
  { label: 'System Design', x: 36, y: 55, variant: 'md', accent: 'avocado' },
  { label: 'Architecture', x: 65, y: 56, variant: 'xs' },
  { label: 'Kubernetes', x: 92, y: 52, variant: 'xs' },
  { label: 'DevOps', x: 5, y: 64, variant: 'sm' },
  { label: 'Linux', x: 18, y: 72, variant: 'xs' },
  { label: 'Security', x: 90, y: 64, variant: 'sm' },
  { label: 'Performance', x: 78, y: 72, variant: 'xs' },
  { label: 'Indie Hacking', x: 6, y: 82, variant: 'xs' },
  { label: 'Startups', x: 14, y: 92, variant: 'sm' },
  { label: 'Remote', x: 92, y: 82, variant: 'xs' },
  { label: 'Serverless', x: 86, y: 92, variant: 'sm' },
];

const CONNECTIONS: Array<[number, number, number, number]> = [
  [10, 11, 28, 6],
  [50, 14, 72, 32],
  [85, 13, 18, 32],
  [36, 55, 65, 56],
  [5, 64, 12, 54],
  [40, 36, 80, 46],
];

const TAG_VARIANT_CLASSES: Record<TagVariant, string> = {
  xs: 'typo-caption1',
  sm: 'typo-footnote',
  md: 'typo-callout font-medium',
  lg: 'typo-title3 font-bold',
};

const TAG_NEUTRAL: Record<TagVariant, string> = {
  xs: 'text-white/25',
  sm: 'text-white/40',
  md: 'text-white/55',
  lg: 'text-white/70',
};

const ACCENT_GLOW: Record<AccentKey, string> = {
  cabbage: 'onb-glow-cabbage',
  water: 'onb-glow-water',
  onion: 'onb-glow-onion',
  bacon: 'onb-glow-bacon',
  cheese: 'onb-glow-cheese',
  avocado: 'onb-glow-avocado',
};

const ConstellationTag = ({ tag }: { tag: TagItem }): ReactElement => {
  const accentClasses = tag.accent
    ? `${ACCENT_TEXT[tag.accent]} ${ACCENT_GLOW[tag.accent]}`
    : TAG_NEUTRAL[tag.variant];
  return (
    <span
      className={classNames(
        'absolute whitespace-nowrap tracking-tight',
        TAG_VARIANT_CLASSES[tag.variant],
        accentClasses,
      )}
      style={{
        left: `${tag.x}%`,
        top: `${tag.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {tag.label}
    </span>
  );
};

const TagsBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    <svg
      className="absolute inset-0 h-full w-full text-white/[0.07]"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {CONNECTIONS.map(([x1, y1, x2, y2]) => (
        <line
          key={`${x1}-${y1}-${x2}-${y2}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="0.12"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
    {TAGS.map((tag) => (
      <ConstellationTag key={tag.label} tag={tag} />
    ))}
  </div>
);

// =============================================================
// Variant C — Desk: full-cover photo backdrop
// =============================================================

const DeskBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    <picture>
      <img
        src="/assets/onboarding-hero-desk.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
    </picture>
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, rgba(8,8,12,0.35) 0%, rgba(8,8,12,0.1) 30%, rgba(8,8,12,0.25) 60%, rgba(8,8,12,0.7) 100%)',
      }}
    />
  </div>
);

// =============================================================
// Variant registry & switcher
// =============================================================

type VariantId = 'cards' | 'tags' | 'desk' | 'split';

type VariantDef = {
  id: VariantId;
  label: string;
  render: () => ReactElement;
};

const VARIANTS: VariantDef[] = [
  { id: 'cards', label: 'Cards', render: () => <CardsBackground /> },
  { id: 'split', label: 'X', render: () => <CardsBackground splitMode /> },
  { id: 'tags', label: 'Tags', render: () => <TagsBackground /> },
  { id: 'desk', label: 'Desk', render: () => <DeskBackground /> },
];

const VARIANT_STORAGE_KEY = 'onb-hero-variant';
const VARIANT_IDS = new Set(VARIANTS.map((v) => v.id));

const isVariantId = (value: string | null): value is VariantId =>
  !!value && VARIANT_IDS.has(value as VariantId);

const readInitialVariant = (): VariantId => {
  if (typeof window === 'undefined') {
    return VARIANTS[0].id;
  }
  const fromUrl = new URLSearchParams(window.location.search).get('variant');
  if (isVariantId(fromUrl)) {
    return fromUrl;
  }
  const fromStorage = window.localStorage.getItem(VARIANT_STORAGE_KEY);
  if (isVariantId(fromStorage)) {
    return fromStorage;
  }
  return VARIANTS[0].id;
};

const VARIANT_SWITCHER_Z_INDEX = 9999;

const VariantSwitcher = ({
  value,
  onChange,
}: {
  value: VariantId;
  onChange: (next: VariantId) => void;
}): ReactElement => (
  <RootPortal>
    <div
      className="pointer-events-auto fixed left-4 right-4 top-4 flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-end gap-1 rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 p-1.5 shadow-2 tablet:left-auto tablet:right-6 tablet:top-6 tablet:max-w-[min(calc(100vw-3rem),28rem)]"
      role="radiogroup"
      aria-label="Background variant"
      style={{ zIndex: VARIANT_SWITCHER_Z_INDEX }}
    >
      <span className="shrink-0 px-2 text-text-quaternary typo-caption2">
        Variant
      </span>
      {VARIANTS.map((variant) => {
        const active = variant.id === value;
        return (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={(event) => {
              event.stopPropagation();
              onChange(variant.id);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className={classNames(
              'pointer-events-auto cursor-pointer rounded-full px-3 py-1 font-medium tracking-tight transition-colors typo-caption2',
              active
                ? 'bg-white/15 text-text-primary'
                : 'hover:bg-white/10 text-text-tertiary hover:text-text-primary',
            )}
          >
            {variant.label}
          </button>
        );
      })}
    </div>
  </RootPortal>
);

// =============================================================
// Main hero
// =============================================================

type Props = {
  children: ReactNode;
  isFormExpanded?: boolean;
  headline?: string | null;
};

const DEFAULT_HEADLINE = 'The homepage every developer deserves.';

export const OnboardingSignupHero = ({
  children,
  isFormExpanded = false,
  headline = DEFAULT_HEADLINE,
}: Props): ReactElement => {
  const { applyThemeMode } = useSettingsContext();
  const [variantId, setVariantId] = useState<VariantId>(VARIANTS[0].id);

  useEffect(() => {
    setVariantId(readInitialVariant());
  }, []);

  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(VARIANT_STORAGE_KEY, variantId);
  }, [variantId]);

  const activeVariant = VARIANTS.find((v) => v.id === variantId) ?? VARIANTS[0];
  const isSplitLayout = variantId === 'split';

  return (
    <div
      className={classNames(
        'onb-bg relative isolate flex min-h-dvh w-full overflow-hidden bg-raw-pepper-90 text-text-primary',
        isSplitLayout && 'laptop:flex-row',
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

      {activeVariant.render()}

      <div
        aria-hidden
        className={classNames(
          'pointer-events-none absolute -z-1 select-none',
          isSplitLayout ? 'inset-y-0 left-0 w-full laptop:w-1/2' : 'inset-0',
        )}
      >
        <span
          className="onb-orb bg-accent-cabbage-default"
          style={{
            width: '38rem',
            height: '38rem',
            top: '-10rem',
            left: '-8rem',
          }}
        />
        <span
          className="onb-orb onb-orb--delay bg-accent-water-default"
          style={{
            width: '32rem',
            height: '32rem',
            top: '18%',
            right: isSplitLayout ? '-4rem' : '-10rem',
          }}
        />
      </div>

      <div
        aria-hidden
        className="onb-top-fade pointer-events-none absolute inset-x-0 top-0 -z-1 h-40 laptop:hidden"
      />
      {!isSplitLayout && (
        <>
          <div
            aria-hidden
            className="onb-bottom-vignette pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[55vh]"
          />
          <div
            aria-hidden
            className="onb-center-halo pointer-events-none absolute inset-0 -z-1"
          />
          <div
            aria-hidden
            className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
          />
        </>
      )}
      {isSplitLayout && (
        <>
          <div
            aria-hidden
            className="onb-split-left-fade pointer-events-none absolute inset-y-0 left-0 -z-1 hidden w-1/2 laptop:block"
          />
          <div
            aria-hidden
            className="onb-bottom-vignette pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[55vh] laptop:hidden"
          />
          <div
            aria-hidden
            className="onb-form-halo pointer-events-none absolute inset-0 -z-1 laptop:hidden"
          />
        </>
      )}

      <VariantSwitcher value={variantId} onChange={setVariantId} />

      {isSplitLayout && (
        <div
          aria-hidden
          className="onb-split-right-panel pointer-events-none absolute inset-y-0 right-0 -z-1 hidden w-1/2 laptop:block"
        />
      )}

      <main
        className={classNames(
          'relative z-1 flex w-full flex-1 flex-col px-5 pt-10',
          isSplitLayout
            ? 'justify-end pb-[7.5rem] tablet:pb-[5.5rem] laptop:ml-auto laptop:w-1/2 laptop:items-start laptop:justify-center laptop:px-16 laptop:pb-12 laptop:pt-12'
            : 'items-center justify-end pb-[7.5rem] tablet:pb-[5.5rem] tablet:pt-14',
        )}
      >
        <div
          className={classNames(
            'flex w-full max-w-[340px] flex-col gap-6 tablet:gap-7',
            isSplitLayout && 'laptop:gap-8',
          )}
        >
          <Logo
            position={LogoPosition.Relative}
            className={classNames(
              '!left-0 !top-0 !mt-0 !translate-x-0',
              isSplitLayout ? 'self-center laptop:!self-start' : 'self-center',
            )}
            logoClassName={{ container: 'h-7' }}
          />

          {!isFormExpanded && headline && (
            <h1
              className={classNames(
                'onb-headline text-balance font-bold leading-[1.05] tracking-tight text-text-primary typo-title2 tablet:typo-mega3',
                isSplitLayout ? 'text-center laptop:text-left' : 'text-center',
              )}
            >
              {headline}
            </h1>
          )}

          {children}
        </div>
      </main>

      <div
        className={classNames(
          'pointer-events-auto z-1',
          isSplitLayout
            ? 'absolute inset-x-0 bottom-0 hidden flex-col items-start gap-3 px-5 pb-5 laptop:left-1/2 laptop:flex laptop:w-1/2 laptop:px-16 laptop:pb-6'
            : 'absolute inset-x-0 bottom-0 hidden items-end justify-between gap-6 px-6 pb-4 tablet:flex',
        )}
      >
        <div className="[&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-start">
          <FooterLinks />
        </div>
        <div
          className={classNames(
            isSplitLayout ? 'max-w-sm text-left' : 'max-w-sm text-right',
          )}
        >
          <SignupDisclaimer
            className={classNames(
              '!text-text-tertiary typo-caption1',
              !isSplitLayout && '!text-right',
            )}
          />
        </div>
      </div>

      <div
        className={classNames(
          'pointer-events-auto relative z-1 flex w-full flex-col items-center gap-4 px-5 pb-5',
          isSplitLayout ? 'laptop:hidden' : 'tablet:hidden',
        )}
      >
        <div className="[&_footer]:!pb-0 [&_ul]:!mb-0">
          <FooterLinks />
        </div>
        <SignupDisclaimer className="!text-text-tertiary typo-caption1" />
      </div>
    </div>
  );
};

export default OnboardingSignupHero;
