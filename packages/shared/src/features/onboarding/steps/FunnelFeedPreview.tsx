import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import type { FunnelStepFeedPreview } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import Feed from '../../../components/Feed';
import { ANONYMOUS_FEED_QUERY, RankingAlgorithm } from '../../../graphql/feed';
import { OtherFeedPage } from '../../../lib/query';
import { FeedLayoutProvider } from '../../../contexts/FeedContext';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import { ButtonSize } from '../../../components/buttons/common';
import Logo, { LogoPosition } from '../../../components/Logo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import {
  MoveToIcon,
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
  SparkleIcon,
} from '../../../components/icons';
import { useConditionalFeature } from '../../../hooks';
import { popularFeedVersion } from '../../../lib/featureManagement';

// ─── Scroll phase thresholds ───────────────────────────────────────
const PHASE = {
  heroFadeEnd: 200,
  valueStart: 400,
  valueEnd: 700,
  ctaStart: 500,
} as const;

// ─── Value propositions ────────────────────────────────────────────
const VALUE_PROPS = [
  {
    icon: 'upvote' as const,
    title: 'Community-ranked',
    desc: 'Every post is voted on by developers like you',
  },
  {
    icon: 'discuss' as const,
    title: 'Real conversations',
    desc: 'Not just links — genuine developer discussions',
  },
  {
    icon: 'bookmark' as const,
    title: 'Your reading list',
    desc: "Save what matters, skip what doesn't",
  },
];

// ─── Hook: window-level scroll tracking ────────────────────────────
function useWindowScroll() {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const heroOpacity = useMemo(() => {
    if (scrollY >= PHASE.heroFadeEnd) {
      return 0;
    }
    return 1 - scrollY / PHASE.heroFadeEnd;
  }, [scrollY]);

  const valueProgress = useMemo(() => {
    if (scrollY <= PHASE.valueStart) {
      return 0;
    }
    if (scrollY >= PHASE.valueEnd) {
      return 1;
    }
    return (scrollY - PHASE.valueStart) / (PHASE.valueEnd - PHASE.valueStart);
  }, [scrollY]);

  const showCta = scrollY >= PHASE.ctaStart;
  const hasScrolled = scrollY > 20;

  return { scrollY, heroOpacity, valueProgress, showCta, hasScrolled };
}

// ─── Portal wrapper for fixed elements ────────────────────────────
// The parent onboarding wrapper applies CSS transform (translate-y-0)
// which creates a new containing block, breaking fixed positioning.
// We portal fixed elements to document.body to bypass this.
function FixedPortal({
  children,
}: {
  children: React.ReactNode;
}): ReactElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  return ReactDOM.createPortal(children, document.body);
}

