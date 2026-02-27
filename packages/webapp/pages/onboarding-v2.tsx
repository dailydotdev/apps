import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { NextSeoProps } from 'next-seo';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import MainLayout from '@dailydotdev/shared/src/components/MainLayout';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities/common';
import {
  ThemeMode,
  useSettingsContext,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  downloadBrowserExtension,
  mobileAppUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { UserExperienceLevel } from '@dailydotdev/shared/src/lib/user';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  BrowserName,
  getCurrentBrowserName,
} from '@dailydotdev/shared/src/lib/func';
import { ChromeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Chrome';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { NewTabIcon } from '@dailydotdev/shared/src/components/icons/NewTab';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { StarIcon } from '@dailydotdev/shared/src/components/icons/Star';
import { cloudinaryOnboardingExtension } from '@dailydotdev/shared/src/lib/image';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { FooterLinks } from '@dailydotdev/shared/src/components/footer/FooterLinks';
import { useRouter } from 'next/router';
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

type RisingTag = {
  label: string;
  left: string;
  delay: string;
  duration: string;
  driftX: number;
};

const RISING_TAGS_DESKTOP: RisingTag[] = [
  { label: 'React', left: '8%', delay: '0s', duration: '14s', driftX: 12 },
  { label: 'AI & ML', left: '28%', delay: '1.2s', duration: '15s', driftX: -8 },
  {
    label: 'System Design',
    left: '52%',
    delay: '0.6s',
    duration: '14.5s',
    driftX: 10,
  },
  { label: 'Docker', left: '78%', delay: '2s', duration: '13.8s', driftX: -14 },
  {
    label: 'TypeScript',
    left: '18%',
    delay: '3.4s',
    duration: '15.2s',
    driftX: 8,
  },
  {
    label: 'Next.js',
    left: '88%',
    delay: '2.8s',
    duration: '14.4s',
    driftX: -10,
  },
  {
    label: 'Python',
    left: '42%',
    delay: '4.2s',
    duration: '14.8s',
    driftX: -6,
  },
  {
    label: 'Kubernetes',
    left: '66%',
    delay: '5s',
    duration: '14.2s',
    driftX: 12,
  },
];

const RISING_TAGS_MOBILE: RisingTag[] = [
  { label: 'React', left: '10%', delay: '0s', duration: '13.5s', driftX: 8 },
  {
    label: 'AI & ML',
    left: '55%',
    delay: '1.5s',
    duration: '14s',
    driftX: -10,
  },
  { label: 'Docker', left: '30%', delay: '3s', duration: '13s', driftX: 6 },
  {
    label: 'TypeScript',
    left: '75%',
    delay: '4.5s',
    duration: '14.5s',
    driftX: -8,
  },
];

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

type GithubImportPhase =
  | 'idle'
  | 'running'
  | 'awaitingSeniority'
  | 'confirmingSeniority'
  | 'finishing'
  | 'complete';
type ImportFlowSource = 'github' | 'ai';
type GithubImportBodyPhase = 'checklist' | 'seniority' | 'default';

const AI_IMPORT_STEPS = [
  { label: 'Analyzing your profile', threshold: 12 },
  { label: 'Matching interests', threshold: 30 },
  { label: 'Mapping your stack', threshold: 46 },
  { label: 'Inferring seniority', threshold: 68 },
  { label: 'Building your feed', threshold: 95 },
];

const EXPERIENCE_LEVEL_OPTIONS = Object.entries(UserExperienceLevel).map(
  ([value, label]) => ({
    value: value as keyof typeof UserExperienceLevel,
    label,
  }),
);

const getExperienceLevelOptionParts = (
  label: string,
): { title: string; meta: string | null } => {
  const match = label.match(/^(.*?)(?:\s*\(([^)]+)\))?$/);
  if (!match) {
    return { title: label, meta: null };
  }

  return {
    title: match[1].trim(),
    meta: match[2]?.trim() ?? null,
  };
};

const GITHUB_IMPORT_STEPS = [
  { label: 'Connecting account', threshold: 12 },
  { label: 'Scanning repositories', threshold: 30 },
  { label: 'Matching interests', threshold: 46 },
  { label: 'Inferring seniority', threshold: 68 },
  { label: 'Building your feed', threshold: 96 },
];

const CONFETTI_COLORS = [
  'bg-accent-cabbage-default',
  'bg-accent-onion-default',
  'bg-accent-cheese-default',
  'bg-accent-water-default',
  'bg-accent-avocado-default',
  'bg-accent-bacon-default',
];

type ConfettiParticle = {
  id: string;
  left: string;
  delay: string;
  color: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  shape: 'rect' | 'circle' | 'star';
  drift: number;
  speed: number;
};

type LiveFloater = {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
};

