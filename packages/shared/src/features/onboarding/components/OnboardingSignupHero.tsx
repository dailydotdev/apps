import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import Logo, { LogoPosition } from '../../../components/Logo';
import { FooterLinks } from '../../../components/footer/FooterLinks';
import SignupDisclaimer from '../../../components/auth/SignupDisclaimer';
import type { AuthOptionsProps } from '../../../components/auth/common';
import { RootPortal } from '../../../components/tooltips/Portal';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { ArticleGrid } from '../../../components/cards/article/ArticleGrid';
import { ActiveFeedNameContext } from '../../../contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '../../../components/utilities';
import { gqlClient } from '../../../graphql/common';
import { MOST_UPVOTED_FEED_QUERY } from '../../../graphql/feed';
import type { Post } from '../../../graphql/posts';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';

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
.onb-split-left-water-glow {
  background:
    radial-gradient(
      ellipse 85% 65% at 18% 100%,
      color-mix(in srgb, var(--theme-accent-water-default) 14%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent-water-default) 5%, transparent) 42%,
      transparent 72%
    );
}
.onb-bg-split {
  background: var(--theme-background-default);
}
.onb-split-right-panel {
  background: var(--theme-background-default);
}
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
  const feedMaskClass = splitMode
    ? 'onb-split-grid-mask inset-0 -z-1'
    : 'onb-grid-mask inset-0 -z-1';

  return (
    <ActiveFeedNameContext.Provider
      value={{ feedName: SharedFeedPage.Popular }}
    >
      <div
        aria-hidden
        className={classNames(
          'pointer-events-none absolute select-none overflow-hidden opacity-[0.4] [&_*]:!pointer-events-none',
          feedMaskClass,
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
  );
};

// =============================================================
// Variant C — Desk: full-cover photo backdrop
// =============================================================

const DESK_HERO_SRC = '/assets/onboarding-hero-desk.webp';
const DESK_HERO_SRCSET = [
  '/assets/onboarding-hero-desk-1280.webp 1280w',
  '/assets/onboarding-hero-desk-1920.webp 1920w',
  '/assets/onboarding-hero-desk-2560.webp 2560w',
].join(', ');

const DeskBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    <picture>
      <source type="image/webp" srcSet={DESK_HERO_SRCSET} sizes="100vw" />
      <img
        src={DESK_HERO_SRC}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{
          imageRendering: 'auto',
          filter: 'contrast(1.05) saturate(1.05)',
        }}
        decoding="async"
        fetchPriority="high"
      />
    </picture>
  </div>
);

// =============================================================
// Variant registry & switcher
// =============================================================

type VariantId = 'cards' | 'desk' | 'split';

type VariantDef = {
  id: VariantId;
  label: string;
  render: () => ReactElement;
};