// ─── Interaction prompt ────────────────────────────────────────────
// Always mounted to avoid animation/mount timing issues. Visibility
// controlled via CSS opacity + pointer-events. Inline styles used for
// background to bypass CSS-variable opacity modifier issues.
function InteractionPrompt({
  visible,
  onPersonalize,
}: {
  visible: boolean;
  onPersonalize: () => void;
}): ReactElement {
  return (
    <FixedPortal>
      <div
        className="fixed inset-x-0 bottom-44 z-modal mx-auto flex w-fit items-center gap-3 rounded-16 border border-accent-cabbage-default/30 py-3 pl-4 pr-3 shadow-2 transition-all duration-300"
        style={{
          backgroundColor: '#1c1f26',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <SparkleIcon className="size-5 text-accent-cabbage-default" />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          Create a free account to interact
        </Typography>
        <button
          type="button"
          onClick={onPersonalize}
          className="ml-1 rounded-12 bg-accent-cabbage-default px-3 py-1.5 font-bold text-white transition-all duration-200 typo-caption1 hover:shadow-2-cabbage"
        >
          Get started
        </button>
      </div>
    </FixedPortal>
  );
}

// ─── Value chip (stagger-revealed) ─────────────────────────────────
function ValueChip({
  icon,
  title,
  desc,
  progress,
  index,
}: {
  icon: 'upvote' | 'discuss' | 'bookmark';
  title: string;
  desc: string;
  progress: number;
  index: number;
}): ReactElement {
  const stagger = Math.max(0, Math.min(1, progress * 3 - index));

  const iconMap = {
    upvote: <UpvoteIcon className="size-5 text-accent-avocado-default" />,
    discuss: <DiscussIcon className="size-5 text-accent-blueCheese-default" />,
    bookmark: <BookmarkIcon className="size-5 text-accent-cheese-default" />,
  };

  const bgMap = {
    upvote: 'bg-accent-avocado-default/15',
    discuss: 'bg-accent-blueCheese-default/15',
    bookmark: 'bg-accent-cheese-default/15',
  };

  return (
    <div
      className="flex items-start gap-3 transition-all duration-500"
      style={{
        opacity: stagger,
        transform: `translateY(${stagger > 0 ? 0 : 12}px)`,
      }}
    >
      <div
        className={classNames(
          'flex size-10 flex-shrink-0 items-center justify-center rounded-12',
          bgMap[icon],
        )}
      >
        {iconMap[icon]}
      </div>
      <div className="flex flex-col gap-0.5">
        <Typography type={TypographyType.Callout} bold>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {desc}
        </Typography>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────
function FeedPreviewComponent({
  onTransition,
}: FunnelStepFeedPreview): ReactElement {
  const { value: feedVersion } = useConditionalFeature({
    feature: popularFeedVersion,
    shouldEvaluate: true,
  });

  const feedVariables = {
    ranking: RankingAlgorithm.Popularity,
    version: feedVersion,
  };

  const { heroOpacity, valueProgress, showCta, hasScrolled } =
    useWindowScroll();

  const [showPrompt, setShowPrompt] = useState(false);
  const promptTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handlePersonalize = useCallback(() => {
    onTransition({ type: FunnelStepTransitionType.Complete });
  }, [onTransition]);

  const triggerPrompt = useCallback(() => {
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
    }
    setShowPrompt(true);
    promptTimerRef.current = setTimeout(() => setShowPrompt(false), 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
    };
  }, []);

  // Intercept clicks on feed action buttons and card links. We attach a
  // native capture-phase listener on `document` so it fires BEFORE React's
  // root listener (which is on the app container). This is the only reliable
  // way to prevent React's synthetic onClick handlers from executing.
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feedEl = feedRef.current;
    if (!feedEl) {
      return undefined;
    }

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Only intercept clicks inside our feed wrapper
      if (!feedEl.contains(target)) {
        return;
      }

      // Intercept action buttons (upvote, downvote, bookmark, comment, copy)
      const actionBtn = target.closest(
        '[id*="upvote-btn"], [id*="downvote-btn"], [id*="bookmark-btn"], [id*="comment-btn"], [id="copy-post-btn"]',
      );
      if (actionBtn) {
        e.preventDefault();
        e.stopImmediatePropagation();
        triggerPrompt();
        return;
      }

      // Intercept post card clicks (the overlay link that navigates to post)
      const cardLink = target.closest('a[href*="/posts/"]');
      if (cardLink) {
        e.preventDefault();
        e.stopImmediatePropagation();
        triggerPrompt();
      }
    };

    document.addEventListener('click', handler, true);
    return () => {
      document.removeEventListener('click', handler, true);
    };
  }, [triggerPrompt]);

  const topBarVisible = heroOpacity < 0.3;

  return (
    <div
      className="relative flex flex-1 flex-col"
      data-testid="funnel-feed-preview"
    >
      {/* ─── Ambient glow (decorative depth) ─── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="bg-accent-cabbage-default/10 absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl"
          style={{
            transform: `translateY(${hasScrolled ? -40 : 0}px)`,
            transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        <div
          className="bg-accent-onion-default/8 absolute -right-24 top-1/4 h-80 w-80 rounded-full blur-3xl"
          style={{
            transform: `translateY(${hasScrolled ? -20 : 0}px)`,
            transition: 'transform 2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* ─── Top bar (fixed, appears on scroll) ─── */}
      <FixedPortal>
        <div
          className={classNames(
            'fixed left-0 right-0 top-0 z-popup',
            'flex items-center justify-between px-4 py-3',
            'bg-background-default/80 backdrop-blur-xl',
            'transition-all duration-500',
          )}
          style={{
            opacity: topBarVisible ? 1 : 0,
            transform: topBarVisible ? 'translateY(0)' : 'translateY(-8px)',
            pointerEvents: topBarVisible ? 'auto' : 'none',
          }}
        >
          <Logo
            linkDisabled
            position={LogoPosition.Empty}
            logoClassName={{ container: 'h-6' }}
          />
          <button
            type="button"
            className="bg-accent-cabbage-default/10 hover:bg-accent-cabbage-default/20 group flex items-center gap-1.5 rounded-12 px-3 py-1.5 transition-all duration-200"
            onClick={handlePersonalize}
          >
            <SparkleIcon className="size-4 text-accent-cabbage-default transition-transform duration-200 group-hover:rotate-12" />
            <Typography
              type={TypographyType.Caption1}
              bold
              className="text-accent-cabbage-default"
            >
              Personalize
            </Typography>
          </button>
        </div>
      </FixedPortal>

      {/* ─── Hero section (fades on scroll) ─── */}
      <div
        className="relative z-1 flex flex-col items-center px-6 pb-6 pt-10"
        style={{
          opacity: heroOpacity,
          transform: `translateY(${(1 - heroOpacity) * -20}px)`,
          transition: 'transform 0.1s linear',
          pointerEvents: heroOpacity < 0.1 ? 'none' : 'auto',
        }}
      >
        <div className="flex flex-col items-center gap-5">
          <Logo
            linkDisabled
            position={LogoPosition.Empty}
            logoClassName={{ container: 'h-8' }}
          />

          <div className="max-w-sm text-center">
            <Typography type={TypographyType.Title1} bold>
              <span className="bg-gradient-to-r from-text-primary via-accent-cabbage-bolder to-accent-onion-default bg-clip-text text-transparent">
                Developer news
              </span>
            </Typography>
            <Typography type={TypographyType.Title1} bold>
              worth reading
            </Typography>
          </div>

          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="max-w-xs text-center"
          >
            Ranked by 1M+ developers. Personalized for you.
          </Typography>

          <div className="mt-2 flex animate-float flex-col items-center gap-1">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
            >
              Scroll to explore
            </Typography>
            <svg
              className="size-5 text-text-quaternary"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10 4v12m0 0l-4-4m4 4l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Feed (the product IS the demo) ─── */}
      <div ref={feedRef} className="relative" role="presentation">
        <FeedLayoutProvider>
          <Feed
            className="px-4"
            feedName={OtherFeedPage.Preview}
            feedQueryKey={['onboarding-preview', 'onboarding-mockup']}
            query={ANONYMOUS_FEED_QUERY}
            variables={feedVariables}
            showSearch={false}
            disableAds
            allowFetchMore={false}
          />
        </FeedLayoutProvider>
      </div>

      {/* ─── Value reveal (scroll-driven, between feed and spacer) ─── */}
      <div
        className="relative z-1 mx-auto w-full max-w-sm px-4 py-8"
        style={{
          opacity: Math.min(valueProgress * 2, 1),
          transform: `translateY(${
            (1 - Math.min(valueProgress * 2, 1)) * 24
          }px)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <div className="border-border-subtlest-tertiary/50 bg-background-default/90 rounded-16 border p-5 shadow-2 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <SparkleIcon className="size-4 text-accent-cabbage-default" />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              bold
              className="uppercase tracking-wider"
            >
              Why daily.dev
            </Typography>
          </div>
          <div className="flex flex-col gap-4">
            {VALUE_PROPS.map((prop, i) => (
              <ValueChip
                key={prop.title}
                icon={prop.icon}
                title={prop.title}
                desc={prop.desc}
                progress={valueProgress}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom spacer for CTA */}
      <div className="h-32" />

      {/* ─── Bottom gradient ─── */}
      <FixedPortal>
        <div className="via-background-default/80 pointer-events-none fixed inset-x-0 bottom-0 z-3 h-40 bg-gradient-to-t from-background-default to-transparent" />
      </FixedPortal>

      {/* ─── Sticky CTA (scroll-revealed) ─── */}
      <FixedPortal>
        <div
          className={classNames(
            'fixed inset-x-0 bottom-0 z-popup flex justify-center px-4 pb-safe-or-4',
            'transition-all duration-700',
          )}
          style={{
            opacity: showCta ? 1 : 0,
            transform: showCta ? 'translateY(0)' : 'translateY(20px)',
            pointerEvents: showCta ? 'auto' : 'none',
          }}
        >
          <div className="w-full max-w-md">
            <Button
              className="group relative w-full overflow-hidden shadow-2"
              onClick={handlePersonalize}
              size={ButtonSize.XLarge}
              variant={ButtonVariant.Primary}
            >
              <span className="relative z-1 flex items-center gap-2">
                <SparkleIcon className="size-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                Make it yours
                <MoveToIcon className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="via-white/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </Button>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
              className="mt-2 text-center"
            >
              30 seconds to a personalized feed
            </Typography>
          </div>
        </div>
      </FixedPortal>

      {/* ─── Interaction prompt ─── */}
      <InteractionPrompt
        visible={showPrompt}
        onPersonalize={handlePersonalize}
      />
    </div>
  );
}

export const FunnelFeedPreview = withIsActiveGuard(FeedPreviewComponent);