function buildConfettiParticles(): ConfettiParticle[] {
  const particles: ConfettiParticle[] = [];
  const SIZES = ['sm', 'md', 'lg', 'xl'] as const;
  const SHAPES = ['rect', 'circle', 'star'] as const;
  for (let i = 0; i < 24; i += 1) {
    const col = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const opacity = 65 + Math.round(Math.random() * 30);
    particles.push({
      id: `cf-${i}`,
      left: `${1 + Math.random() * 98}%`,
      delay: `${Math.round(Math.random() * 2400)}ms`,
      color: `${col}/${opacity}`,
      size: SIZES[Math.floor(Math.random() * SIZES.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      drift: -40 + Math.random() * 80,
      speed: 3.5 + Math.random() * 2.5,
    });
  }
  return particles;
}

const OnboardingV2Page = (): ReactElement => {
  const router = useRouter();
  const { showLogin } = useAuthContext();
  const { applyThemeMode } = useSettingsContext();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tagsReady, setTagsReady] = useState(false);
  const [feedVisible, setFeedVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelStageProgress, setPanelStageProgress] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [aiPrompt, setAiPrompt] = useState('');
  const [feedReadyState, setFeedReadyState] = useState(false);
  const [showExtensionPromo, setShowExtensionPromo] = useState(false);
  const [showSignupChooser, setShowSignupChooser] = useState(false);
  const [showGithubImportFlow, setShowGithubImportFlow] = useState(false);
  const [importFlowSource, setImportFlowSource] =
    useState<ImportFlowSource>('github');
  const [githubImportPhase, setGithubImportPhase] =
    useState<GithubImportPhase>('idle');
  const [githubImportProgress, setGithubImportProgress] = useState(0);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<
    keyof typeof UserExperienceLevel | null
  >(null);
  const [githubImportBodyHeight, setGithubImportBodyHeight] = useState<
    number | null
  >(null);
  const [githubImportExiting, setGithubImportExiting] = useState(false);
  const [signupContext, setSignupContext] = useState<
    'topics' | 'github' | 'ai' | 'manual' | null
  >(null);
  const [liveFloaters, setLiveFloaters] = useState<LiveFloater[]>([]);
  const floaterIdRef = useRef(0);
  const prevBodyOverflowRef = useRef('');
  const panelSentinelRef = useRef<HTMLDivElement>(null);
  const panelStageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const panelBoxRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);
  const githubImportTimerRef = useRef<number | null>(null);
  const githubResumeTimeoutRef = useRef<number | null>(null);
  const githubImportBodyContentRef = useRef<HTMLDivElement>(null);

  const popularFeedNameValue = useMemo(
    () => ({ feedName: SharedFeedPage.Popular as const }),
    [],
  );

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

  const clearGithubImportTimer = useCallback(() => {
    if (githubImportTimerRef.current === null) {
      return;
    }
    window.clearInterval(githubImportTimerRef.current);
    githubImportTimerRef.current = null;
  }, []);

  const clearGithubResumeTimeout = useCallback(() => {
    if (githubResumeTimeoutRef.current === null) {
      return;
    }
    window.clearTimeout(githubResumeTimeoutRef.current);
    githubResumeTimeoutRef.current = null;
  }, []);

  const startImportFlow = useCallback(
    (source: ImportFlowSource) => {
      clearGithubImportTimer();
      clearGithubResumeTimeout();
      setImportFlowSource(source);
      setSelectedExperienceLevel(null);
      setGithubImportProgress(10);
      setGithubImportPhase('running');
      setShowGithubImportFlow(true);
    },
    [clearGithubImportTimer, clearGithubResumeTimeout, setImportFlowSource],
  );

  const startGithubImportFlow = useCallback(() => {
    startImportFlow('github');
  }, [startImportFlow]);

  const closeGithubImportFlow = useCallback(() => {
    clearGithubImportTimer();
    clearGithubResumeTimeout();
    setShowGithubImportFlow(false);
    setGithubImportExiting(false);
    setSelectedExperienceLevel(null);
    setGithubImportProgress(0);
    setGithubImportPhase('idle');
    setImportFlowSource('github');
  }, [clearGithubImportTimer, clearGithubResumeTimeout]);

  const startAiProcessing = useCallback(() => {
    startImportFlow('ai');
  }, [startImportFlow]);

  const handleExperienceLevelSelect = useCallback(
    (level: keyof typeof UserExperienceLevel) => {
      if (githubImportPhase !== 'awaitingSeniority') {
        return;
      }

      clearGithubResumeTimeout();
      setSelectedExperienceLevel(level);
      setGithubImportProgress((prev) => Math.max(prev, 72));
      setGithubImportPhase('confirmingSeniority');

      githubResumeTimeoutRef.current = window.setTimeout(() => {
        setGithubImportPhase('finishing');
      }, 420);
    },
    [clearGithubResumeTimeout, githubImportPhase],
  );

  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    let idleTimer: number | null = null;
    let revealTimer: ReturnType<typeof setTimeout> | null = null;

    const revealTags = () => {
      revealTimer = setTimeout(() => setTagsReady(true), 180);
    };

    if ('requestIdleCallback' in window) {
      idleTimer = window.requestIdleCallback(revealTags, { timeout: 1400 });
    } else {
      revealTimer = setTimeout(() => setTagsReady(true), 1200);
    }

    return () => {
      if (idleTimer !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleTimer);
      }
      if (revealTimer !== null) {
        window.clearTimeout(revealTimer);
      }
    };
  }, [mounted]);

  useEffect(() => {
    const anyModalOpen =
      showSignupChooser ||
      showSignupPrompt ||
      showGithubImportFlow ||
      showExtensionPromo ||
      githubImportExiting;

    if (anyModalOpen) {
      prevBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevBodyOverflowRef.current;
      prevBodyOverflowRef.current = '';
    }
    return () => {
      document.body.style.overflow = prevBodyOverflowRef.current;
      prevBodyOverflowRef.current = '';
    };
  }, [
    showSignupChooser,
    showSignupPrompt,
    showGithubImportFlow,
    showExtensionPromo,
    githubImportExiting,
  ]);

  useEffect(() => {
    const onHeaderSignupClick = (event: MouseEvent) => {
      const { target } = event;
      if (!(target instanceof Element)) {
        return;
      }

      const trigger = target.closest('button, a');
      if (!(trigger instanceof HTMLElement)) {
        return;
      }

      // Intercept only top header signup actions on this page.
      if (!trigger.closest('header')) {
        return;
      }

      // Use a data attribute marker instead of brittle textContent matching.
      // LoginButton adds data-header-signup to the sign-up button.
      const isSignupTrigger = 'headerSignup' in trigger.dataset;

      if (!isSignupTrigger) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setShowSignupChooser(true);
    };

    document.addEventListener('click', onHeaderSignupClick, true);
    return () => {
      document.removeEventListener('click', onHeaderSignupClick, true);
    };
  }, []);

  // Parallax scroll: shift hero layers at different speeds
  useEffect(() => {
    if (!mounted) {
      return undefined;
    }

    // Keep intro order stable: hero settles before feed animates in.
    const timer = window.setTimeout(() => {
      setFeedVisible(true);
    }, 1400);

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
      document
        .querySelectorAll<HTMLElement>('.onb-feed-stage article')
        .forEach((article, i) => {
          if (!article.dataset.onbRevealDelay) {
            article.style.setProperty(
              '--reveal-delay',
              `${Math.min(i * 60, 400)}ms`,
            );
            // eslint-disable-next-line no-param-reassign
            article.dataset.onbRevealDelay = 'true';
          }

          if (article.classList.contains('onb-revealed')) {
            return;
          }

          observer.observe(article);
        });
    };

    observeFeedArticles();

    const mutationObserver = new MutationObserver((mutations) => {
      // Only re-observe when actual <article> elements (or wrappers containing
      // them) are added. This prevents a feedback loop with the engagement
      // animation, which appends <label>/<span> nodes inside articles —
      // those additions are ignored because they are not articles themselves.
      const hasNewArticles = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
          (node) =>
            node instanceof HTMLElement &&
            (node.tagName === 'ARTICLE' || node.querySelector('article')),
        ),
      );
      if (hasNewArticles) {
        observeFeedArticles();
      }
    });
    const feedContainer =
      document.querySelector('.onb-feed-stage') ?? document.body;
    // subtree: true is required — feed articles are nested several levels deep
    // inside .onb-feed-stage (inside a <main> wrapper), so childList-only
    // observation on the container itself never fires when articles load.
    // The callback above filters to article additions only, preventing the
    // feedback loop that previously occurred with the engagement animation.
    mutationObserver.observe(feedContainer, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.clearTimeout(timer);
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [mounted]);

  useEffect(() => {
    return () => {
      clearGithubImportTimer();
      clearGithubResumeTimeout();
    };
  }, [clearGithubImportTimer, clearGithubResumeTimeout]);

  useEffect(() => {
    if (!feedReadyState) {
      return undefined;
    }

    const redirectTimer = window.setTimeout(() => {
      router.replace('/');
    }, 5000);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [feedReadyState, router]);

  useEffect(() => {
    if (!showGithubImportFlow) {
      return undefined;
    }

    if (githubImportPhase !== 'running' && githubImportPhase !== 'finishing') {
      return undefined;
    }

    clearGithubImportTimer();

    githubImportTimerRef.current = window.setInterval(() => {
      setGithubImportProgress((prev) => {
        const increment = githubImportPhase === 'running' ? 2 : 3;
        const next = Math.min(100, prev + increment);

        if (githubImportPhase === 'running' && next >= 68) {
          clearGithubImportTimer();
          setGithubImportPhase('awaitingSeniority');
          return 68;
        }

        if (githubImportPhase === 'finishing' && next >= 100) {
          clearGithubImportTimer();
          setGithubImportPhase('complete');
          setTimeout(() => {
            setGithubImportExiting(true);
            setTimeout(() => {
              setShowGithubImportFlow(false);
              setGithubImportExiting(false);
              setShowExtensionPromo(true);
            }, 350);
          }, 600);
          return 100;
        }

        return next;
      });
    }, 120);

    return () => {
      clearGithubImportTimer();
    };
  }, [clearGithubImportTimer, githubImportPhase, showGithubImportFlow]);

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
      const start = viewportHeight * 0.86;
      const end = viewportHeight * 0.05;
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

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      return undefined;
    }

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

  // Cursor-tracking glow on personalization panel
  useEffect(() => {
    const box = panelBoxRef.current;
    if (!box) {
      return undefined;
    }

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
  useEffect(() => {
    const shouldRun =
      feedVisible &&
      !feedReadyState &&
      !showSignupChooser &&
      !showSignupPrompt &&
      !showGithubImportFlow &&
      !showExtensionPromo &&
      !githubImportExiting;
    if (!shouldRun) {
      return undefined;
    }

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      return undefined;
    }

    const timeouts = new Set<number>();
    const addTimeout = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        fn();
      }, delay);
      timeouts.add(id);
    };

    const getVisibleArticles = () => {
      return Array.from(
        document.querySelectorAll<HTMLElement>(
          '.onb-feed-stage article.onb-revealed:not([data-eng-active="true"])',
        ),
      ).filter((article) => {
        const rect = article.getBoundingClientRect();
        return rect.top > 100 && rect.bottom < window.innerHeight - 100;
      });
    };

    const getButtonWrapper = (article: Element, suffix: string) => {
      const btn = article.querySelector(`[id$="${suffix}"]`);
      return btn ? btn.closest('.btn-quaternary') || btn.parentElement : null;
    };

    const findCounter = (wrapper: Element) => {
      const spans = Array.from(wrapper.querySelectorAll('span'));
      return spans.find((s) => {
        const t = s.textContent?.trim();
        return t && /^[\d][.\dkKmM]*$/.test(t) && !s.querySelector('span');
      });
    };

    const ensureCounter = (wrapper: Element, seed: number) => {
      let counter = findCounter(wrapper);
      if (!counter) {
        const label = document.createElement('label');
        label.className =
          'flex cursor-pointer items-center pl-1 font-bold typo-callout';
        counter = document.createElement('span');
        counter.className =
          'flex h-5 min-w-[1ch] flex-col overflow-hidden tabular-nums typo-footnote';
        counter.textContent = String(seed);
        label.appendChild(counter);
        wrapper.appendChild(label);
      }
      return counter;
    };

    const formatCount = (n: number) => {
      if (n >= 1000000) {
        return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
      }
      if (n >= 1000) {
        return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
      }
      return String(n);
    };

    const parseCount = (text: string) => {
      const clean = text.trim().toLowerCase();
      if (/^\d+$/.test(clean)) {
        return parseInt(clean, 10);
      }
      const m = clean.match(/^([\d.]+)([km])$/);
      if (!m) {
        return null;
      }
      const n = parseFloat(m[1]);
      return m[2] === 'k' ? n * 1000 : n * 1000000;
    };

    const runStream = () => {
      const articles = getVisibleArticles();
      if (!articles.length) {
        addTimeout(runStream, 1000);
        return;
      }

      const article = articles[Math.floor(Math.random() * articles.length)];
      article.setAttribute('data-eng-active', 'true');

      const isUpvote = Math.random() < 0.7;
      const suffix = isUpvote ? '-upvote-btn' : '-comment-btn';
      const wrapper = getButtonWrapper(article, suffix);
      const btn = article.querySelector(`[id$="${suffix}"]`);

      if (!wrapper || !btn) {
        article.removeAttribute('data-eng-active');
        addTimeout(runStream, 500);
        return;
      }

      const wrapperEl = wrapper as HTMLElement;
      // Add CSS class instead of direct style mutation — the class provides
      // position:relative via the stylesheet without forcing a style recalculation.
      wrapperEl.classList.add('onb-eng-pos-relative');

      const counter = ensureCounter(
        wrapper,
        isUpvote
          ? 4 + Math.floor(Math.random() * 50)
          : 1 + Math.floor(Math.random() * 10),
      );

      const activeClass = isUpvote
        ? 'onb-eng-active-upvote'
        : 'onb-eng-active-comment';
      const color = isUpvote
        ? 'var(--theme-actions-upvote-default)'
        : 'var(--theme-actions-comment-default)';

      wrapperEl.classList.add(activeClass);

      const numIncrements = 2 + Math.floor(Math.random() * 5); // 2 to 6 increments
      const increments: number[] = [];
      for (let i = 0; i < numIncrements; i += 1) {
        const r = Math.random();
        if (r < 0.55) {
          increments.push(1 + Math.floor(Math.random() * 2));
        } // 1-2 (55%)
        else if (r < 0.85) {
          increments.push(3 + Math.floor(Math.random() * 4));
        } // 3-6 (30%)
        else {
          increments.push(7 + Math.floor(Math.random() * 12));
        } // 7-18 (15%)
      }

      let delayAcc = 0;

      increments.forEach((inc) => {
        addTimeout(() => {
          // Restart the pulse animation without reading layout (offsetWidth
          // forces a synchronous reflow). Setting animationName to 'none' is a
          // write-only style operation, then the next rAF restores it so the
          // animation re-runs from the start.
          btn.classList.remove('onb-eng-pulse');
          (btn as HTMLElement).style.animationName = 'none';
          requestAnimationFrame(() => {
            (btn as HTMLElement).style.animationName = '';
            btn.classList.add('onb-eng-pulse');
          });

          const currentVal = parseCount(counter.textContent || '') || 0;
          counter.textContent = formatCount(currentVal + inc);

          // Create floater via React state so it renders in a fixed-position
          // overlay rather than appending DOM nodes directly to the article.
          const counterRect = counter.getBoundingClientRect();
          floaterIdRef.current += 1;
          const newFloaterId = floaterIdRef.current;
          setLiveFloaters((prev) => [
            ...prev,
            {
              id: newFloaterId,
              text: `+${inc}`,
              color,
              x: counterRect.left + counterRect.width / 2,
              y: counterRect.top,
            },
          ]);
          addTimeout(() => {
            setLiveFloaters((prev) =>
              prev.filter((f) => f.id !== newFloaterId),
            );
          }, 2500);
        }, delayAcc);

        delayAcc += 350 + Math.random() * 650; // 0.35s to 1.0s between pops
      });

      addTimeout(() => {
        wrapperEl.classList.remove(activeClass);
        article.removeAttribute('data-eng-active');
      }, delayAcc + 600);

      // Schedule next stream on this "thread"
      addTimeout(runStream, delayAcc + 1000 + Math.random() * 1500);
    };

    // Start 4 concurrent streams for higher density
    addTimeout(runStream, 200);
    addTimeout(runStream, 800);
    addTimeout(runStream, 1500);
    addTimeout(runStream, 2200);

    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      // Clear any floaters that didn't finish their cleanup timer — they'd
      // persist indefinitely because their cleanup timeouts were just cancelled.
      setLiveFloaters([]);
    };
  }, [
    feedVisible,
    feedReadyState,
    showExtensionPromo,
    showGithubImportFlow,
    showSignupChooser,
    showSignupPrompt,
    githubImportExiting,
  ]);

  const recommendedTopics = useMemo(() => {
    if (!aiPrompt.trim()) {
      return [];
    }

    const lower = aiPrompt.toLowerCase();

    return SELECTABLE_TOPICS.map((topic) => {
      const labelLower = topic.label.toLowerCase();
      const keywords = labelLower.split(/[\s&/.+-]+/).filter(Boolean);
      const hasDirect = lower.includes(labelLower);
      const score = keywords.reduce(
        (acc, kw) => {
          if (kw.length < 3) {
            return acc;
          }
          return lower.includes(kw) ? acc + kw.length : acc;
        },
        hasDirect ? 100 : 0,
      );

      return { ...topic, score };
    })
      .filter((topic) => topic.score > 0 && !selectedTopics.has(topic.label))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [aiPrompt, selectedTopics]);

  const confettiParticles = useMemo(
    () => (feedReadyState ? buildConfettiParticles() : []),
    [feedReadyState],
  );
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        hero.classList.toggle('onb-hero-offscreen', !entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const [detectedBrowser, setDetectedBrowser] = useState(BrowserName.Chrome);
  useEffect(() => {
    setDetectedBrowser(getCurrentBrowserName());
  }, []);
  const isEdgeBrowser = detectedBrowser === BrowserName.Edge;
  const extensionImages =
    cloudinaryOnboardingExtension[
      isEdgeBrowser ? BrowserName.Edge : BrowserName.Chrome
    ];

  const dismissExtensionPromo = useCallback(() => {
    setShowExtensionPromo(false);
    setFeedReadyState(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const closeSignupChooser = useCallback(() => {
    setShowSignupChooser(false);
  }, []);
  const openLogin = useCallback(() => {
    showLogin({
      trigger: AuthTriggers.MainButton,
      options: { isLogin: true },
    });
  }, [showLogin]);
  const isAiSetupContext = signupContext === 'ai' || signupContext === 'manual';
  const canStartAiFlow = aiPrompt.trim().length > 0 || selectedTopics.size > 0;
  const startGithubFlowFromChooser = useCallback(() => {
    setShowSignupChooser(false);
    startGithubImportFlow();
  }, [startGithubImportFlow]);
  const startAiFlowFromChooser = useCallback(() => {
    if (!canStartAiFlow) {
      return;
    }
    setShowSignupChooser(false);
    startAiProcessing();
  }, [canStartAiFlow, startAiProcessing]);
  const startAiFlowFromSignup = useCallback(() => {
    if (!canStartAiFlow) {
      return;
    }
    setShowSignupPrompt(false);
    startAiProcessing();
  }, [canStartAiFlow, startAiProcessing]);

  const panelLift = Math.round(panelStageProgress * 60);
  const panelRevealOffset = panelVisible ? 40 : 120;
  const isAwaitingSeniorityInput = githubImportPhase === 'awaitingSeniority';
  const importSteps = useMemo(
    () =>
      importFlowSource === 'github' ? GITHUB_IMPORT_STEPS : AI_IMPORT_STEPS,
    [importFlowSource],
  );
  const currentImportStep = useMemo(() => {
    if (githubImportPhase === 'awaitingSeniority') {
      return 'Waiting for your seniority level';
    }
    if (githubImportPhase === 'confirmingSeniority') {
      return 'Applying your seniority level';
    }
    if (githubImportPhase === 'complete') {
      return 'Your feed is ready';
    }

    const upcomingStep = importSteps.find(
      (step) => githubImportProgress < step.threshold,
    );
    return upcomingStep?.label ?? 'Building personalized feed';
  }, [githubImportPhase, githubImportProgress, importSteps]);
  const githubImportBodyPhase = useMemo<GithubImportBodyPhase>(() => {
    if (
      githubImportPhase === 'running' ||
      githubImportPhase === 'finishing' ||
      githubImportPhase === 'confirmingSeniority' ||
      githubImportPhase === 'complete'
    ) {
      return 'checklist';
    }
    if (githubImportPhase === 'awaitingSeniority') {
      return 'seniority';
    }

    return 'default';
  }, [githubImportPhase]);

  useEffect(() => {
    if (githubImportBodyPhase === 'default') {
      setGithubImportBodyHeight(null);
      return undefined;
    }

    const contentNode = githubImportBodyContentRef.current;
    if (!contentNode) {
      return undefined;
    }

    const updateHeight = () => {
      setGithubImportBodyHeight(contentNode.getBoundingClientRect().height);
    };

    updateHeight();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(contentNode);

    return () => {
      resizeObserver.disconnect();
    };
  }, [githubImportBodyPhase]);

  return (
    <div className="onb-page relative" role="presentation">
      {/* ── Engagement floaters overlay (React-controlled, fixed position) ── */}
      {liveFloaters.length > 0 && (
        <div
          className="pointer-events-none fixed inset-0"
          style={{ zIndex: 9999 }}
          aria-hidden="true"
        >
          {liveFloaters.map((floater) => (
            <span
              key={floater.id}
              className="onb-eng-floater"
              style={{
                color: floater.color,
                left: floater.x,
                top: floater.y,
              }}
            >
              {floater.text}
            </span>
          ))}
        </div>
      )}
      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className={classNames(
          'onb-hero relative overflow-hidden py-2 tablet:py-8',
          feedReadyState && 'hidden',
        )}
        style={{ '--scroll-y': '0' } as React.CSSProperties}
      >
        <div className="z-10 relative mx-auto mb-3 flex w-full max-w-[63.75rem] items-center justify-between px-4 tablet:hidden">
          <Logo
            compact
            position={LogoPosition.Relative}
            className="!left-0 !top-0 !mt-0 !translate-x-0"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openLogin}
              className="rounded-10 border border-white/[0.14] bg-white/[0.02] px-3 py-1.5 text-text-secondary transition-colors duration-200 typo-footnote hover:bg-white/[0.08]"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setShowSignupChooser(true)}
              className="hover:opacity-90 rounded-10 bg-white px-3 py-1.5 font-semibold text-black transition-opacity duration-200 typo-footnote"
            >
              Sign up
            </button>
          </div>
        </div>
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
          <div className="onb-float-1 bg-accent-cabbage-default/30 absolute left-[15%] top-[20%] h-1 w-1 rounded-full" />
          <div className="onb-float-2 bg-accent-onion-default/20 absolute left-[75%] top-[15%] h-1.5 w-1.5 rounded-full" />
          <div className="onb-float-3 bg-accent-water-default/25 absolute left-[60%] top-[60%] h-1 w-1 rounded-full" />
          <div className="onb-float-1 bg-accent-cheese-default/20 absolute left-[25%] top-[70%] h-1 w-1 rounded-full" />
          <div className="onb-float-2 bg-accent-cabbage-default/20 absolute left-[85%] top-[45%] h-1 w-1 rounded-full" />
          <div className="onb-float-3 bg-white/20 absolute left-[40%] top-[30%] h-0.5 w-0.5 rounded-full" />
          {tagsReady &&
            RISING_TAGS_DESKTOP.map((tag) => (
              <span
                key={tag.label}
                className="onb-rising-tag absolute bottom-0 hidden whitespace-nowrap rounded-8 border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-text-quaternary typo-caption1 tablet:block"
                style={
                  {
                    left: tag.left,
                    '--tag-delay': tag.delay,
                    '--tag-duration': tag.duration,
                    '--tag-drift-x': `${tag.driftX}px`,
                  } as React.CSSProperties
                }
              >
                {tag.label}
              </span>
            ))}
        </div>

        {/* Single radial hero glow */}
        <div className="onb-hero-radial pointer-events-none absolute inset-x-0 top-0 h-[26rem]" />

        {/* Centered text content */}
        <div className="relative mx-auto max-w-[63.75rem] px-4 text-center laptop:px-6">
          <div className="pointer-events-none mb-1 hidden h-[1.5rem] tablet:block" />
          {/* Mobile-only rising tags */}
          <div
            className={classNames(
              'pointer-events-none relative mb-1 h-[1.5rem] overflow-hidden tablet:hidden',
            )}
          >
            {tagsReady &&
              RISING_TAGS_MOBILE.map((tag) => (
                <span
                  key={`mob-${tag.label}`}
                  className="onb-rising-tag absolute bottom-0 whitespace-nowrap rounded-8 border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-text-quaternary typo-caption2"
                  style={
                    {
                      left: tag.left,
                      '--tag-delay': tag.delay,
                      '--tag-duration': tag.duration,
                      '--tag-drift-x': `${tag.driftX}px`,
                    } as React.CSSProperties
                  }
                >
                  {tag.label}
                </span>
              ))}
          </div>

          {/* Headline */}
          <div
            className={classNames(
              'transition-all duration-700 ease-out',
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
            style={{ transitionDelay: '200ms' }}
          >
            <h1 className="mx-auto max-w-[20rem] font-bold leading-[1.12] tracking-tight typo-title1 tablet:max-w-[48rem] tablet:leading-[1.08] tablet:typo-mega1">
              <span className="text-text-primary">Join top dev community.</span>
              <br />
              <span className="onb-gradient-text bg-clip-text text-transparent">
                Build your feed identity.
              </span>
            </h1>
          </div>

          {/* Subtext */}
          <div
            className={classNames(
              'transition-all duration-700 ease-out',
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: '400ms' }}
          >
            <p
              className="mx-auto mt-4 max-w-[20rem] text-text-secondary typo-callout tablet:mt-5 tablet:max-w-[36rem] tablet:typo-body"
              style={{ lineHeight: '1.65' }}
            >
              Tap into live signals from the global dev community, then lock
              your feed to your stack with GitHub import or AI setup.
            </p>
          </div>

          {/* Hero CTA group */}
          <div
            className={classNames(
              'mt-7 transition-all duration-700 ease-out',
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="relative mx-auto flex w-full flex-col items-center justify-center gap-3 tablet:w-fit tablet:flex-row">
              <div className="onb-btn-glow pointer-events-none absolute -inset-3 rounded-20 bg-white/[0.06] blur-xl" />
              <button
                type="button"
                onClick={startGithubImportFlow}
                className="onb-btn-shine focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-7 py-3.5 font-bold text-black transition-all duration-300 typo-callout hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 tablet:w-auto"
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
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => openSignup('manual')}
                className="focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 font-bold text-text-primary backdrop-blur-md transition-all duration-300 typo-callout hover:-translate-y-1 hover:border-white/[0.22] hover:bg-white/[0.08] hover:shadow-[0_10px_35px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 tablet:w-auto"
              >
                <MagicIcon
                  secondary
                  size={IconSize.Size16}
                  className="text-text-primary"
                />
                Set up with AI
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-text-quaternary transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile-only bottom rising tags */}
          <div className="pointer-events-none relative mt-2 h-[2rem] overflow-hidden tablet:hidden">
            {tagsReady &&
              RISING_TAGS_MOBILE.map((tag) => (
                <span
                  key={`mob-bot-${tag.label}`}
                  className="onb-rising-tag absolute bottom-0 whitespace-nowrap rounded-8 border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-text-quaternary typo-caption2"
                  style={
                    {
                      left: `${100 - parseInt(tag.left, 10)}%`,
                      '--tag-delay': `${parseFloat(tag.delay) + 2}s`,
                      '--tag-duration': tag.duration,
                      '--tag-drift-x': `${-tag.driftX}px`,
                    } as React.CSSProperties
                  }
                >
                  {tag.label}
                </span>
              ))}
          </div>
        </div>
      </section>

      {/* ── Full-screen confetti (fixed, above everything) ── */}
      {feedReadyState && (
        <div className="onb-confetti-stage pointer-events-none fixed inset-0 z-[80] overflow-hidden">
          {confettiParticles.map((p) => {
            const sizeMap: Record<string, string> = {
              xl: 'h-4 w-2.5',
              lg: 'h-3 w-2',
              md: 'h-2.5 w-1.5',
            };
            const sizeClass = sizeMap[p.size] ?? 'h-2 w-1';
            const shapeMap: Record<string, string> = {
              circle: 'rounded-full',
              star: 'onb-confetti-star',
            };
            const shapeClass = shapeMap[p.shape] ?? 'rounded-[1px]';
            return (
              <span
                key={p.id}
                className={classNames(
                  'onb-confetti-piece absolute',
                  shapeClass,
                  sizeClass,
                  p.color,
                )}
                style={
                  {
                    left: p.left,
                    top: '-16px',
                    animationDelay: p.delay,
                    animationDuration: `${p.speed}s`,
                    '--confetti-drift': `${p.drift}px`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      )}

      {/* ── Feed Ready: Celebration Banner ── */}
      {feedReadyState && (
        <div className="onb-feed-ready-banner relative overflow-hidden pb-6 pt-8 tablet:pb-8 tablet:pt-12">
          {/* Radial burst glows — multi-layered */}
          <div className="onb-ready-burst bg-accent-cabbage-default/[0.14] pointer-events-none absolute left-1/2 top-0 h-[24rem] w-full max-w-[48rem] -translate-x-1/2 -translate-y-1/3 rounded-full blur-[120px]" />
          <div
            className="onb-ready-burst bg-accent-onion-default/[0.10] pointer-events-none absolute left-1/2 top-0 h-[16rem] w-full max-w-[28rem] -translate-x-1/2 -translate-y-1/4 rounded-full blur-[90px]"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="onb-ready-burst -translate-y-1/5 bg-accent-water-default/[0.08] pointer-events-none absolute left-1/2 top-0 h-[10rem] w-full max-w-[16rem] -translate-x-1/2 rounded-full blur-[60px]"
            style={{ animationDelay: '350ms' }}
          />

          {/* Sparkle accents */}
          {[
            { left: '15%', top: '18%', delay: '200ms', size: 12 },
            { left: '80%', top: '12%', delay: '500ms', size: 16 },
            { left: '25%', top: '65%', delay: '700ms', size: 10 },
            { left: '72%', top: '55%', delay: '400ms', size: 14 },
            { left: '50%', top: '8%', delay: '100ms', size: 18 },
            { left: '90%', top: '40%', delay: '600ms', size: 8 },
          ].map((s) => (
            <svg
              key={`sparkle-${s.left}-${s.top}`}
              className="onb-sparkle text-accent-cheese-default/60 pointer-events-none absolute"
              style={{ left: s.left, top: s.top, animationDelay: s.delay }}
              width={s.size}
              height={s.size}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41Z" />
            </svg>
          ))}

          <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 tablet:px-6">
            {/* Celebration icon with glow ring */}
            <div className="onb-ready-reveal relative mb-5">
              <div
                className="bg-accent-avocado-default/20 absolute inset-0 animate-ping rounded-full"
                style={{
                  animationDuration: '2s',
                  animationIterationCount: '2',
                }}
              />
              <div className="bg-accent-avocado-default/20 ring-accent-avocado-default/30 relative flex h-16 w-16 items-center justify-center rounded-full ring-2">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-accent-avocado-default"
                >
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.3"
                  />
                </svg>
              </div>
            </div>

            {/* Headline */}
            <h2
              className="onb-ready-reveal mb-2 text-center text-text-primary typo-title1"
              style={{ animationDelay: '120ms' }}
            >
              Your feed is ready
            </h2>
            <p
              className="onb-ready-reveal mb-7 text-center text-text-tertiary typo-body"
              style={{ animationDelay: '220ms' }}
            >
              Here&apos;s how to get the most out of daily.dev
            </p>

            {/* Action chips */}
            <div
              className="onb-ready-reveal flex flex-col items-stretch gap-3 tablet:flex-row tablet:flex-wrap tablet:items-center tablet:justify-center"
              style={{ animationDelay: '380ms' }}
            >
              {/* Install extension */}
              <button
                type="button"
                onClick={() =>
                  window.open(
                    downloadBrowserExtension,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
                className="hover:border-accent-cabbage-default/40 hover:bg-accent-cabbage-default/10 group flex items-center gap-2.5 rounded-14 border border-white/[0.10] bg-white/[0.06] px-5 py-3 transition-all duration-200"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-accent-cabbage-default"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-text-primary typo-callout">
                  Install extension
                </span>
              </button>

              {/* Get mobile app */}
              <button
                type="button"
                onClick={() =>
                  window.open(mobileAppUrl, '_blank', 'noopener,noreferrer')
                }
                className="hover:border-accent-onion-default/40 hover:bg-accent-onion-default/10 group flex items-center gap-2.5 rounded-14 border border-white/[0.10] bg-white/[0.06] px-5 py-3 transition-all duration-200"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-accent-onion-default"
                >
                  <rect
                    x="7"
                    y="2"
                    width="10"
                    height="20"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <line
                    x1="10"
                    y1="19"
                    x2="14"
                    y2="19"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-text-primary typo-callout">
                  Get mobile app
                </span>
              </button>

              {/* Enable notifications */}
              <button
                type="button"
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission();
                  }
                }}
                className="hover:border-accent-cheese-default/40 hover:bg-accent-cheese-default/10 group flex items-center gap-2.5 rounded-14 border border-white/[0.10] bg-white/[0.06] px-5 py-3 transition-all duration-200"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-accent-cheese-default"
                >
                  <path
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-text-primary typo-callout">
                  Enable notifications
                </span>
              </button>
            </div>

            {/* Go to feed */}
            <button
              type="button"
              onClick={() => router.replace('/')}
              className="onb-ready-reveal mt-6 flex items-center gap-2 rounded-12 bg-white/[0.08] px-5 py-2.5 text-text-secondary transition-all duration-200 typo-callout hover:bg-white/[0.14] hover:text-text-primary"
              style={{ animationDelay: '520ms' }}
            >
              Go to my feed
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Feed ── */}
      <div
        className={classNames(
          'onb-feed-stage min-h-[50vh] transition-[opacity,transform] duration-500 ease-out laptop:px-10',
          // eslint-disable-next-line no-nested-ternary
          feedReadyState
            ? 'onb-feed-unlocked translate-y-0 opacity-100'
            : feedVisible
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0',
        )}
      >
        <ActiveFeedNameContext.Provider value={popularFeedNameValue}>
          <MainFeedLayout feedName="popular" isSearchOn={false}>
            {/* Scroll sentinel — triggers panel at ~50% of feed */}
            <div ref={panelSentinelRef} className="pointer-events-none h-0" />

            {/* ── Personalization Panel ── */}
            <div
              ref={panelStageRef}
              className={classNames(
                'relative left-1/2 h-[42vh] w-screen -translate-x-1/2',
                feedReadyState && 'hidden',
              )}
            >
              <div className="sticky top-[50vh] -translate-y-1/2">
                {/* Dark gradient overlay — fades feed out progressively */}
                <div
                  className="onb-panel-fade from-background-default/0 pointer-events-none absolute inset-x-0 -top-[18rem] h-[40rem] bg-gradient-to-b via-background-default to-background-default transition-opacity duration-300"
                  style={{ opacity: panelVisible ? 1 : 0 }}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-[-12rem] h-[28rem] bg-background-default transition-opacity duration-300"
                  style={{ opacity: panelVisible ? 1 : 0 }}
                />

                <div
                  className={classNames(
                    'relative transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]',
                    panelVisible ? 'opacity-100' : 'onb-panel-hidden opacity-0',
                  )}
                  style={{
                    transform: `translateY(${panelRevealOffset - panelLift}px)`,
                  }}
                >
                  <div
                    ref={panelBoxRef}
                    className="onb-cursor-glow mx-auto mb-6 max-w-[48rem] px-4 pb-10 pt-12 tablet:mb-0 tablet:px-8 tablet:pt-20"
                  >
                    <div className="relative">
                      {/* Section title */}
                      <div
                        className={classNames(
                          'relative z-1 transition-all duration-700 ease-out',
                          panelVisible
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-6 opacity-0',
                        )}
                      >
                        <p className="mb-2 text-center text-white typo-body">
                          You just explored the global feed.
                        </p>
                        <h3 className="mb-10 text-center font-bold text-white typo-title1 tablet:typo-large-title">
                          Now build a feed that is truly yours
                        </h3>
                      </div>

                      {/* Two-path layout */}
                      <div className="relative z-1 flex flex-col gap-4 tablet:grid tablet:grid-cols-2 tablet:items-stretch tablet:gap-5">
                        {/* ── Path A: GitHub ── */}
                        <div
                          className={classNames(
                            'onb-glass flex h-full min-h-[24rem] flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:min-h-[26rem] tablet:self-stretch',
                            panelVisible
                              ? 'translate-y-0 opacity-100'
                              : 'translate-y-10 opacity-0',
                          )}
                          style={{ transitionDelay: '200ms' }}
                        >
                          {/* Animated orb — full-width energy field */}
                          <div
                            className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center"
                            style={{ width: 'calc(100% + 3rem)' }}
                          >
                            {/* Radial gradient from top center */}
                            <div
                              className="pointer-events-none absolute inset-0"
                              style={{
                                background:
                                  'radial-gradient(ellipse at 50% 0%, var(--theme-accent-cabbage-default) 0%, transparent 65%)',
                                opacity: 0.22,
                              }}
                            />
                            {/* Wide glow */}
                            <div className="ghub-orb-glow bg-accent-cabbage-default/15 pointer-events-none absolute h-32 w-52 rounded-full blur-3xl" />
                            {/* Outer ring */}
                            <svg
                              className="ghub-ring pointer-events-none absolute"
                              style={{ width: '11rem', height: '11rem' }}
                              viewBox="0 0 176 176"
                            >
                              <circle
                                cx="88"
                                cy="88"
                                r="84"
                                fill="none"
                                stroke="var(--theme-accent-cabbage-default)"
                                strokeWidth="1.5"
                                strokeDasharray="6 10"
                                opacity="0.18"
                              />
                            </svg>
                            {/* Middle ring */}
                            <svg
                              className="ghub-ring-reverse pointer-events-none absolute h-24 w-24"
                              viewBox="0 0 96 96"
                            >
                              <circle
                                cx="48"
                                cy="48"
                                r="44"
                                fill="none"
                                stroke="var(--theme-accent-cabbage-default)"
                                strokeWidth="1.5"
                                strokeDasharray="4 6"
                                opacity="0.35"
                              />
                            </svg>
                            {/* Inner ring */}
                            <svg
                              className="onb-ring-slow pointer-events-none absolute h-16 w-16"
                              viewBox="0 0 64 64"
                            >
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="var(--theme-accent-cabbage-default)"
                                strokeWidth="1"
                                strokeDasharray="3 5"
                                opacity="0.3"
                              />
                            </svg>
                            {/* Particles from far away */}
                            {[
                              {
                                px: '-6rem',
                                py: '-3.5rem',
                                dur: '3.0s',
                                delay: '0s',
                                color: 'bg-accent-cheese-default',
                              },
                              {
                                px: '5.5rem',
                                py: '-4rem',
                                dur: '3.4s',
                                delay: '0.5s',
                                color: 'bg-accent-water-default',
                              },
                              {
                                px: '-5rem',
                                py: '3.5rem',
                                dur: '3.2s',
                                delay: '1.0s',
                                color: 'bg-accent-cabbage-default',
                              },
                              {
                                px: '6rem',
                                py: '3rem',
                                dur: '3.6s',
                                delay: '1.5s',
                                color: 'bg-accent-onion-default',
                              },
                              {
                                px: '0.5rem',
                                py: '-5rem',
                                dur: '2.8s',
                                delay: '0.7s',
                                color: 'bg-accent-cheese-default',
                              },
                              {
                                px: '-6.5rem',
                                py: '0.5rem',
                                dur: '3.1s',
                                delay: '1.2s',
                                color: 'bg-accent-water-default',
                              },
                            ].map((p) => (
                              <span
                                key={`panel-ghub-${p.delay}`}
                                className={classNames(
                                  'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                                  p.color,
                                )}
                                style={
                                  {
                                    '--px': p.px,
                                    '--py': p.py,
                                    '--dur': p.dur,
                                    '--delay': p.delay,
                                    animationDelay: p.delay,
                                  } as React.CSSProperties
                                }
                              />
                            ))}
                            {/* Center icon with pulse */}
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                              <svg
                                width="26"
                                height="26"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="text-text-primary"
                              >
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                              </svg>
                            </div>
                          </div>

                          <h4 className="mb-1.5 break-words text-center font-bold text-text-primary typo-body">
                            One-click setup
                          </h4>
                          <p className="mb-5 text-center text-text-tertiary typo-footnote">
                            Connect GitHub and let our AI do the rest.
                          </p>

                          <div className="mb-5 flex w-full flex-col gap-3">
                            {[
                              {
                                text: 'We spot your stack from GitHub',
                                icon: 'stack',
                              },
                              {
                                text: 'AI matches your skills to topics',
                                icon: 'ai',
                              },
                              {
                                text: 'Your feed is ready in seconds',
                                icon: 'feed',
                              },
                            ].map(({ text, icon }) => (
                              <div
                                key={text}
                                className="flex items-center gap-2"
                              >
                                <span
                                  className={classNames(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                                    icon === 'stack' &&
                                      'bg-accent-avocado-default/20 text-accent-avocado-default',
                                    icon === 'ai' &&
                                      'bg-accent-cheese-default/20 text-accent-cheese-default',
                                    icon === 'feed' &&
                                      'bg-accent-water-default/20 text-accent-water-default',
                                  )}
                                >
                                  {icon === 'stack' && (
                                    <TerminalIcon
                                      size={IconSize.Size16}
                                      secondary
                                    />
                                  )}
                                  {icon === 'ai' && (
                                    <MagicIcon
                                      size={IconSize.Size16}
                                      secondary
                                    />
                                  )}
                                  {icon === 'feed' && (
                                    <NewTabIcon
                                      size={IconSize.Size16}
                                      secondary
                                    />
                                  )}
                                </span>
                                <span className="text-left text-text-primary typo-footnote">
                                  {text}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="bg-border-subtlest-tertiary/30 mb-5 h-px w-full" />

                          <div className="relative mt-auto w-full pt-4">
                            <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                            <button
                              type="button"
                              onClick={startGithubImportFlow}
                              className="onb-btn-shine focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-5 py-3.5 font-bold text-black transition-all duration-300 typo-callout hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2"
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
                                <path
                                  d="M5 12h14M12 5l7 7-7 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                          <p className="mt-2.5 text-text-quaternary typo-caption2">
                            Read-only access &middot; No special permissions
                          </p>
                        </div>

                        {/* ── Path B: Manual ── */}
                        <div className="onb-glass flex h-full min-h-[24rem] flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:min-h-[26rem] tablet:self-stretch">
                          {/* Static icon zone */}
                          <div
                            className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center"
                            style={{ width: 'calc(100% + 3rem)' }}
                          >
                            {/* Radial gradient from top center */}
                            <div
                              className="pointer-events-none absolute inset-0"
                              style={{
                                background:
                                  'radial-gradient(ellipse at 50% 0%, var(--theme-accent-onion-default) 0%, transparent 65%)',
                                opacity: 0.22,
                              }}
                            />
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                              <MagicIcon
                                secondary
                                size={IconSize.Small}
                                className="text-white"
                              />
                            </div>
                          </div>

                          <h4 className="mb-1.5 break-words text-center font-bold text-text-primary typo-body">
                            Tell our AI about yourself
                          </h4>
                          <p className="mb-5 text-center text-text-tertiary typo-footnote">
                            Describe your stack and let AI build your feed.
                          </p>

                          {/* Textarea */}
                          <div className="onb-textarea-glow mb-3 w-full rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 focus-within:border-white/[0.18] focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_28px_rgba(0,0,0,0.3)] hover:border-white/[0.06] hover:bg-white/[0.02] hover:shadow-none">
                            <textarea
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key !== 'Enter' || e.shiftKey) {
                                  return;
                                }
                                e.preventDefault();
                                if (aiPrompt.trim()) {
                                  startAiProcessing();
                                }
                              }}
                              rows={4}
                              placeholder="I'm a frontend engineer working with React and TypeScript. Interested in system design, AI tooling..."
                              className="min-h-[6.25rem] w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary transition-colors duration-200 typo-callout placeholder:text-text-quaternary focus:outline-none focus:placeholder:text-text-disabled"
                            />
                          </div>

                          {/* Selected chips */}
                          {selectedTopics.size > 0 && (
                            <div className="mb-3 flex w-full flex-wrap gap-1.5">
                              {Array.from(selectedTopics).map((topic) => (
                                <button
                                  key={`sel-${topic}`}
                                  type="button"
                                  onClick={() => toggleTopic(topic)}
                                  className={classNames(
                                    'onb-chip-enter inline-flex items-center gap-1.5 rounded-8 border px-2.5 py-1 font-medium shadow-[0_0_12px_rgba(255,255,255,0.04)] transition-all duration-200 typo-caption1 hover:bg-white/[0.14] hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] focus-visible:outline-none active:scale-[0.96]',
                                    TOPIC_SELECTED_STYLES,
                                  )}
                                >
                                  {topic}
                                  <span className="text-text-quaternary">
                                    &times;
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Matched tags */}
                          <div
                            className={classNames(
                              'duration-400 w-full overflow-hidden transition-all ease-out',
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
                                  className="onb-chip-enter border-border-subtlest-tertiary/40 rounded-8 border px-2.5 py-1 text-text-tertiary transition-all duration-200 typo-caption1 hover:bg-white/[0.06] hover:text-text-secondary focus-visible:outline-none active:scale-[0.97]"
                                >
                                  + {label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Build feed CTA — disabled when no input */}
                          <div className="relative mt-auto w-full pt-4">
                            <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                            <button
                              type="button"
                              disabled={
                                !aiPrompt.trim() && selectedTopics.size === 0
                              }
                              onClick={() => startAiProcessing()}
                              className={classNames(
                                'focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 px-5 py-3.5 font-bold transition-all duration-300 typo-callout focus-visible:outline-none focus-visible:ring-2',
                                aiPrompt.trim() || selectedTopics.size > 0
                                  ? 'bg-white text-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]'
                                  : 'cursor-not-allowed bg-white/[0.08] text-text-disabled',
                              )}
                            >
                              <MagicIcon
                                secondary
                                size={IconSize.Size16}
                                className="transition-transform duration-300 group-hover:translate-x-0.5"
                              />
                              Generate my feed with AI
                            </button>
                          </div>
                          <p className="mt-2.5 text-text-quaternary typo-caption2">
                            AI-powered &middot; instant personalization
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer links for SEO — placed at the bottom of the page */}
            {!feedReadyState && (
              <div className="relative z-1 mx-auto mt-20 flex w-full max-w-[48rem] justify-center px-5 pb-8 mobileL:px-6 tablet:mt-14">
                <FooterLinks className="mx-auto w-full max-w-[21rem] justify-center px-1 text-center typo-caption2 tablet:max-w-none tablet:typo-footnote" />
              </div>
            )}
          </MainFeedLayout>
        </ActiveFeedNameContext.Provider>
      </div>

      {/* ── CSS: feed limit, article fade, marquee, sidebar disable ── */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(n + 19) {
          display: none !important;
        }
        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(18) ~ div {
          display: none !important;
        }
        .onb-hero .onb-float-1,
        .onb-hero .onb-float-2,
        .onb-hero .onb-float-3 {
          transform: translateY(calc(var(--scroll-y) * -0.15px));
        }
        .onb-feed-stage > main[class*='utilities_feedPage'] {
          padding-top: 0 !important;
        }

        /* fade-out handled by .onb-revealed nth-of-type rules below */

        /* ─── HERO PARALLAX ─── */
        .onb-hero {
          --scroll-y: 0;
          contain: content;
        }

        /* ─── HERO RADIAL GLOW ─── */
        @keyframes onb-hero-radial-breathe {
          0%,
          100% {
            opacity: 0.9;
            transform: scale(1) translateY(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.04) translateY(-2%);
          }
        }
        .onb-hero .onb-hero-radial {
          background: radial-gradient(
            ellipse 80% 55% at 50% 0%,
            rgba(255, 255, 255, 0.065) 0%,
            rgba(255, 255, 255, 0.035) 28%,
            rgba(255, 255, 255, 0.015) 48%,
            transparent 74%
          );
          animation: onb-hero-radial-breathe 12s ease-in-out infinite;
          will-change: opacity, transform;
          transform: translateY(calc(var(--scroll-y) * -0.05px));
        }

        .onb-hero .onb-dot-grid {
          transform: translateY(calc(var(--scroll-y) * 0.04px));
          opacity: calc(1 - var(--scroll-y) * 0.001);
        }

        /* ─── RISING TAG CLOUD ─── */
        @keyframes onb-tag-rise {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.88);
          }
          6% {
            opacity: 0.6;
            transform: translate3d(calc(var(--tag-drift-x, 0px) * 0.1), -6vh, 0)
              scale(0.95);
          }
          40% {
            opacity: 0.45;
            transform: translate3d(
                calc(var(--tag-drift-x, 0px) * 0.55),
                -28vh,
                0
              )
              scale(1);
          }
          75% {
            opacity: 0.15;
            transform: translate3d(
                calc(var(--tag-drift-x, 0px) * 0.85),
                -52vh,
                0
              )
              scale(1.01);
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--tag-drift-x, 0px), -70vh, 0)
              scale(1.02);
          }
        }
        .onb-rising-tag {
          opacity: 0;
          animation: onb-tag-rise var(--tag-duration, 14s) ease-out infinite;
          animation-delay: var(--tag-delay, 0s);
          contain: layout style;
        }

        /* ─── SHIMMER ─── */
        .onb-shimmer {
          position: relative;
          overflow: hidden;
        }
        .onb-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.06) 50%,
            transparent 100%
          );
          animation: onb-shimmer 2.4s ease-in-out infinite;
        }
        @keyframes onb-shimmer {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        /* ─── RING ANIMATIONS ─── */
        @keyframes onb-ring-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .onb-ring-spin {
          animation: onb-ring-spin 12s linear infinite;
        }
        .onb-ring-spin-reverse {
          animation: onb-ring-spin 18s linear infinite reverse;
        }

        @keyframes onb-ring-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        .onb-ring-pulse {
          animation: onb-ring-pulse 3s ease-in-out infinite;
        }

        /* ─── CTA GLOW ─── */
        @keyframes onb-cta-glow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        .onb-feed-stage:not(.onb-feed-unlocked) article.onb-revealed {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
        }
        .onb-feed-stage:not(.onb-feed-unlocked) article.onb-revealed:hover {
          transform: translateY(0) scale(1) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.03) !important;
          border-color: rgba(255, 255, 255, 0.06) !important;
        }

        /* ─── CHIP POP ─── */
        @keyframes onb-chip-pop {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          60% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .onb-chip-enter {
          animation: onb-chip-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        /* ─── FLOATING PARTICLES ─── */
        @keyframes onb-float-1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(12px, -18px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translate(-8px, -30px) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translate(16px, -12px) scale(1.1);
            opacity: 0.5;
          }
        }
        @keyframes onb-float-2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          33% {
            transform: translate(-16px, -22px) scale(1.3);
            opacity: 0.5;
          }
          66% {
            transform: translate(10px, -35px) scale(0.8);
            opacity: 0.3;
          }
        }
        @keyframes onb-float-3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.25;
          }
          40% {
            transform: translate(20px, -14px) scale(1.15);
            opacity: 0.55;
          }
          80% {
            transform: translate(-12px, -28px) scale(0.85);
            opacity: 0.2;
          }
        }
        .onb-float-1 {
          animation: onb-float-1 14s ease-in-out infinite;
        }
        .onb-float-2 {
          animation: onb-float-2 18s ease-in-out infinite;
        }
        .onb-float-3 {
          animation: onb-float-3 22s ease-in-out infinite;
        }

        /* ─── GRADIENT TEXT SHIMMER ─── */
        @keyframes onb-gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .onb-gradient-text {
          background-image: linear-gradient(
            90deg,
            var(--theme-accent-cabbage-default) 0%,
            var(--theme-accent-onion-default) 30%,
            var(--theme-accent-water-default) 60%,
            var(--theme-accent-cabbage-default) 100%
          );
          background-size: 200% auto;
          animation: onb-gradient-shift 10s ease-in-out infinite;
        }

        /* ─── BUTTON SHINE SWEEP ─── */
        .onb-btn-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transition: left 0.6s ease;
        }
        .onb-btn-shine:hover::after {
          left: 120%;
        }

        /* ─── BUTTON GLOW BREATHING ─── */
        @keyframes onb-btn-breathe {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        .onb-btn-glow {
          animation: onb-btn-breathe 3s ease-in-out infinite;
        }

        /* ─── GITHUB IMPORT FLOW ─── */

        /* Orb: breathing glow behind the icon */
        @keyframes ghub-orb-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.75;
          }
        }
        .ghub-orb-glow {
          animation: ghub-orb-breathe 2.6s ease-in-out infinite;
        }

        /* Rings that rotate around the orb */
        @keyframes ghub-ring-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .ghub-ring {
          animation: ghub-ring-spin 8s linear infinite;
        }
        .ghub-ring-reverse {
          animation: ghub-ring-spin 12s linear infinite reverse;
        }
        .onb-ring-slow {
          animation: ghub-ring-spin 18s linear infinite;
        }

        /* Particles that fly toward the orb center */
        @keyframes ghub-particle-in {
          0% {
            transform: translate(var(--px), var(--py)) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 0.9;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
        }
        .ghub-particle {
          animation: ghub-particle-in var(--dur) ease-in infinite;
          animation-delay: var(--delay);
        }

        /* Step checklist fade-in */
        @keyframes ghub-step-in {
          from {
            transform: translateY(0.375rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .ghub-step-reveal {
          animation: ghub-step-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .ghub-orb-paused {
          animation-play-state: paused !important;
        }
        @keyframes ghub-question-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }
        .ghub-question-pulse {
          animation: ghub-question-pulse 1.8s ease-in-out infinite;
        }

        /* Confetti for completion */
        @keyframes ghub-confetti {
          0% {
            transform: translateY(-0.625rem) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateY(4rem) rotate(260deg);
            opacity: 0;
          }
        }
        .ghub-confetti {
          animation: ghub-confetti 1.6s ease-out infinite;
        }

        /* ─── FEED READY CELEBRATIONS ─── */
        @keyframes onb-confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          25% {
            opacity: 0.95;
          }
          75% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(110vh) translateX(var(--confetti-drift, 0px))
              rotate(960deg) scale(0.2);
            opacity: 0;
          }
        }
        .onb-confetti-piece {
          animation: onb-confetti-fall 4s cubic-bezier(0.22, 0.61, 0.36, 1)
            forwards;
          filter: brightness(1.2);
        }
        .onb-confetti-star {
          clip-path: polygon(
            50% 0%,
            61% 35%,
            98% 35%,
            68% 57%,
            79% 91%,
            50% 70%,
            21% 91%,
            32% 57%,
            2% 35%,
            39% 35%
          );
        }
        @keyframes onb-confetti-stage-fade {
          0%,
          85% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .onb-confetti-stage {
          animation: onb-confetti-stage-fade 6s ease-out forwards;
        }

        @keyframes onb-ready-burst {
          0% {
            transform: translate(-50%, -33%) scale(0.4);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          60% {
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -33%) scale(1.2);
            opacity: 0;
          }
        }
        .onb-ready-burst {
          animation: onb-ready-burst 2.5s ease-out forwards;
        }

        @keyframes onb-ready-reveal {
          0% {
            transform: translateY(16px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .onb-ready-reveal {
          opacity: 0;
          animation: onb-ready-reveal 0.6s ease-out forwards;
        }

        @keyframes onb-celebration-sparkle {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          30% {
            transform: scale(1.2) rotate(90deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(180deg);
            opacity: 0;
          }
        }
        .onb-sparkle {
          animation: onb-celebration-sparkle 1.2s ease-out forwards;
        }

        .onb-feed-unlocked article {
          opacity: 1 !important;
          transform: none !important;
          pointer-events: auto !important;
        }

        /* ─── AI PROCESSING ORB ─── */
        @keyframes onb-ai-orb-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.6;
          }
        }
        .onb-ai-orb-glow {
          animation: onb-ai-orb-breathe 2.5s ease-in-out infinite;
        }
        @keyframes onb-ai-ring-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .onb-ai-ring {
          animation: onb-ai-ring-spin 10s linear infinite;
        }
        .onb-ai-ring-reverse {
          animation: onb-ai-ring-spin 7s linear infinite reverse;
        }

        /* ─── AI ICON GLOW ─── */
        @keyframes onb-ai-shimmer {
          0%,
          100% {
            box-shadow: 0 0 8px
                color-mix(
                  in srgb,
                  var(--theme-accent-onion-default) 15%,
                  transparent
                ),
              0 0 20px
                color-mix(
                  in srgb,
                  var(--theme-accent-onion-default) 5%,
                  transparent
                );
          }
          50% {
            box-shadow: 0 0 14px
                color-mix(
                  in srgb,
                  var(--theme-accent-onion-default) 25%,
                  transparent
                ),
              0 0 32px
                color-mix(
                  in srgb,
                  var(--theme-accent-onion-default) 10%,
                  transparent
                );
          }
        }
        .onb-ai-icon-glow {
          animation: onb-ai-shimmer 3s ease-in-out infinite;
        }

        /* ─── MODAL EXIT ─── */
        @keyframes onb-modal-out {
          from {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          to {
            transform: scale(0.92) translateY(16px);
            opacity: 0;
          }
        }
        .onb-modal-exit {
          animation: onb-modal-out 0.35s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        @keyframes onb-modal-backdrop-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .onb-modal-backdrop-exit {
          animation: onb-modal-backdrop-out 0.3s ease-in forwards;
        }

        /* ─── EXTENSION PROMO ─── */
        @keyframes onb-ext-enter {
          from {
            transform: scale(0.94) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .onb-ext-enter {
          animation: onb-ext-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes onb-ext-reveal {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .onb-ext-reveal {
          opacity: 0;
          animation: onb-ext-reveal 0.4s ease-out forwards;
        }

        @keyframes onb-ext-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .onb-ext-float {
          animation: onb-ext-float 5s ease-in-out infinite;
        }

        @keyframes onb-cta-shimmer {
          0% {
            transform: translateX(-130%) skewX(-20deg);
          }
          100% {
            transform: translateX(230%) skewX(-20deg);
          }
        }
        .onb-cta-shimmer {
          position: relative;
          overflow: hidden;
        }
        .onb-cta-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.18) 50%,
            transparent 100%
          );
          animation: onb-cta-shimmer 3.5s ease-in-out infinite;
          animation-delay: 1.2s;
          pointer-events: none;
        }

        @keyframes onb-accent-draw {
          from {
            transform: scaleX(0);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        .onb-accent-draw {
          transform-origin: center;
          animation: onb-accent-draw 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s
            both;
        }

        /* ─── PANEL FADE: progressive blur + dark overlay ─── */
        .onb-panel-fade {
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.35) 15%,
            rgba(0, 0, 0, 0.82) 35%,
            black 55%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.35) 15%,
            rgba(0, 0, 0, 0.82) 35%,
            black 55%
          );
        }
        .onb-feed-stage {
          content-visibility: auto;
          contain-intrinsic-size: 1px 1800px;
          contain: content;
        }
        /* ─── GLASSMORPHISM ─── */
        .onb-glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background 0.35s ease, border-color 0.35s ease,
            box-shadow 0.35s ease;
        }
        .onb-glass:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.04);
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
          background: radial-gradient(
            circle,
            color-mix(
                in srgb,
                var(--theme-accent-onion-default) 6%,
                transparent
              )
              0%,
            transparent 70%
          );
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }
        .onb-cursor-glow:hover::before {
          opacity: 1;
        }

        .onb-eng-active-upvote,
        .onb-eng-active-upvote svg,
        .onb-eng-active-upvote span {
          color: var(--theme-actions-upvote-default) !important;
        }
        .onb-eng-active-comment,
        .onb-eng-active-comment svg,
        .onb-eng-active-comment span {
          color: var(--theme-actions-comment-default) !important;
        }

        .onb-eng-pulse {
          animation: onb-eng-pulse-anim 0.3s
            cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes onb-eng-pulse-anim {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.25);
          }
          100% {
            transform: scale(1);
          }
        }

        /* position and bottom are now handled via inline styles in the React
           fixed overlay; only the visual/animation properties live here. */
        .onb-eng-pos-relative {
          position: relative;
        }
        .onb-eng-floater {
          position: absolute;
          font-size: 0.875rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          pointer-events: none;
          z-index: 20;
          animation: onb-eng-float-anim 2.5s ease-out forwards;
          text-shadow: 0 2px 10px
            color-mix(in srgb, currentColor 40%, transparent);
        }
        @keyframes onb-eng-float-anim {
          0% {
            transform: translateX(-50%) translateY(10px) scale(0.5);
            opacity: 0;
          }
          10% {
            transform: translateX(-50%) translateY(-2px) scale(1.2);
            opacity: 1;
          }
          80% {
            transform: translateX(-50%) translateY(-28px) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translateX(-50%) translateY(-36px) scale(0.8);
            opacity: 0;
          }
        }

        /* ─── MODAL CHECKLIST STAGGER ─── */
        @keyframes onb-check-in {
          from {
            transform: translateX(-8px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .onb-check-item {
          animation: onb-check-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* ─── MODAL ENTRANCE ─── */
        @keyframes onb-modal-in {
          from {
            transform: scale(0.92) translateY(16px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .onb-modal-enter {
          animation: onb-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes onb-modal-backdrop-in {
          from {
            opacity: 0;
            backdrop-filter: blur(0);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }
        .onb-modal-backdrop {
          animation: onb-modal-backdrop-in 0.3s ease-out both;
          contain: content;
        }
        .onb-modal-enter.onb-glass {
          background: rgba(10, 12, 16, 0.9);
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.62);
        }

        /* ─── FEED ARTICLE SCROLL-REVEAL ─── */
        .onb-feed-stage:not(.onb-feed-unlocked) article {
          opacity: 0;
          transform: translateY(0.75rem) scale(0.995);
          transition: opacity 0.38s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease,
            border-color 0.25s ease !important;
          transition-delay: var(--reveal-delay, 0ms);
        }

        /* ─── FEED FADE-OUT GRADIENT (bottom of visible articles) ─── */
        .onb-feed-stage:not(.onb-feed-unlocked)
          article:nth-of-type(13).onb-revealed {
          opacity: 0.88 !important;
        }
        .onb-feed-stage:not(.onb-feed-unlocked)
          article:nth-of-type(14).onb-revealed {
          opacity: 0.72 !important;
        }
        .onb-feed-stage:not(.onb-feed-unlocked)
          article:nth-of-type(15).onb-revealed {
          opacity: 0.52 !important;
        }
        .onb-feed-stage:not(.onb-feed-unlocked)
          article:nth-of-type(16).onb-revealed {
          opacity: 0.32 !important;
        }
        .onb-feed-stage:not(.onb-feed-unlocked)
          article:nth-of-type(17).onb-revealed {
          opacity: 0.15 !important;
        }
        .onb-feed-stage:not(.onb-feed-unlocked)
          article:nth-of-type(18).onb-revealed {
          opacity: 0.05 !important;
        }

        @media (max-width: 63.9375rem) {
          .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(n + 11) {
            display: none !important;
          }
          .onb-feed-stage:not(.onb-feed-unlocked)
            article:nth-of-type(10)
            ~ div {
            display: none !important;
          }

          .onb-feed-stage:not(.onb-feed-unlocked) article.onb-revealed:hover {
            box-shadow: none !important;
          }

          .onb-feed-stage:not(.onb-feed-unlocked)
            article:nth-of-type(7).onb-revealed {
            opacity: 0.88 !important;
          }
          .onb-feed-stage:not(.onb-feed-unlocked)
            article:nth-of-type(8).onb-revealed {
            opacity: 0.65 !important;
          }
          .onb-feed-stage:not(.onb-feed-unlocked)
            article:nth-of-type(9).onb-revealed {
            opacity: 0.38 !important;
          }
          .onb-feed-stage:not(.onb-feed-unlocked)
            article:nth-of-type(10).onb-revealed {
            opacity: 0.12 !important;
          }
        }

        /* ─── TOPIC PILLS (no interaction) ─── */
        .onb-marquee span {
          pointer-events: none;
        }

        /* ─── SCROLL PROGRESS LINE ─── */
        @keyframes onb-progress-glow {
          0%,
          100% {
            box-shadow: 0 0 6px 1px
              color-mix(
                in srgb,
                var(--theme-accent-onion-default) 30%,
                transparent
              );
          }
          50% {
            box-shadow: 0 0 12px 2px
              color-mix(
                in srgb,
                var(--theme-accent-onion-default) 50%,
                transparent
              );
          }
        }

        /* mobile rising tags already handled by .onb-rising-tag */

        /* ─── MOBILE MODAL SLIDE-UP ─── */
        @keyframes onb-modal-slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes onb-modal-slide-down {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }
        @media (max-width: 655px) {
          .onb-modal-enter,
          .onb-ext-enter {
            animation: onb-modal-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)
              both;
          }
          .onb-modal-exit {
            animation: onb-modal-slide-down 0.3s cubic-bezier(0.4, 0, 1, 1)
              forwards;
          }
        }
        @media (max-width: 63.9375rem) {
          .onb-panel-fade {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
        }

        /* ─── OFF-SCREEN ANIMATION PAUSING ─── */
        .onb-hero-offscreen .onb-rising-tag,
        .onb-hero-offscreen .onb-hero-radial,
        .onb-hero-offscreen .onb-float-1,
        .onb-hero-offscreen .onb-float-2,
        .onb-hero-offscreen .onb-float-3,
        .onb-hero-offscreen .onb-gradient-text,
        .onb-hero-offscreen .onb-btn-glow {
          animation-play-state: paused !important;
        }
        .onb-hero-offscreen .onb-hero-radial,
        .onb-hero-offscreen .onb-rising-tag {
          will-change: auto !important;
        }

        .onb-panel-hidden .ghub-orb-glow,
        .onb-panel-hidden .ghub-ring,
        .onb-panel-hidden .ghub-ring-reverse,
        .onb-panel-hidden .onb-ring-slow,
        .onb-panel-hidden .ghub-particle,
        .onb-panel-hidden .onb-ai-orb-glow,
        .onb-panel-hidden .onb-ai-ring,
        .onb-panel-hidden .onb-ai-ring-reverse,
        .onb-panel-hidden .onb-btn-glow {
          animation-play-state: paused !important;
        }

        /* ─── CSS CONTAINMENT FOR ANIMATION CONTAINERS ─── */
        .onb-hero .onb-float-1,
        .onb-hero .onb-float-2,
        .onb-hero .onb-float-3,
        .ghub-particle,
        .onb-confetti-piece {
          contain: layout style;
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
          .onb-hero-radial,
          .onb-btn-glow,
          .onb-modal-enter,
          .onb-modal-exit,
          .onb-modal-backdrop,
          .onb-modal-backdrop-exit,
          .ghub-orb-glow,
          .ghub-ring,
          .ghub-ring-reverse,
          .ghub-particle,
          .ghub-confetti,
          .onb-confetti-piece,
          .onb-confetti-stage,
          .onb-ready-burst,
          .onb-ready-reveal,
          .onb-ai-orb-glow,
          .onb-ai-ring,
          .onb-ai-ring-reverse,
          .onb-ai-icon-glow,
          .onb-ring-slow,
          .onb-ext-enter,
          .onb-ext-reveal,
          .onb-sparkle,
          .onb-confetti-star,
          .onb-eng-pulse,
          .onb-eng-floater,
          .onb-rising-tag {
            animation: none !important;
            opacity: 1 !important;
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

      {/* ── Header signup chooser popup ── */}
      {showSignupChooser && (
        <div
          className="fixed inset-0 z-modal flex items-end tablet:items-center tablet:justify-center tablet:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Choose personalization setup"
        >
          <div
            className="onb-modal-backdrop bg-black/80 absolute inset-0 backdrop-blur-lg"
            onClick={closeSignupChooser}
            role="presentation"
          />

          <div className="onb-modal-enter onb-glass relative z-1 flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-24 border border-white/[0.08] bg-background-default shadow-[0_32px_90px_rgba(0,0,0,0.58)] tablet:max-w-[58rem] tablet:rounded-24">
            <button
              type="button"
              onClick={closeSignupChooser}
              className="z-10 absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
              aria-label="Close"
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

            <div className="px-4 pb-5 pt-8 tablet:px-8 tablet:pb-8">
              <div className="mb-6 text-center tablet:mb-8">
                <p className="mb-2 text-text-secondary typo-body">
                  Stay up to date, level up with the community, and unlock more.
                </p>
                <h3 className="font-bold text-text-primary typo-title2">
                  Build your developer identity
                </h3>
              </div>

              <div className="relative z-1 grid gap-4 tablet:grid-cols-2 tablet:items-stretch tablet:gap-5">
                {/* ── Path A: GitHub ── */}
                <div className="onb-glass flex h-full min-h-[24rem] flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:min-h-[26rem] tablet:self-stretch">
                  {/* Animated orb — full-width energy field */}
                  <div
                    className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center"
                    style={{ width: 'calc(100% + 3rem)' }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(ellipse at 50% 0%, var(--theme-accent-cabbage-default) 0%, transparent 65%)',
                        opacity: 0.22,
                      }}
                    />
                    <div className="ghub-orb-glow bg-accent-cabbage-default/15 pointer-events-none absolute h-32 w-52 rounded-full blur-3xl" />
                    <svg
                      className="ghub-ring pointer-events-none absolute"
                      style={{ width: '11rem', height: '11rem' }}
                      viewBox="0 0 176 176"
                    >
                      <circle
                        cx="88"
                        cy="88"
                        r="84"
                        fill="none"
                        stroke="var(--theme-accent-cabbage-default)"
                        strokeWidth="1.5"
                        strokeDasharray="6 10"
                        opacity="0.18"
                      />
                    </svg>
                    <svg
                      className="ghub-ring-reverse pointer-events-none absolute h-24 w-24"
                      viewBox="0 0 96 96"
                    >
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        fill="none"
                        stroke="var(--theme-accent-cabbage-default)"
                        strokeWidth="1.5"
                        strokeDasharray="4 6"
                        opacity="0.35"
                      />
                    </svg>
                    <svg
                      className="onb-ring-slow pointer-events-none absolute h-16 w-16"
                      viewBox="0 0 64 64"
                    >
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="var(--theme-accent-cabbage-default)"
                        strokeWidth="1"
                        strokeDasharray="3 5"
                        opacity="0.3"
                      />
                    </svg>
                    {[
                      {
                        px: '-6rem',
                        py: '-3.5rem',
                        dur: '3.0s',
                        delay: '0s',
                        color: 'bg-accent-cheese-default',
                      },
                      {
                        px: '5.5rem',
                        py: '-4rem',
                        dur: '3.4s',
                        delay: '0.5s',
                        color: 'bg-accent-water-default',
                      },
                      {
                        px: '-5rem',
                        py: '3.5rem',
                        dur: '3.2s',
                        delay: '1.0s',
                        color: 'bg-accent-cabbage-default',
                      },
                      {
                        px: '6rem',
                        py: '3rem',
                        dur: '3.6s',
                        delay: '1.5s',
                        color: 'bg-accent-onion-default',
                      },
                      {
                        px: '0.5rem',
                        py: '-5rem',
                        dur: '2.8s',
                        delay: '0.7s',
                        color: 'bg-accent-cheese-default',
                      },
                      {
                        px: '-6.5rem',
                        py: '0.5rem',
                        dur: '3.1s',
                        delay: '1.2s',
                        color: 'bg-accent-water-default',
                      },
                    ].map((p) => (
                      <span
                        key={`modal-panel-ghub-${p.delay}`}
                        className={classNames(
                          'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                          p.color,
                        )}
                        style={
                          {
                            '--px': p.px,
                            '--py': p.py,
                            '--dur': p.dur,
                            '--delay': p.delay,
                            animationDelay: p.delay,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-text-primary"
                      >
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    </div>
                  </div>

                  <h4 className="mb-1.5 break-words text-center font-bold text-text-primary typo-body">
                    One-click setup
                  </h4>
                  <p className="mb-5 text-center text-text-tertiary typo-footnote">
                    Connect GitHub and let our AI do the rest.
                  </p>

                  <div className="mb-5 flex w-full flex-col gap-3">
                    {[
                      {
                        text: 'We spot your stack from GitHub',
                        icon: 'stack',
                      },
                      {
                        text: 'AI matches your skills to topics',
                        icon: 'ai',
                      },
                      {
                        text: 'Your feed is ready in seconds',
                        icon: 'feed',
                      },
                    ].map(({ text, icon }) => (
                      <div key={text} className="flex items-center gap-2">
                        <span
                          className={classNames(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                            icon === 'stack' &&
                              'bg-accent-avocado-default/20 text-accent-avocado-default',
                            icon === 'ai' &&
                              'bg-accent-cheese-default/20 text-accent-cheese-default',
                            icon === 'feed' &&
                              'bg-accent-water-default/20 text-accent-water-default',
                          )}
                        >
                          {icon === 'stack' && (
                            <TerminalIcon size={IconSize.Size16} secondary />
                          )}
                          {icon === 'ai' && (
                            <MagicIcon size={IconSize.Size16} secondary />
                          )}
                          {icon === 'feed' && (
                            <NewTabIcon size={IconSize.Size16} secondary />
                          )}
                        </span>
                        <span className="text-left text-text-primary typo-footnote">
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-border-subtlest-tertiary/30 mb-5 h-px w-full" />

                  <div className="relative mt-auto w-full pt-4">
                    <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                    <button
                      type="button"
                      onClick={startGithubFlowFromChooser}
                      className="onb-btn-shine focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-5 py-3.5 font-bold text-black transition-all duration-300 typo-callout hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2"
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
                        <path
                          d="M5 12h14M12 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2.5 text-text-quaternary typo-caption2">
                    Read-only access &middot; No special permissions
                  </p>
                </div>

                {/* ── Path B: Manual ── */}
                <div className="onb-glass flex h-full min-h-[24rem] flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:min-h-[26rem] tablet:self-stretch">
                  {/* Static icon zone */}
                  <div
                    className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center"
                    style={{ width: 'calc(100% + 3rem)' }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(ellipse at 50% 0%, var(--theme-accent-onion-default) 0%, transparent 65%)',
                        opacity: 0.22,
                      }}
                    />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                      <MagicIcon
                        secondary
                        size={IconSize.Small}
                        className="text-white"
                      />
                    </div>
                  </div>

                  <h4 className="mb-1.5 break-words text-center font-bold text-text-primary typo-body">
                    Tell our AI about yourself
                  </h4>
                  <p className="mb-5 text-center text-text-tertiary typo-footnote">
                    Describe your stack and let AI build your feed.
                  </p>

                  {/* Textarea */}
                  <div className="onb-textarea-glow mb-3 w-full rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 focus-within:border-white/[0.18] focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_28px_rgba(0,0,0,0.3)] hover:border-white/[0.06] hover:bg-white/[0.02] hover:shadow-none">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' || e.shiftKey) {
                          return;
                        }
                        e.preventDefault();
                        startAiFlowFromChooser();
                      }}
                      rows={4}
                      placeholder="I'm a frontend engineer working with React and TypeScript. Interested in system design, AI tooling..."
                      className="min-h-[6.25rem] w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary transition-colors duration-200 typo-callout placeholder:text-text-quaternary focus:outline-none focus:placeholder:text-text-disabled"
                    />
                  </div>

                  {/* Selected chips */}
                  {selectedTopics.size > 0 && (
                    <div className="mb-3 flex w-full flex-wrap gap-1.5">
                      {Array.from(selectedTopics).map((topic) => (
                        <button
                          key={`modal-sel-${topic}`}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={classNames(
                            'onb-chip-enter inline-flex items-center gap-1.5 rounded-8 border px-2.5 py-1 font-medium shadow-[0_0_12px_rgba(255,255,255,0.04)] transition-all duration-200 typo-caption1 hover:bg-white/[0.14] hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] focus-visible:outline-none active:scale-[0.96]',
                            TOPIC_SELECTED_STYLES,
                          )}
                        >
                          {topic}
                          <span className="text-text-quaternary">&times;</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matched tags */}
                  <div
                    className={classNames(
                      'duration-400 w-full overflow-hidden transition-all ease-out',
                      recommendedTopics.length > 0
                        ? 'max-h-40 opacity-100'
                        : 'max-h-0 opacity-0',
                    )}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {recommendedTopics.map(({ label }) => (
                        <button
                          key={`modal-match-${label}`}
                          type="button"
                          onClick={() => toggleTopic(label)}
                          className="onb-chip-enter border-border-subtlest-tertiary/40 rounded-8 border px-2.5 py-1 text-text-tertiary transition-all duration-200 typo-caption1 hover:bg-white/[0.06] hover:text-text-secondary focus-visible:outline-none active:scale-[0.97]"
                        >
                          + {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Build feed CTA — disabled when no input */}
                  <div className="relative mt-auto w-full pt-4">
                    <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                    <button
                      type="button"
                      disabled={!canStartAiFlow}
                      onClick={startAiFlowFromChooser}
                      className={classNames(
                        'focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 px-5 py-3.5 font-bold transition-all duration-300 typo-callout focus-visible:outline-none focus-visible:ring-2',
                        canStartAiFlow
                          ? 'bg-white text-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]'
                          : 'cursor-not-allowed bg-white/[0.08] text-text-disabled',
                      )}
                    >
                      <MagicIcon
                        secondary
                        size={IconSize.Size16}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                      Generate my feed with AI
                    </button>
                  </div>
                  <p className="mt-2.5 text-text-quaternary typo-caption2">
                    AI-powered &middot; instant personalization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Persistent backdrop during import→extension transition ── */}
      {githubImportExiting && (
        <div
          className="bg-black/80 fixed inset-0 z-modal backdrop-blur-lg"
          aria-hidden
        />
      )}

      {/* ── Extension Promotion Overlay ── */}
      {showExtensionPromo && (
        <div
          className="fixed inset-0 z-modal flex items-end tablet:items-center tablet:justify-center tablet:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Install browser extension"
        >
          <div
            className="onb-modal-backdrop bg-black/80 absolute inset-0 backdrop-blur-lg"
            onClick={dismissExtensionPromo}
            role="presentation"
          />

          <div className="onb-modal-enter onb-glass relative z-1 flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-24 border border-white/[0.08] bg-background-default shadow-[0_32px_90px_rgba(0,0,0,0.58)] tablet:max-w-lg tablet:rounded-24">
            <button
              type="button"
              onClick={dismissExtensionPromo}
              className="z-10 absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
              aria-label="Close"
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

            <div className="flex w-full flex-col items-center px-5 pb-6 pt-7 tablet:px-6">
              {/* Status badge */}
              <div className="mb-4 inline-flex items-center gap-1.5">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-avocado-default text-black">
                  <VIcon secondary size={IconSize.XXSmall} />
                </div>
                <span className="font-bold text-accent-avocado-default typo-callout">
                  Your feed is ready
                </span>
              </div>

              {/* Headline */}
              <h2 className="mb-4 text-center font-bold leading-tight text-text-primary typo-title1">
                See it every time{' '}
                <span className="text-accent-cabbage-default">
                  you open a tab.
                </span>
              </h2>

              {/* Screenshot */}
              <div className="relative mb-4 w-full overflow-hidden rounded-12">
                <img
                  alt={`daily.dev extension in ${
                    isEdgeBrowser ? 'Edge' : 'Chrome'
                  }`}
                  className="block h-auto w-full object-contain"
                  fetchPriority="high"
                  width={820}
                  height={520}
                  loading="eager"
                  src={extensionImages.default}
                  srcSet={`${extensionImages.default} 820w, ${extensionImages.retina} 1640w`}
                  sizes="(max-width: 480px) 100vw, 400px"
                />
              </div>

              {/* Value props */}
              <div className="mb-7 mt-2 flex w-full flex-col items-center gap-1 px-2 text-center tablet:px-4">
                {(
                  [
                    'Zero clicks to your personalized feed',
                    'Catch trending tools & discussions early',
                    'Trusted by 1M+ developers daily',
                  ] as const
                ).map((label) => (
                  <div
                    key={label}
                    className="flex items-center justify-center gap-2.5 py-1"
                  >
                    <div className="bg-accent-avocado-default/20 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                      <VIcon
                        className="text-accent-avocado-default"
                        size={IconSize.XXSmall}
                      />
                    </div>
                    <span className="text-text-secondary typo-callout">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => {
                  window.open(
                    downloadBrowserExtension,
                    '_blank',
                    'noopener,noreferrer',
                  );
                  dismissExtensionPromo();
                }}
                className="mb-2 flex w-full items-center justify-center gap-2.5 rounded-14 bg-white py-3 font-bold text-black transition-all duration-200 typo-callout hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(163,230,53,0.22)]"
              >
                {isEdgeBrowser ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#0078D4"
                    className="shrink-0"
                  >
                    <path d="M21.86 17.86q.14 0 .25.12.1.13.1.25t-.11.33l-.32.46-.43.53-.44.46q-.54.52-1.15.97l-.09.06q-.88.56-1.86.97-1.14.46-2.42.66-1.34.2-2.71.06-1.14-.12-2.2-.5-1.2-.42-2.27-1.12-1.17-.78-2.1-1.86-.83-.94-1.41-2.07-.66-1.27-.96-2.67-.17-.79-.22-1.6-.06-.91.05-1.84.1-.78.3-1.54.27-1.01.72-1.96.37-.78.88-1.51.47-.68 1.03-1.28.41-.44.87-.83l.13-.1q.49-.38 1.04-.71.53-.32 1.1-.56.92-.39 1.93-.56 1.19-.2 2.49-.08.38.03.76.1.36.07.72.17.42.12.82.29.34.14.67.31.3.15.58.33l.06.04q.28.18.55.38 0 0-.55.92T13.8 4.4q-.26-.13-.55-.24-.34-.12-.7-.2-.31-.07-.63-.1-.42-.04-.85-.02-.76.06-1.46.33-.82.32-1.51.86-.57.45-1.03 1.02-.54.66-.9 1.42-.27.57-.42 1.18-.12.48-.17.97-.06.64.03 1.3.11.79.39 1.52.32.82.84 1.52.57.76 1.32 1.34.64.5 1.39.84.79.36 1.66.52.57.1 1.16.12.78.02 1.56-.12.65-.11 1.26-.35.75-.3 1.4-.76.55-.39 1.01-.87.36-.37.67-.78l.36-.56Z" />
                  </svg>
                ) : (
                  <ChromeIcon aria-hidden size={IconSize.Size16} />
                )}
                Add to {isEdgeBrowser ? 'Edge' : 'Chrome'}
              </button>

              <button
                type="button"
                onClick={dismissExtensionPromo}
                className="mb-5 rounded-10 px-4 py-2 text-text-tertiary transition-all typo-callout hover:bg-white/[0.06] hover:text-text-secondary"
              >
                I&apos;ll continue on web for now
              </button>

              {/* Community proof */}
              <div className="flex w-full flex-col items-center justify-center gap-2 border-t border-border-subtlest-tertiary pt-4">
                <div className="flex text-accent-cheese-default">
                  <StarIcon secondary size={IconSize.XSmall} />
                  <StarIcon secondary size={IconSize.XSmall} />
                  <StarIcon secondary size={IconSize.XSmall} />
                  <StarIcon secondary size={IconSize.XSmall} />
                  <StarIcon secondary size={IconSize.XSmall} />
                </div>
                <span
                  className="max-w-[26rem] text-center italic text-text-tertiary typo-callout"
                  style={{ lineHeight: 1.8 }}
                >
                  &quot;I open 50+ tabs a day. daily.dev makes each one count.
                  It&apos;s the best dev tool I&apos;ve installed this
                  year.&quot;
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Import Overlay ── */}
      {showGithubImportFlow && (
        <div
          className="fixed inset-0 z-modal flex items-end tablet:items-center tablet:justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={
            importFlowSource === 'github'
              ? 'Importing GitHub profile'
              : 'Analyzing your profile'
          }
        >
          {/* Full-screen scrim — blurred glass so feed peeks through */}
          <div
            className={classNames(
              'bg-black/70 absolute inset-0 backdrop-blur-md',
              githubImportExiting
                ? 'onb-modal-backdrop-exit'
                : 'onb-modal-backdrop',
            )}
            onClick={closeGithubImportFlow}
            role="presentation"
          />

          {/* Centered content */}
          <div
            className={classNames(
              'relative z-1 flex max-h-[100dvh] w-full flex-col items-center overflow-y-auto rounded-t-20 border border-white/[0.10] bg-raw-pepper-90 px-5 py-6 shadow-[0_32px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] tablet:mx-4 tablet:max-w-md tablet:rounded-20 tablet:px-6',
              githubImportExiting && 'onb-modal-exit',
            )}
          >
            <button
              type="button"
              onClick={closeGithubImportFlow}
              className="z-10 absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {/* ── Animated orb — full-width energy field ── */}
            <div
              className="pointer-events-none relative -mx-5 -mt-6 mb-0 flex h-32 items-center justify-center overflow-hidden tablet:-mx-6"
              style={{ width: 'calc(100% + 2.5rem)' }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${
                    importFlowSource === 'github'
                      ? 'var(--theme-accent-cabbage-default)'
                      : 'var(--theme-accent-onion-default)'
                  } 0%, transparent 65%)`,
                  opacity: 0.22,
                }}
              />
              <div
                className={classNames(
                  'pointer-events-none absolute h-32 w-52 rounded-full blur-3xl',
                  isAwaitingSeniorityInput && 'ghub-orb-paused',
                  importFlowSource === 'github'
                    ? 'ghub-orb-glow bg-accent-cabbage-default/15'
                    : 'onb-ai-orb-glow bg-accent-onion-default/15',
                )}
              />
              <svg
                className={classNames(
                  'pointer-events-none absolute',
                  isAwaitingSeniorityInput && 'ghub-orb-paused',
                  importFlowSource === 'github' ? 'ghub-ring' : 'onb-ai-ring',
                )}
                style={{ width: '11rem', height: '11rem' }}
                viewBox="0 0 176 176"
              >
                <circle
                  cx="88"
                  cy="88"
                  r="84"
                  fill="none"
                  stroke={
                    importFlowSource === 'github'
                      ? 'var(--theme-accent-cabbage-default)'
                      : 'var(--theme-accent-onion-default)'
                  }
                  strokeWidth="1.5"
                  strokeDasharray="6 10"
                  opacity="0.18"
                />
              </svg>
              <svg
                className={classNames(
                  'pointer-events-none absolute h-24 w-24',
                  isAwaitingSeniorityInput && 'ghub-orb-paused',
                  importFlowSource === 'github'
                    ? 'ghub-ring-reverse'
                    : 'onb-ai-ring-reverse',
                )}
                viewBox="0 0 96 96"
              >
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  fill="none"
                  stroke={
                    importFlowSource === 'github'
                      ? 'var(--theme-accent-cabbage-default)'
                      : 'var(--theme-accent-onion-default)'
                  }
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  opacity="0.35"
                />
              </svg>
              <svg
                className={classNames(
                  'onb-ring-slow pointer-events-none absolute h-16 w-16',
                  isAwaitingSeniorityInput && 'ghub-orb-paused',
                )}
                viewBox="0 0 64 64"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={
                    importFlowSource === 'github'
                      ? 'var(--theme-accent-cabbage-default)'
                      : 'var(--theme-accent-onion-default)'
                  }
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  opacity="0.3"
                />
              </svg>
              {[
                {
                  px: '-6rem',
                  py: '-3.5rem',
                  dur: '3.0s',
                  delay: '0s',
                  color: 'bg-accent-cheese-default',
                },
                {
                  px: '5.5rem',
                  py: '-4rem',
                  dur: '3.4s',
                  delay: '0.5s',
                  color: 'bg-accent-water-default',
                },
                {
                  px: '-5rem',
                  py: '3.5rem',
                  dur: '3.2s',
                  delay: '1.0s',
                  color: 'bg-accent-cabbage-default',
                },
                {
                  px: '6rem',
                  py: '3rem',
                  dur: '3.6s',
                  delay: '1.5s',
                  color: 'bg-accent-onion-default',
                },
                {
                  px: '0.5rem',
                  py: '-5rem',
                  dur: '2.8s',
                  delay: '0.7s',
                  color: 'bg-accent-cheese-default',
                },
                {
                  px: '-6.5rem',
                  py: '0.5rem',
                  dur: '3.1s',
                  delay: '1.2s',
                  color: 'bg-accent-water-default',
                },
              ].map((p) => (
                <span
                  key={`import-flow-${p.delay}`}
                  className={classNames(
                    'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                    isAwaitingSeniorityInput && 'ghub-orb-paused',
                    p.color,
                  )}
                  style={
                    {
                      '--px': p.px,
                      '--py': p.py,
                      '--dur': p.dur,
                      '--delay': p.delay,
                      animationDelay: p.delay,
                    } as React.CSSProperties
                  }
                />
              ))}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                {(() => {
                  if (isAwaitingSeniorityInput) {
                    return (
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent-water-default text-white shadow-[0_12px_28px_rgba(72,98,255,0.42)]">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="ghub-question-pulse text-white"
                        >
                          <path
                            d="M8.7 9a3.3 3.3 0 116.6 0c0 1.5-.84 2.24-1.8 2.9-.86.6-1.66 1.16-1.66 2.45"
                            stroke="currentColor"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="18.1"
                            r="1.6"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    );
                  }

                  if (importFlowSource === 'github') {
                    return (
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-text-primary"
                      >
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    );
                  }

                  return (
                    <MagicIcon
                      secondary
                      size={IconSize.Small}
                      className="text-text-primary"
                    />
                  );
                })()}
              </div>
            </div>

            {/* ── Title & progress ── */}
            <h2 className="mb-1 text-center font-bold text-text-primary typo-title3">
              {(() => {
                if (githubImportPhase === 'complete') {
                  return 'Your feed is ready';
                }
                if (
                  githubImportPhase === 'awaitingSeniority' ||
                  githubImportPhase === 'confirmingSeniority'
                ) {
                  return 'Almost there';
                }
                return importFlowSource === 'github'
                  ? 'Reading your GitHub'
                  : 'Analyzing your profile';
              })()}
            </h2>

            <p className="mb-4 text-center text-text-tertiary typo-footnote">
              {(() => {
                if (githubImportPhase === 'complete') {
                  return 'We built a personalized feed just for you.';
                }
                if (githubImportPhase === 'awaitingSeniority') {
                  return importFlowSource === 'github'
                    ? 'One thing we couldn\u2019t find on your profile.'
                    : 'One last detail to finish your profile setup.';
                }
                if (githubImportPhase === 'confirmingSeniority') {
                  return 'Got it. Finishing up...';
                }
                return currentImportStep;
              })()}
            </p>

            {/* ── Progress track ── */}
            {githubImportPhase !== 'idle' && (
              <div className="mb-5 w-full">
                <div className="relative h-1 w-full overflow-hidden rounded-[0.125rem] bg-white/[0.10]">
                  <div
                    className="h-full rounded-[0.125rem] bg-accent-cabbage-default transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(githubImportProgress, 6)}%` }}
                  />
                </div>
              </div>
            )}

            {githubImportBodyPhase !== 'default' && (
              <div
                className={classNames(
                  'w-full overflow-hidden',
                  githubImportBodyPhase === 'seniority'
                    ? 'rounded-none border-0 bg-transparent p-0'
                    : 'rounded-16 border border-white/[0.06] bg-white/[0.01] p-3.5',
                )}
              >
                <div
                  className="ghub-phase-shell overflow-hidden transition-[height] duration-300 ease-out"
                  style={{
                    height: githubImportBodyHeight
                      ? `${githubImportBodyHeight}px`
                      : undefined,
                  }}
                >
                  <div
                    key={githubImportBodyPhase}
                    ref={githubImportBodyContentRef}
                    className={
                      githubImportBodyPhase === 'checklist'
                        ? 'min-h-0'
                        : 'min-h-[12rem]'
                    }
                  >
                    {/* ── Import checklist (during active import) ── */}
                    {githubImportBodyPhase === 'checklist' && (
                      <div className="flex w-full flex-col gap-2.5">
                        {importSteps.map((step, i) => {
                          const done = githubImportProgress >= step.threshold;
                          const active =
                            !done &&
                            githubImportProgress >= step.threshold - 16;
                          // eslint-disable-next-line no-nested-ternary
                          const statusText = done
                            ? 'Done'
                            : active
                            ? 'In progress'
                            : 'Up next';

                          return (
                            <div
                              key={step.label}
                              className="ghub-step-reveal grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3"
                              style={{ animationDelay: `${i * 80}ms` }}
                            >
                              <span
                                className={classNames(
                                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                                  // eslint-disable-next-line no-nested-ternary
                                  done
                                    ? 'bg-accent-avocado-default'
                                    : active
                                    ? 'bg-accent-cabbage-default/18'
                                    : 'bg-white/[0.06]',
                                )}
                              >
                                {done ? (
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden
                                  >
                                    <path
                                      d="M9 12l2 2 4-4"
                                      stroke="#111827"
                                      strokeWidth="2.6"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : (
                                  <span
                                    className={classNames(
                                      'h-2 w-2 rounded-full',
                                      active
                                        ? 'bg-accent-cabbage-default'
                                        : 'bg-text-quaternary',
                                    )}
                                  />
                                )}
                              </span>
                              <span
                                className={classNames(
                                  'truncate transition-colors duration-300 typo-callout',
                                  // eslint-disable-next-line no-nested-ternary
                                  done
                                    ? 'text-text-primary'
                                    : active
                                    ? 'text-text-secondary'
                                    : 'text-text-quaternary',
                                )}
                              >
                                {step.label}
                              </span>
                              <span
                                className={classNames(
                                  'shrink-0 typo-caption2',
                                  // eslint-disable-next-line no-nested-ternary
                                  done
                                    ? 'text-accent-avocado-default'
                                    : active
                                    ? 'text-accent-cabbage-default'
                                    : 'text-text-quaternary',
                                )}
                              >
                                {statusText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ── Seniority question ── */}
                    {githubImportBodyPhase === 'seniority' && (
                      <div>
                        <p className="mb-3 text-left font-medium text-text-primary typo-callout">
                          What is your seniority level?
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {EXPERIENCE_LEVEL_OPTIONS.map((option) => {
                            const optionParts = getExperienceLevelOptionParts(
                              option.label,
                            );
                            const optionMeta =
                              optionParts.meta ?? 'Non-technical';
                            const isSelected =
                              selectedExperienceLevel === option.value;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                  handleExperienceLevelSelect(option.value)
                                }
                                className={classNames(
                                  'focus-visible:ring-accent-cabbage-default/60 group flex items-center rounded-12 border px-4 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 active:translate-y-px',
                                  isSelected
                                    ? 'border-white/[0.24] bg-surface-hover text-text-primary shadow-[0_8px_24px_rgba(0,0,0,0.3)]'
                                    : 'border-white/[0.12] bg-surface-float text-text-secondary hover:border-white/[0.2] hover:bg-surface-hover hover:text-text-primary',
                                )}
                              >
                                <span
                                  className={classNames(
                                    'line-clamp-2 min-w-0 flex-1 font-medium leading-tight typo-callout',
                                    isSelected
                                      ? 'text-text-primary'
                                      : 'text-text-secondary',
                                  )}
                                >
                                  {optionParts.title}
                                </span>
                                <span
                                  className={classNames(
                                    'shrink-0 text-right typo-caption1',
                                    isSelected
                                      ? 'text-text-tertiary'
                                      : 'text-text-quaternary',
                                  )}
                                >
                                  {optionMeta}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Completion handled by feedReadyState banner — auto-transition */}
          </div>
        </div>
      )}

      {/* ── Contextual Signup Modal ── */}
      {showSignupPrompt && (
        <div
          className="fixed inset-0 z-modal flex items-end tablet:items-center tablet:justify-center tablet:p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="onb-modal-backdrop bg-black/80 absolute inset-0 backdrop-blur-lg"
            onClick={() => setShowSignupPrompt(false)}
            role="presentation"
          />

          {/* Modal */}
          <div className="onb-modal-enter onb-glass relative flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-20 border border-white/[0.08] bg-background-default shadow-[0_24px_80px_rgba(0,0,0,0.5)] tablet:max-w-[26rem] tablet:rounded-20">
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowSignupPrompt(false)}
              className="z-10 absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
              aria-label="Close"
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
            <div className="px-5 pb-6 pt-8 tablet:px-7 tablet:pb-7">
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
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-accent-avocado-default/70 shrink-0"
                        >
                          <path
                            d="M9 12l2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
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

              {/* ── Shared AI setup context (manual + ai) ── */}
              {isAiSetupContext && (
                <>
                  <div
                    className="pointer-events-none relative -mx-5 -mt-8 mb-0 flex h-32 items-center justify-center overflow-hidden tablet:-mx-7"
                    style={{ width: 'calc(100% + 2.5rem)' }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(ellipse at 50% 0%, var(--theme-accent-onion-default) 0%, transparent 65%)',
                        opacity: 0.22,
                      }}
                    />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                      <MagicIcon
                        secondary
                        size={IconSize.Small}
                        className="text-white"
                      />
                    </div>
                  </div>
                  <div className="mb-4 mt-4 flex flex-col items-center">
                    <h4 className="mb-1.5 break-words text-center font-bold text-text-primary typo-body">
                      Tell our AI about yourself
                    </h4>
                    <p className="mb-5 text-center text-text-tertiary typo-footnote">
                      Describe your stack and let AI build your feed.
                    </p>
                  </div>

                  <div className="onb-textarea-glow mb-3 w-full rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 focus-within:border-white/[0.18] focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_28px_rgba(0,0,0,0.3)] hover:border-white/[0.06] hover:bg-white/[0.02] hover:shadow-none">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' || e.shiftKey) {
                          return;
                        }
                        e.preventDefault();
                        if (aiPrompt.trim()) {
                          startAiFlowFromSignup();
                        }
                      }}
                      rows={4}
                      placeholder="I'm a frontend engineer using React and TypeScript. Interested in system design, performance, and AI tooling..."
                      className="min-h-[6.25rem] w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary transition-colors duration-200 typo-callout placeholder:text-text-quaternary focus:outline-none focus:placeholder:text-text-disabled"
                    />
                  </div>
                  {selectedTopics.size > 0 && (
                    <div className="mb-3 flex w-full flex-wrap gap-1.5">
                      {Array.from(selectedTopics).map((topic) => (
                        <button
                          key={`signup-sel-${topic}`}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={classNames(
                            'onb-chip-enter inline-flex items-center gap-1.5 rounded-8 border px-2.5 py-1 font-medium shadow-[0_0_12px_rgba(255,255,255,0.04)] transition-all duration-200 typo-caption1 hover:bg-white/[0.14] hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] focus-visible:outline-none active:scale-[0.96]',
                            TOPIC_SELECTED_STYLES,
                          )}
                        >
                          {topic}
                          <span className="text-text-quaternary">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {recommendedTopics.length > 0 && (
                    <div className="duration-400 mb-2 w-full overflow-hidden transition-all ease-out">
                      <div className="flex flex-wrap gap-1.5">
                        {recommendedTopics.map(({ label }) => (
                          <button
                            key={`signup-match-${label}`}
                            type="button"
                            onClick={() => toggleTopic(label)}
                            className="onb-chip-enter border-border-subtlest-tertiary/40 rounded-8 border px-2.5 py-1 text-text-tertiary transition-all duration-200 typo-caption1 hover:bg-white/[0.06] hover:text-text-secondary focus-visible:outline-none active:scale-[0.97]"
                          >
                            + {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── Auth buttons ── */}
              <div
                className={classNames(
                  'relative',
                  isAiSetupContext && 'mt-4 w-full',
                )}
              >
                <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                {signupContext === 'github' && (
                  <button
                    type="button"
                    className="onb-btn-shine group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-4 py-3.5 font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none"
                    onClick={() => setShowSignupPrompt(false)}
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
                      <path
                        d="M5 12h14M12 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                {isAiSetupContext && (
                  <>
                    <button
                      type="button"
                      disabled={!canStartAiFlow}
                      className={classNames(
                        'focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 px-5 py-3.5 font-bold transition-all duration-300 typo-callout focus-visible:outline-none focus-visible:ring-2',
                        canStartAiFlow
                          ? 'bg-white text-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]'
                          : 'cursor-not-allowed bg-white/[0.08] text-text-disabled',
                      )}
                      onClick={startAiFlowFromSignup}
                    >
                      <MagicIcon
                        secondary
                        size={IconSize.Size16}
                        className={classNames(
                          'transition-transform duration-300',
                          canStartAiFlow && 'group-hover:translate-x-0.5',
                        )}
                      />
                      Generate my feed with AI
                    </button>
                    <p className="mt-2.5 text-center text-text-quaternary typo-caption2">
                      AI-powered &middot; instant personalization
                    </p>
                  </>
                )}
                {!isAiSetupContext && signupContext !== 'github' && (
                  <button
                    type="button"
                    className="onb-btn-shine group relative w-full overflow-hidden rounded-14 bg-white px-4 py-3.5 font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none"
                    onClick={() => setShowSignupPrompt(false)}
                  >
                    Create free account
                  </button>
                )}
              </div>
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