const VARIANTS: VariantDef[] = [
  { id: 'cards', label: 'Cards', render: () => <CardsBackground /> },
  { id: 'split', label: 'X', render: () => <CardsBackground splitMode /> },
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
const SIGNUP_CONTENT_MAX_W = 'max-w-[360px]';

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
  const isDeskVariant = variantId === 'desk';

  const signupForm =
    isSplitLayout && React.isValidElement<AuthOptionsProps>(children)
      ? React.cloneElement(children, { splitSignupStyle: true })
      : children;

  const splitSignupColumn = (
    <>
      <main className="relative flex flex-1 flex-col justify-end px-5 pb-[7.5rem] pt-10 tablet:pb-[5.5rem] laptop:justify-center laptop:px-16 laptop:pb-0 laptop:pt-0">
        <div
          className={classNames(
            'flex w-full flex-col gap-6 tablet:gap-7',
            SIGNUP_CONTENT_MAX_W,
            'laptop:items-start laptop:gap-8',
          )}
        >
          <Logo
            position={LogoPosition.Relative}
            className="!left-0 !top-0 !mt-0 !translate-x-0 self-center laptop:!self-start"
            logoClassName={{ container: 'h-7' }}
          />

          {!isFormExpanded && headline && (
            <h1 className="onb-headline text-balance text-center font-bold leading-[1.1] tracking-tight text-text-primary typo-title1 tablet:typo-large-title laptop:text-left">
              {headline}
            </h1>
          )}

          {signupForm}
        </div>
      </main>

      <div className="pointer-events-auto hidden w-full flex-col items-start gap-3 px-5 pb-5 laptop:flex laptop:px-16 laptop:pb-8">
        <div className="w-full [&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-start">
          <FooterLinks />
        </div>
        <SignupDisclaimer className="!w-full !text-left !text-text-tertiary typo-caption1" />
      </div>
    </>
  );

  return (
    <div
      className={classNames(
        'relative isolate flex min-h-dvh w-full overflow-hidden bg-raw-pepper-90 text-text-primary',
        isSplitLayout
          ? 'onb-bg-split flex-col laptop:grid laptop:grid-cols-2'
          : 'onb-bg',
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

      {!isSplitLayout && activeVariant.render()}

      {isSplitLayout && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-1 select-none laptop:hidden"
        >
          <CardsBackground splitMode />
          <div className="onb-bottom-vignette pointer-events-none absolute inset-x-0 bottom-0 h-[55vh]" />
          <div className="onb-form-halo pointer-events-none absolute inset-0" />
        </div>
      )}

      {isSplitLayout && (
        <div className="relative hidden min-h-dvh overflow-hidden laptop:col-start-1 laptop:row-start-1 laptop:block">
          <div
            aria-hidden
            className="onb-split-left-water-glow pointer-events-none absolute inset-0 -z-2"
          />
          <CardsBackground splitMode />
          <div
            aria-hidden
            className="onb-split-left-fade pointer-events-none absolute inset-0 -z-1"
          />
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
            aria-hidden
            className="onb-orb onb-orb--delay bg-accent-water-default"
            style={{
              width: '32rem',
              height: '32rem',
              bottom: '-8rem',
              left: '5%',
              top: 'auto',
              right: 'auto',
            }}
          />
        </div>
      )}

      {!isSplitLayout && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-1 select-none"
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
              right: '-10rem',
            }}
          />
        </div>
      )}

      {!isSplitLayout && (
        <>
          <div
            aria-hidden
            className="onb-bottom-vignette pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[55vh]"
          />
          <div
            aria-hidden
            className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
          />
        </>
      )}

      <div
        aria-hidden
        className="onb-top-fade pointer-events-none absolute inset-x-0 top-0 -z-1 h-40 laptop:hidden"
      />
      {!isSplitLayout && (
        <div
          aria-hidden
          className="onb-center-halo pointer-events-none absolute inset-0 -z-1"
        />
      )}

      <VariantSwitcher value={variantId} onChange={setVariantId} />

      {isSplitLayout ? (
        <div className="relative z-1 flex min-h-dvh flex-1 flex-col laptop:col-start-2 laptop:row-start-1 laptop:min-w-0">
          <div
            aria-hidden
            className="onb-split-right-panel pointer-events-none absolute inset-0 -z-1 hidden laptop:block"
          />
          {splitSignupColumn}
        </div>
      ) : (
        <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-end px-5 pb-[7.5rem] pt-10 tablet:pb-[5.5rem] tablet:pt-14">
          <div
            className={classNames(
              'flex w-full flex-col gap-6 tablet:gap-7',
              SIGNUP_CONTENT_MAX_W,
            )}
          >
            <Logo
              position={LogoPosition.Relative}
              className="!left-0 !top-0 !mt-0 !translate-x-0 self-center"
              logoClassName={{ container: 'h-7' }}
            />

            {!isFormExpanded && headline && (
              <h1 className="onb-headline text-balance text-center font-bold leading-[1.1] tracking-tight text-text-primary typo-title1 tablet:typo-large-title">
                {headline}
              </h1>
            )}

            {signupForm}
          </div>
        </main>
      )}

      {!isSplitLayout && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-1 hidden items-end justify-between gap-6 px-6 pb-4 tablet:flex">
          {isDeskVariant ? (
            <>
              <div className="max-w-sm text-left">
                <SignupDisclaimer className="!text-left !text-text-tertiary typo-caption1" />
              </div>
              <div className="[&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-end">
                <FooterLinks />
              </div>
            </>
          ) : (
            <>
              <div className="[&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-start">
                <FooterLinks />
              </div>
              <div className="max-w-sm text-right">
                <SignupDisclaimer className="!text-right !text-text-tertiary typo-caption1" />
              </div>
            </>
          )}
        </div>
      )}

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
