import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import type { NextSeoProps } from 'next-seo';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import {
  ThemeMode,
  useSettingsContext,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getTemplatedTitle } from '../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Onboarding V2'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  noindex: true,
  nofollow: true,
};

const TOPICS_ROW_1 = [
  'React',
  'TypeScript',
  'System Design',
  'AI & ML',
  'PostgreSQL',
  'Next.js',
  'Docker',
  'GraphQL',
  'Kubernetes',
  'Python',
  'Web Performance',
  'Microservices',
  'AWS',
  'Redis',
  'Svelte',
  'Deno',
];

const TOPICS_ROW_2 = [
  'Open Source',
  'DevOps',
  'Rust',
  'Career Growth',
  'Node.js',
  'Go',
  'Cloud Native',
  'Testing',
  'Security',
  'CSS',
  'Linux',
  'API Design',
  'CI / CD',
  'Terraform',
  'MongoDB',
  'WebAssembly',
];

const MARQUEE_COPIES = [0, 1, 2];

const SELECTABLE_TOPICS = [
  { label: 'React', color: 'water' as const },
  { label: 'TypeScript', color: 'water' as const },
  { label: 'Python', color: 'onion' as const },
  { label: 'Node.js', color: 'avocado' as const },
  { label: 'Next.js', color: 'water' as const },
  { label: 'AI & ML', color: 'cheese' as const },
  { label: 'System Design', color: 'cabbage' as const },
  { label: 'Docker', color: 'onion' as const },
  { label: 'AWS', color: 'cheese' as const },
  { label: 'GraphQL', color: 'cabbage' as const },
  { label: 'Rust', color: 'ketchup' as const },
  { label: 'Go', color: 'water' as const },
  { label: 'DevOps', color: 'onion' as const },
  { label: 'Kubernetes', color: 'onion' as const },
  { label: 'PostgreSQL', color: 'water' as const },
  { label: 'Security', color: 'ketchup' as const },
  { label: 'Testing', color: 'avocado' as const },
  { label: 'CSS', color: 'bacon' as const },
  { label: 'Open Source', color: 'cabbage' as const },
  { label: 'API Design', color: 'cabbage' as const },
];

const TOPIC_SELECTED_STYLES =
  'border-white/[0.12] bg-white/[0.10] text-text-primary';

const TopicPill = ({ label }: { label: string }): ReactElement => (
  <span className="pointer-events-none shrink-0 whitespace-nowrap rounded-10 border border-white/[0.12] bg-white/[0.06] px-3.5 py-1.5 text-text-secondary backdrop-blur-sm typo-caption1">
    {label}
  </span>
);

const OnboardingV2Page = (): ReactElement => {
  const {
    applyThemeMode,
    loadedSettings,
    sidebarExpanded,
    toggleSidebarExpanded,
  } = useSettingsContext();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [feedVisible, setFeedVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelStageProgress, setPanelStageProgress] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [aiPrompt, setAiPrompt] = useState('');
  const [signupContext, setSignupContext] = useState<
    'topics' | 'github' | 'ai' | 'manual' | null
  >(null);
  const didSetSidebarDefault = useRef(false);
  const panelSentinelRef = useRef<HTMLDivElement>(null);
  const panelStageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const panelBoxRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);

  const toggleTopic = useCallback((topic: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  }, []);

  const openSignup = useCallback(
    (context: 'topics' | 'github' | 'ai' | 'manual') => {
      setSignupContext(context);
      setShowSignupPrompt(true);
    },
    [],
  );

  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  useEffect(() => {
    if (!loadedSettings || didSetSidebarDefault.current) {
      return;
    }
    didSetSidebarDefault.current = true;
    if (!sidebarExpanded) {
      void toggleSidebarExpanded();
    }
  }, [loadedSettings, sidebarExpanded, toggleSidebarExpanded]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }

    // Keep intro order stable: hero settles before feed animates in.
    const timer = window.setTimeout(() => {
      setFeedVisible(true);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mounted]);

  useEffect(() => {
    const node = panelSentinelRef.current;
    if (!node) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPanelVisible(true);
        }
      },
      { rootMargin: '0px 0px 200px 0px', threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stage = panelStageRef.current;
    if (!stage) {
      return undefined;
    }

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      setPanelStageProgress(1);
      return undefined;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const start = viewportHeight * 0.82;
      const end = viewportHeight * 0.34;
      const raw = (start - rect.top) / (start - end);
      const clamped = Math.min(1, Math.max(0, raw));
      setPanelStageProgress((prev) =>
        Math.abs(prev - clamped) > 0.01 ? clamped : prev,
      );
    };

    const onScrollOrResize = () => {
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  // Parallax scroll: shift hero layers at different speeds
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) return undefined;

    let ticking = false;
    const onScroll = () => {
      scrollY.current = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const hero = heroRef.current;
          if (hero) {
            const y = scrollY.current;
            hero.style.setProperty('--scroll-y', `${y}`);
          }
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-reveal: stagger feed articles as they enter viewport
  useEffect(() => {
    if (!feedVisible) return undefined;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('onb-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 },
    );

    const observeFeedArticles = () => {
      document.querySelectorAll('article').forEach((el, i) => {
        const article = el as HTMLElement;

        if (!article.dataset.onbRevealDelay) {
          article.style.setProperty('--reveal-delay', `${Math.min(i * 60, 400)}ms`);
          article.dataset.onbRevealDelay = 'true';
        }

        if (article.classList.contains('onb-revealed')) {
          return;
        }

        observer.observe(article);
      });
    };

    observeFeedArticles();

    const mutationObserver = new MutationObserver(() => {
      observeFeedArticles();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [feedVisible]);

  // Cursor-tracking glow on personalization panel
  useEffect(() => {
    const box = panelBoxRef.current;
    if (!box) return undefined;

    const onMove = (e: MouseEvent) => {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      box.style.setProperty('--mouse-x', `${x}px`);
      box.style.setProperty('--mouse-y', `${y}px`);
    };
    box.addEventListener('mousemove', onMove);
    return () => box.removeEventListener('mousemove', onMove);
  }, []);

  const recommendedTopics = useMemo(() => {
    if (!aiPrompt.trim()) {
      return [];
    }

    const lower = aiPrompt.toLowerCase();

    return SELECTABLE_TOPICS.map((topic) => {
      const labelLower = topic.label.toLowerCase();
      const keywords = labelLower.split(/[\s&/.+-]+/).filter(Boolean);
      const hasDirect = lower.includes(labelLower);
      const score = keywords.reduce((acc, kw) => {
        if (kw.length < 3) return acc;
        return lower.includes(kw) ? acc + kw.length : acc;
      }, hasDirect ? 100 : 0);

      return { ...topic, score };
    })
      .filter((topic) => topic.score > 0 && !selectedTopics.has(topic.label))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [aiPrompt, selectedTopics]);

  const panelLift = Math.round(panelStageProgress * 60);
  const panelBackdropOpacity = Math.min(0.6, panelStageProgress * 0.75);
  const panelShadowOpacity = 0.12 + panelStageProgress * 0.2;
  const panelRevealOffset = panelVisible ? 40 : 120;

  return (
    <div className="onb-page relative" role="presentation">
      <div className="onb-top-explore fixed left-1/2 top-4 z-header hidden -translate-x-1/2 items-center rounded-12 border border-white/[0.08] bg-background-default/80 px-4 py-1.5 text-text-secondary shadow-1 backdrop-blur-md typo-callout laptop:flex">
        Explore
      </div>
      {/* ── Hero ── */}
      <section ref={heroRef} className="onb-hero relative overflow-hidden pb-0 pt-12" style={{ '--scroll-y': '0' } as React.CSSProperties}>
        {/* Dot grid — shifts subtly with scroll */}
        <div
          className="onb-dot-grid pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage:
              'radial-gradient(ellipse 70% 70% at 50% 35%, black 10%, transparent 70%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 70% at 50% 35%, black 10%, transparent 70%)',
          }}
        />

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="onb-float-1 absolute left-[15%] top-[20%] h-1 w-1 rounded-full bg-accent-cabbage-default/30" />
          <div className="onb-float-2 absolute left-[75%] top-[15%] h-1.5 w-1.5 rounded-full bg-accent-onion-default/20" />
          <div className="onb-float-3 absolute left-[60%] top-[60%] h-1 w-1 rounded-full bg-accent-water-default/25" />
          <div className="onb-float-1 absolute left-[25%] top-[70%] h-1 w-1 rounded-full bg-accent-cheese-default/20" />
          <div className="onb-float-2 absolute left-[85%] top-[45%] h-1 w-1 rounded-full bg-accent-cabbage-default/20" />
          <div className="onb-float-3 absolute left-[40%] top-[30%] h-0.5 w-0.5 rounded-full bg-white/20" />
        </div>

        {/* Ambient glows */}
        <div className="onb-glow-drift pointer-events-none absolute left-1/2 top-0 h-[22rem] w-[48rem] -translate-x-1/2 bg-accent-cabbage-default/5 blur-[100px]" />
        <div className="onb-glow-drift-reverse pointer-events-none absolute left-[40%] top-[4rem] h-[18rem] w-[30rem] -translate-x-1/2 bg-accent-onion-default/[0.03] blur-[120px]" />
        <div className="pointer-events-none absolute left-1/2 top-[5rem] h-[24rem] w-[64rem] -translate-x-1/2 bg-gradient-to-r from-accent-water-default/[0.03] via-accent-cabbage-default/[0.10] to-accent-onion-default/[0.06] blur-[90px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[20rem] bg-gradient-to-b from-white/[0.03] to-transparent" />

        {/* Centered text content */}
        <div className="relative mx-auto max-w-[63.75rem] px-4 text-center laptop:px-6">
          {/* Live indicator */}
          <div
            className={classNames(
              'mb-6 flex items-center justify-center gap-2 transition-all duration-700 ease-out',
              mounted
                ? 'translate-y-0 opacity-100'
                : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: '100ms' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-avocado-default opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-avocado-default" />
            </span>
            <span className="text-text-quaternary typo-caption1">
              1M+ developers &middot; live now
            </span>
          </div>

          {/* Headline */}
          <div
            className={classNames(
              'transition-all duration-700 ease-out',
              mounted
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0',
            )}
            style={{ transitionDelay: '200ms' }}
          >
            <h1 className="mx-auto max-w-[36rem] font-bold leading-[1.08] tracking-tight typo-mega3 tablet:max-w-[48rem] tablet:typo-mega1">
              <span className="text-text-primary">
                Join top dev community.
              </span>
              <br />
              <span className="onb-gradient-text bg-[length:200%_auto] bg-clip-text text-transparent">
                Build your feed identity.
              </span>
            </h1>
          </div>

          {/* Subtext */}
          <div
            className={classNames(
              'transition-all duration-700 ease-out',
              mounted
                ? 'translate-y-0 opacity-100'
                : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: '400ms' }}
          >
            <p className="mx-auto mt-5 max-w-[30rem] text-text-secondary typo-callout">
              Tap into live signals from the global dev community, then
              lock your feed to your stack with GitHub import or manual setup.
            </p>
          </div>

          {/* Hero CTA group */}
          <div
            className={classNames(
              'mt-7 transition-all duration-700 ease-out',
              mounted
                ? 'translate-y-0 opacity-100'
                : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="relative mx-auto flex w-fit flex-wrap items-center justify-center gap-3">
              <div className="onb-btn-glow pointer-events-none absolute -inset-3 rounded-20 bg-white/[0.06] blur-xl" />
              <button
                type="button"
                onClick={() => openSignup('github')}
                className="onb-btn-shine group relative flex items-center gap-2.5 overflow-hidden rounded-14 bg-white px-7 py-3.5 font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 typo-callout"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                Continue with GitHub
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-black/30 transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => openSignup('manual')}
                className="group relative flex items-center gap-2.5 overflow-hidden rounded-14 border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 font-bold text-text-primary backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.22] hover:bg-white/[0.08] hover:shadow-[0_10px_35px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 typo-callout"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Set up manually
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-text-quaternary transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Topic marquee with gradient backdrop ── */}
        <div
          className={classNames(
            'relative mt-10 pb-0 pt-2 transition-all duration-700 ease-out',
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
          style={{ transitionDelay: '600ms' }}
          aria-hidden="true"
        >
          {/* Gradient backdrop */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-cabbage-default/[0.04] via-accent-cabbage-default/[0.10] to-accent-cabbage-default/[0.04]" />
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cabbage-default/30 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-onion-default/25 to-transparent" />
          <div className="onb-glow-drift pointer-events-none absolute left-1/2 top-1/2 h-24 w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-cabbage-default/[0.06] blur-[60px]" />

          <div
            className="relative overflow-hidden"
            style={{
              maskImage:
                'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)',
            }}
          >
            {/* Row 1 — left */}
            <div className="onb-marquee-row mb-3 flex">
              {MARQUEE_COPIES.map((i) => (
                <div
                  key={i}
                  className="onb-marquee flex shrink-0 gap-3 pr-3"
                  style={{
                    animation: 'onb-marquee-left 90s linear infinite',
                    willChange: 'transform',
                  }}
                >
                  {TOPICS_ROW_1.map((t) => (
                    <TopicPill key={`${t}-${i}`} label={t} />
                  ))}
                </div>
              ))}
            </div>

            {/* Row 2 — right */}
            <div className="onb-marquee-row flex">
              {MARQUEE_COPIES.map((i) => (
                <div
                  key={i}
                  className="onb-marquee flex shrink-0 gap-3 pr-3"
                  style={{
                    animation: 'onb-marquee-right 100s linear infinite',
                    willChange: 'transform',
                  }}
                >
                  {TOPICS_ROW_2.map((t) => (
                    <TopicPill key={`${t}-${i}`} label={t} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feed ── */}
      <div
        className={classNames(
          'onb-feed-stage transition-[opacity,transform] duration-500 ease-out',
          feedVisible
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0',
        )}
      >
        <MainFeedLayout feedName="popular" isSearchOn={false}>
          {/* Scroll sentinel — triggers panel at ~50% of feed */}
          <div ref={panelSentinelRef} className="pointer-events-none h-0" />

        {/* ── Personalization Panel ── */}
        <div
          ref={panelStageRef}
          className="relative left-1/2 h-[100vh] w-screen -translate-x-1/2"
        >
          <div className="sticky top-[50vh] -translate-y-1/2">
            {/* Local backdrop wash over feed cards */}
            <div
              className="pointer-events-none absolute inset-x-0 -top-16 h-[34rem] bg-gradient-to-b from-transparent via-black/35 to-background-default/95 backdrop-blur-[1.5px] transition-opacity duration-300"
              style={{ opacity: panelVisible ? panelBackdropOpacity : 0 }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-[-5rem] h-[16rem] bg-gradient-to-b from-transparent via-background-default/45 to-background-default/92 backdrop-blur-[2px] transition-opacity duration-300"
              style={{ opacity: panelVisible ? panelBackdropOpacity : 0 }}
            />

            <div
              className={classNames(
                'relative transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]',
                panelVisible
                  ? 'opacity-100'
                  : 'opacity-0',
              )}
              style={{
                transform: `translateY(${panelRevealOffset - panelLift}px)`,
              }}
            >
              {/* Panel ambient glow */}
              <div
                className={classNames(
                  'pointer-events-none absolute left-1/2 top-0 h-[16rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent-cabbage-default/[0.04] blur-[80px] transition-opacity duration-1000',
                  panelVisible ? 'opacity-100' : 'opacity-0',
                )}
              />
              {/* Top edge glow line */}
              <div
                className={classNames(
                  'pointer-events-none absolute left-1/2 top-0 h-px w-[24rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-cabbage-default/30 to-transparent transition-opacity duration-1000',
                  panelVisible ? 'opacity-100' : 'opacity-0',
                )}
              />
              <div
                ref={panelBoxRef}
                className="onb-cursor-glow mx-auto max-w-[48rem] px-5 pb-10 pt-16 tablet:px-8 tablet:pt-20"
                style={{
                  filter: `drop-shadow(0 24px 60px rgba(0,0,0,${panelShadowOpacity.toFixed(3)}))`,
                }}
              >
            {/* Section title */}
            <div
              className={classNames(
                'transition-all duration-700 ease-out',
                panelVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-6 opacity-0',
              )}
            >
              <p className="mb-2 text-center text-text-tertiary typo-callout">
                You just explored the global feed.
              </p>
              <h3 className="mb-10 text-center font-bold text-text-primary typo-title2 tablet:typo-title1">
                Now build a feed that is truly yours
              </h3>
            </div>

            {/* Two-path layout */}
            <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:gap-5">
              {/* ── Path A: GitHub ── */}
              <div
                className={classNames(
                  'onb-glass flex flex-1 flex-col items-center rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out',
                  panelVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0',
                )}
                style={{ transitionDelay: '200ms' }}
              >
                {/* Animated rings icon */}
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
                  <div className="onb-ring-spin pointer-events-none absolute inset-0 rounded-full border border-dashed border-accent-cabbage-default/20" />
                  <div className="onb-ring-spin-reverse pointer-events-none absolute -inset-3 rounded-full border border-dashed border-accent-onion-default/15" />
                  <div className="onb-ring-pulse pointer-events-none absolute inset-2 rounded-full bg-accent-cabbage-default/[0.04]" />
                  <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-accent-cabbage-default/[0.08] to-transparent" />
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="relative text-text-primary"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </div>

                <h4 className="mb-1 font-bold text-text-primary typo-body">
                  One-click setup
                </h4>
                <p className="mb-5 text-center text-text-tertiary typo-footnote">
                  We&apos;ll read your repos &amp; stars to instantly
                  build a feed that matches your stack.
                </p>

                <div className="relative w-full">
                  <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                  <button
                    type="button"
                    onClick={() => openSignup('github')}
                    className="onb-btn-shine group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-5 py-3.5 font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 typo-callout"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    Continue with GitHub
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-black/30 transition-transform duration-300 group-hover:translate-x-0.5">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2.5 text-text-quaternary typo-caption2">
                  Read-only access &middot; No special permissions
                </p>
              </div>

              {/* ── Path B: Manual ── */}
              <div
                className={classNames(
                  'onb-glass flex flex-1 flex-col rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out',
                  panelVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0',
                )}
                style={{ transitionDelay: '350ms' }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-text-secondary transition-transform duration-300 group-hover:rotate-12"
                    >
                      <path
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary typo-callout">
                      Describe your stack
                    </h4>
                    <p className="text-text-quaternary typo-caption2">
                      Manual &middot; pick your own topics
                    </p>
                  </div>
                </div>

                {/* Textarea */}
                <div className="onb-textarea-glow mb-3 rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 focus-within:border-accent-cabbage-default/20 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.06)]">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' || e.shiftKey) {
                        return;
                      }
                      e.preventDefault();
                      const topPick = recommendedTopics[0];
                      if (topPick) {
                        toggleTopic(topPick.label);
                        return;
                      }
                      if (aiPrompt.trim()) {
                        openSignup('ai');
                      }
                    }}
                    rows={3}
                    placeholder={"I'm a frontend engineer working with React and TypeScript. Interested in system design, AI tooling..."}
                    className="w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary placeholder:text-text-quaternary focus:outline-none typo-callout"
                  />
                </div>
                <p className="mb-3 flex items-center gap-1.5 text-text-quaternary typo-caption2">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Topics appear as you type
                </p>

                {/* Selected chips */}
                {selectedTopics.size > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {Array.from(selectedTopics).map((topic) => (
                      <button
                        key={`sel-${topic}`}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={classNames(
                          'onb-chip-enter inline-flex items-center gap-1.5 rounded-8 border px-2.5 py-1 font-medium shadow-[0_0_12px_rgba(255,255,255,0.04)] transition-all duration-200 hover:bg-white/[0.14] hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] active:scale-[0.96] focus-visible:outline-none typo-caption1',
                          TOPIC_SELECTED_STYLES,
                        )}
                      >
                        {topic}
                        <span className="text-text-quaternary">×</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Matched tags */}
                <div
                  className={classNames(
                    'overflow-hidden transition-all duration-400 ease-out',
                    recommendedTopics.length > 0
                      ? 'max-h-40 opacity-100'
                      : 'max-h-0 opacity-0',
                  )}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedTopics.map(({ label }) => (
                      <button
                        key={`match-${label}`}
                        type="button"
                        onClick={() => toggleTopic(label)}
                        className="onb-chip-enter rounded-8 border border-border-subtlest-tertiary/40 px-2.5 py-1 text-text-tertiary transition-all duration-200 hover:bg-white/[0.06] hover:text-text-secondary active:scale-[0.97] focus-visible:outline-none typo-caption1"
                      >
                        + {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Build feed CTA */}
                <div
                  className={classNames(
                    'overflow-hidden transition-all duration-300 ease-out',
                    aiPrompt.trim() || selectedTopics.size > 0
                      ? 'mt-4 max-h-20 opacity-100'
                      : 'mt-0 max-h-0 opacity-0',
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      selectedTopics.size > 0
                        ? openSignup('topics')
                        : openSignup('ai')
                    }
                    className="onb-btn-shine group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-12 bg-gradient-to-r from-accent-cabbage-default/90 to-accent-onion-default/90 py-2.5 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(168,85,247,0.15)] focus-visible:outline-none typo-footnote"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {selectedTopics.size > 0
                      ? `Build my feed · ${selectedTopics.size} topic${selectedTopics.size !== 1 ? 's' : ''}`
                      : 'Build feed from description'}
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
        </div>
        </MainFeedLayout>
      </div>

      {/* ── CSS: feed limit, article fade, marquee, sidebar disable ── */}
      <style jsx global>{`
        aside,
        nav[aria-label] {
          pointer-events: none !important;
          opacity: 0.5 !important;
          user-select: none !important;
        }

        .onb-feed-stage article:nth-of-type(n + 13) {
          display: none !important;
        }
        .onb-feed-stage article:nth-of-type(12) ~ div {
          display: none !important;
        }

        /* fade-out handled by .onb-revealed nth-of-type rules below */

        /* ─── HERO PARALLAX ─── */
        .onb-hero {
          --scroll-y: 0;
        }
        .onb-hero .onb-dot-grid {
          transform: translateY(calc(var(--scroll-y) * 0.04px));
          opacity: calc(1 - var(--scroll-y) * 0.001);
        }
        .onb-hero .onb-float-1,
        .onb-hero .onb-float-2,
        .onb-hero .onb-float-3 {
          transform: translateY(calc(var(--scroll-y) * -0.15px));
        }
        .onb-hero .onb-glow-drift {
          transform: translateX(-50%) translateY(calc(var(--scroll-y) * -0.08px));
        }

        /* ─── MARQUEE ─── */
        @keyframes onb-marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes onb-marquee-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .onb-marquee-row {
          pointer-events: none;
        }

        /* ─── SHIMMER ─── */
        .onb-shimmer { position: relative; overflow: hidden; }
        .onb-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%);
          animation: onb-shimmer 2.4s ease-in-out infinite;
        }
        @keyframes onb-shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }

        /* ─── RING ANIMATIONS ─── */
        @keyframes onb-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .onb-ring-spin { animation: onb-ring-spin 12s linear infinite; }
        .onb-ring-spin-reverse { animation: onb-ring-spin 18s linear infinite reverse; }

        @keyframes onb-ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .onb-ring-pulse { animation: onb-ring-pulse 3s ease-in-out infinite; }

        /* ─── CTA GLOW ─── */
        @keyframes onb-cta-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* ─── CHIP POP ─── */
        @keyframes onb-chip-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .onb-chip-enter {
          animation: onb-chip-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        /* ─── FLOATING PARTICLES ─── */
        @keyframes onb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(12px, -18px) scale(1.2); opacity: 0.6; }
          50% { transform: translate(-8px, -30px) scale(0.9); opacity: 0.4; }
          75% { transform: translate(16px, -12px) scale(1.1); opacity: 0.5; }
        }
        @keyframes onb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          33% { transform: translate(-16px, -22px) scale(1.3); opacity: 0.5; }
          66% { transform: translate(10px, -35px) scale(0.8); opacity: 0.3; }
        }
        @keyframes onb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          40% { transform: translate(20px, -14px) scale(1.15); opacity: 0.55; }
          80% { transform: translate(-12px, -28px) scale(0.85); opacity: 0.2; }
        }
        .onb-float-1 { animation: onb-float-1 8s ease-in-out infinite; }
        .onb-float-2 { animation: onb-float-2 11s ease-in-out infinite; }
        .onb-float-3 { animation: onb-float-3 14s ease-in-out infinite; }

        /* ─── GRADIENT TEXT SHIMMER ─── */
        @keyframes onb-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .onb-gradient-text {
          background-image: linear-gradient(
            90deg,
            var(--theme-accent-cabbage-default) 0%,
            var(--theme-accent-onion-default) 30%,
            var(--theme-accent-water-default) 60%,
            var(--theme-accent-cabbage-default) 100%
          );
          animation: onb-gradient-shift 6s ease-in-out infinite;
        }

        /* ─── AMBIENT GLOW DRIFT ─── */
        @keyframes onb-glow-drift {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.08; }
        }
        @keyframes onb-glow-drift-r {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.03; }
          50% { transform: translateX(-52%) translateY(8px); opacity: 0.05; }
        }
        .onb-glow-drift { animation: onb-glow-drift 8s ease-in-out infinite; }
        .onb-glow-drift-reverse { animation: onb-glow-drift-r 10s ease-in-out infinite; }

        /* ─── BUTTON SHINE SWEEP ─── */
        .onb-btn-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.6s ease;
        }
        .onb-btn-shine:hover::after {
          left: 120%;
        }

        /* ─── BUTTON GLOW BREATHING ─── */
        @keyframes onb-btn-breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .onb-btn-glow { animation: onb-btn-breathe 3s ease-in-out infinite; }

        /* ─── GLASSMORPHISM ─── */
        .onb-glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }
        .onb-glass:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.10);
          box-shadow: 0 4px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.04);
        }

        /* ─── CURSOR-TRACKING GLOW ─── */
        .onb-cursor-glow {
          --mouse-x: 50%;
          --mouse-y: 50%;
          position: relative;
        }
        .onb-cursor-glow::before {
          content: '';
          position: absolute;
          width: 320px;
          height: 320px;
          left: var(--mouse-x);
          top: var(--mouse-y);
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }
        .onb-cursor-glow:hover::before {
          opacity: 1;
        }

        /* ─── MODAL CHECKLIST STAGGER ─── */
        @keyframes onb-check-in {
          from { transform: translateX(-8px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .onb-check-item {
          animation: onb-check-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* ─── MODAL ENTRANCE ─── */
        @keyframes onb-modal-in {
          from { transform: scale(0.92) translateY(16px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .onb-modal-enter {
          animation: onb-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes onb-modal-backdrop-in {
          from { opacity: 0; backdrop-filter: blur(0); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
        .onb-modal-backdrop {
          animation: onb-modal-backdrop-in 0.3s ease-out both;
        }

        /* ─── FEED ARTICLE SCROLL-REVEAL ─── */
        .onb-feed-stage article {
          opacity: 0;
          transform: translateY(0.75rem) scale(0.995);
          transition: opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.38s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.25s ease,
                      border-color 0.25s ease !important;
          transition-delay: var(--reveal-delay, 0ms);
        }
        .onb-feed-stage article.onb-revealed {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
        }
        .onb-feed-stage article.onb-revealed:hover {
          transform: translateY(0) scale(1) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25),
                      0 0 0 1px rgba(255,255,255,0.03) !important;
          border-color: rgba(255,255,255,0.06) !important;
        }

        /* ─── FEED FADE-OUT GRADIENT (bottom of visible articles) ─── */
        .onb-feed-stage article:nth-of-type(9).onb-revealed { opacity: 0.88 !important; }
        .onb-feed-stage article:nth-of-type(10).onb-revealed { opacity: 0.65 !important; }
        .onb-feed-stage article:nth-of-type(11).onb-revealed { opacity: 0.38 !important; }
        .onb-feed-stage article:nth-of-type(12).onb-revealed { opacity: 0.12 !important; }

        /* ─── TOPIC PILLS (no interaction) ─── */
        .onb-marquee span {
          pointer-events: none;
        }

        /* ─── SCROLL PROGRESS LINE ─── */
        @keyframes onb-progress-glow {
          0%, 100% { box-shadow: 0 0 6px 1px rgba(168,85,247,0.3); }
          50% { box-shadow: 0 0 12px 2px rgba(168,85,247,0.5); }
        }

        /* ─── REDUCED MOTION ─── */
        @media (prefers-reduced-motion: reduce) {
          .onb-marquee,
          .onb-shimmer::after,
          .onb-chip-enter,
          .onb-ring-spin,
          .onb-ring-spin-reverse,
          .onb-ring-pulse,
          .onb-float-1,
          .onb-float-2,
          .onb-float-3,
          .onb-gradient-text,
          .onb-glow-drift,
          .onb-glow-drift-reverse,
          .onb-btn-glow,
          .onb-modal-enter,
          .onb-modal-backdrop {
            animation: none !important;
          }
          .onb-btn-shine::after,
          .onb-cursor-glow::before {
            display: none;
          }
          .onb-feed-stage article {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* ── Contextual Signup Modal ── */}
      {showSignupPrompt && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="onb-modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setShowSignupPrompt(false)}
            role="presentation"
          />

          {/* Modal */}
          <div className="onb-modal-enter onb-glass relative w-full max-w-[26rem] rounded-20 border border-white/[0.08] bg-background-default shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowSignupPrompt(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="px-7 pb-7 pt-8">
              {/* ── GitHub context ── */}
              {signupContext === 'github' && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08]">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-text-primary"
                      >
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary typo-title3">
                        Connect GitHub
                      </h3>
                      <p className="text-text-tertiary typo-caption1">
                        One-click personalization
                      </p>
                    </div>
                  </div>
                  <p className="mb-4 text-text-secondary typo-callout">
                    We&apos;ll scan your public repos and stars to build a feed
                    that matches your stack.
                  </p>
                  <div className="mb-6 flex flex-col gap-2 rounded-12 border border-white/[0.04] px-4 py-3">
                    {[
                      'Read-only access to public info',
                      'No write permissions required',
                      'Revoke anytime from settings',
                    ].map((text, i) => (
                      <div
                        key={text}
                        className="onb-check-item flex items-center gap-2 text-text-tertiary typo-caption1"
                        style={{ animationDelay: `${150 + i * 80}ms` }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent-avocado-default/70">
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        {text}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Topics context ── */}
              {signupContext === 'topics' && (
                <>
                  <h3 className="mb-2 font-bold text-text-primary typo-title3">
                    Your feed is ready
                  </h3>
                  <p className="mb-4 text-text-secondary typo-callout">
                    Sign up to save your personalized feed with{' '}
                    <span className="font-bold text-text-primary">
                      {selectedTopics.size} topics
                    </span>
                    .
                  </p>
                  <div className="mb-6 flex flex-wrap gap-1.5">
                    {Array.from(selectedTopics).map((t, i) => (
                      <span
                        key={t}
                        className="onb-chip-enter rounded-8 border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-text-secondary typo-caption1"
                        style={{ animationDelay: `${100 + i * 50}ms` }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* ── AI context ── */}
              {signupContext === 'ai' && (
                <>
                  <h3 className="mb-2 font-bold text-text-primary typo-title3">
                    Build from description
                  </h3>
                  <p className="mb-3 text-text-secondary typo-callout">
                    We&apos;ll generate a personalized feed based on what you
                    described.
                  </p>
                  <div className="mb-6 rounded-12 border border-white/[0.04] px-4 py-3">
                    <p className="text-text-secondary typo-callout italic">
                      &ldquo;{aiPrompt}&rdquo;
                    </p>
                  </div>
                </>
              )}

              {/* ── Manual context ── */}
              {signupContext === 'manual' && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-text-secondary">
                        <path
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary typo-title3">
                        Describe your stack
                      </h3>
                      <p className="text-text-tertiary typo-caption1">
                        Manual setup
                      </p>
                    </div>
                  </div>
                  <p className="mb-3 text-text-secondary typo-callout">
                    Tell us what you build and we&apos;ll shape your feed around
                    your technologies and interests.
                  </p>
                  <div className="onb-textarea-glow mb-6 rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 focus-within:border-accent-cabbage-default/20 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.06)]">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={4}
                      placeholder="I'm a frontend engineer using React and TypeScript. Interested in system design, performance, and AI tooling..."
                      className="w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary placeholder:text-text-quaternary focus:outline-none typo-callout"
                    />
                  </div>
                </>
              )}

              {/* ── Auth buttons ── */}
              <div className="relative">
                <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                {signupContext === 'github' ? (
                  <button
                    type="button"
                    className="onb-btn-shine group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-4 py-3.5 font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none"
                    onClick={() => setShowSignupPrompt(false)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    Continue with GitHub
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-black/30 transition-transform duration-300 group-hover:translate-x-0.5">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="onb-btn-shine group relative w-full overflow-hidden rounded-14 bg-white px-4 py-3.5 font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none"
                    onClick={() => setShowSignupPrompt(false)}
                  >
                    Create free account
                  </button>
                )}
              </div>
              <button
                type="button"
                className="mt-2 w-full rounded-12 py-2.5 text-center text-text-quaternary transition-all duration-200 typo-footnote hover:text-text-tertiary"
                onClick={() => setShowSignupPrompt(false)}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

OnboardingV2Page.getLayout = (
  page: ReactNode,
  _pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps,
): ReactNode =>
  getFooterNavBarLayout(
    <MainLayout {...layoutProps} activePage="/popular">
      <FeedLayoutProvider>{page}</FeedLayoutProvider>
    </MainLayout>,
  );

OnboardingV2Page.layoutProps = {
  seo,
  mainPage: true,
  screenCentered: false,
  hideSearchField: true,
};

export default OnboardingV2Page;
