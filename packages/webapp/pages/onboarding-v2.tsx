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
import { downloadBrowserExtension } from '@dailydotdev/shared/src/lib/constants';
import { UserExperienceLevel } from '@dailydotdev/shared/src/lib/user';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import {
  BrowserName,
  getCurrentBrowserName,
} from '@dailydotdev/shared/src/lib/func';
import { cloudinaryOnboardingExtension } from '@dailydotdev/shared/src/lib/image';
import { ChromeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Chrome';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
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

const TAG_TREND_LABELS = [
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
] as const;

const MOBILE_TAG_ROW_TOP = TAG_TREND_LABELS.slice(0, 6);
const MOBILE_TAG_ROW_BOTTOM = TAG_TREND_LABELS.slice(8, 14);
type MobileHeroTagCloudItem = {
  label: string;
  left: string;
  top: string;
  delay: string;
  duration: string;
  driftX: number;
  driftY: number;
};
const MOBILE_TAG_CLOUD_TOP: MobileHeroTagCloudItem[] = MOBILE_TAG_ROW_TOP.map(
  (label, index) => {
    const positions = [
      { left: '6%', top: '10%' },
      { left: '30%', top: '0%' },
      { left: '56%', top: '12%' },
      { left: '80%', top: '6%' },
      { left: '14%', top: '50%' },
      { left: '40%', top: '44%' },
      { left: '66%', top: '54%' },
      { left: '86%', top: '42%' },
    ] as const;
    const drifts = [
      { x: 8, y: -4 },
      { x: -9, y: 5 },
      { x: 7, y: -6 },
      { x: -8, y: 4 },
      { x: 10, y: -5 },
      { x: -7, y: 6 },
      { x: 9, y: -4 },
      { x: -10, y: 5 },
    ] as const;
    const position = positions[index % positions.length];
    const drift = drifts[index % drifts.length];

    return {
      label,
      left: position.left,
      top: position.top,
      delay: `${index * 0.22}s`,
      duration: `${6.2 + (index % 3) * 0.7}s`,
      driftX: drift.x,
      driftY: drift.y,
    };
  },
);
const MOBILE_TAG_CLOUD_BOTTOM: MobileHeroTagCloudItem[] =
  MOBILE_TAG_ROW_BOTTOM.map((label, index) => {
    const positions = [
      { left: '8%', top: '18%' },
      { left: '26%', top: '52%' },
      { left: '48%', top: '24%' },
      { left: '72%', top: '56%' },
      { left: '88%', top: '22%' },
      { left: '18%', top: '78%' },
      { left: '54%', top: '74%' },
      { left: '82%', top: '82%' },
    ] as const;
    const drifts = [
      { x: -8, y: -5 },
      { x: 7, y: 6 },
      { x: -10, y: -4 },
      { x: 8, y: 5 },
      { x: -9, y: -6 },
      { x: 7, y: 5 },
      { x: -8, y: -4 },
      { x: 9, y: 6 },
    ] as const;
    const position = positions[index % positions.length];
    const drift = drifts[index % drifts.length];

    return {
      label,
      left: position.left,
      top: position.top,
      delay: `${0.45 + index * 0.2}s`,
      duration: `${6 + (index % 3) * 0.8}s`,
      driftX: drift.x,
      driftY: drift.y,
    };
  });

type HeroTagSize = 'sm' | 'md' | 'lg';
type HeroTagTrendItem = {
  label: string;
  left: string;
  top: string;
  delay: string;
  duration: string;
  driftX: number;
  driftY: number;
  size: HeroTagSize;
};

const TAG_TREND_EDGE_LABELS = TAG_TREND_LABELS.filter((_, index) => index % 2 === 0).slice(0, 14);
const EDGE_Y_POSITIONS = [8, 18, 28, 40, 52, 64, 76] as const;
const LEFT_X_POSITIONS = [4, 8, 12, 16, 20, 14, 9] as const;
const RIGHT_X_POSITIONS = [80, 84, 88, 92, 96, 90, 86] as const;

const HERO_TAG_TREND: HeroTagTrendItem[] = TAG_TREND_EDGE_LABELS.map(
  (label, index) => {
    const row = Math.floor(index / 2) % EDGE_Y_POSITIONS.length;
    const isLeft = index % 2 === 0;
    const yOffset = (index % 3) - 1;

    return {
      label,
      left: `${isLeft ? LEFT_X_POSITIONS[row] : RIGHT_X_POSITIONS[row]}%`,
      top: `${EDGE_Y_POSITIONS[row] + yOffset}%`,
      delay: `${(index % 7) * 0.8}s`,
      duration: `${5.5 + (index % 3) * 0.9}s`,
      driftX: isLeft ? 6 + (index % 4) * 2 : -(6 + (index % 4) * 2),
      driftY: -10 + (index % 5) * 5,
      size: (['sm', 'md', 'lg'] as const)[index % 3],
    };
  },
);

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

const getExperienceLevelIcon = (
  level: keyof typeof UserExperienceLevel,
): ReactElement => {
  switch (level) {
    case 'LESS_THAN_1_YEAR':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'MORE_THAN_1_YEAR':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'MORE_THAN_2_YEARS':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 19V9m7 10V5m7 14v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'MORE_THAN_4_YEARS':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l2.7 5.46L21 9.27l-4.5 4.38L17.4 20 12 17.1 6.6 20l.9-6.35L3 9.27l6.3-.81L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'MORE_THAN_6_YEARS':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M4 18h16M7 18V8l5-3 5 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'MORE_THAN_10_YEARS':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.4 7.4H22l-6.1 4.4 2.4 7.2-6.2-4.5-6.2 4.5 2.4-7.2L2 9.4h7.6L12 2z" fill="currentColor" />
        </svg>
      );
    case 'NOT_ENGINEER':
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        </svg>
      );
  }
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

function buildConfettiParticles(): ConfettiParticle[] {
  const particles: ConfettiParticle[] = [];
  const SIZES = ['sm', 'md', 'lg', 'xl'] as const;
  const SHAPES = ['rect', 'circle', 'star'] as const;
  for (let i = 0; i < 60; i += 1) {
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
  const [signupContext, setSignupContext] = useState<
    'topics' | 'github' | 'ai' | 'manual' | null
  >(null);
  const didSetSidebarDefault = useRef(false);
  const panelSentinelRef = useRef<HTMLDivElement>(null);
  const panelStageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const panelBoxRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);
  const githubImportTimerRef = useRef<number | null>(null);
  const githubResumeTimeoutRef = useRef<number | null>(null);

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

  const startImportFlow = useCallback((source: ImportFlowSource) => {
    clearGithubImportTimer();
    clearGithubResumeTimeout();
    setImportFlowSource(source);
    setSelectedExperienceLevel(null);
    setGithubImportProgress(10);
    setGithubImportPhase('running');
    setShowGithubImportFlow(true);
  }, [
    clearGithubImportTimer,
    clearGithubResumeTimeout,
    setImportFlowSource,
  ]);

  const startGithubImportFlow = useCallback(() => {
    startImportFlow('github');
  }, [startImportFlow]);

  const closeGithubImportFlow = useCallback(() => {
    clearGithubImportTimer();
    clearGithubResumeTimeout();
    setShowGithubImportFlow(false);
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
      setGithubImportProgress((prev) => Math.max(prev, 52));
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
    if (!loadedSettings || didSetSidebarDefault.current) {
      return;
    }
    didSetSidebarDefault.current = true;
    if (sidebarExpanded) {
      void toggleSidebarExpanded();
    }
  }, [loadedSettings, sidebarExpanded, toggleSidebarExpanded]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const anyModalOpen =
      showSignupChooser ||
      showSignupPrompt ||
      showGithubImportFlow ||
      showExtensionPromo;

    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [
    showSignupChooser,
    showSignupPrompt,
    showGithubImportFlow,
    showExtensionPromo,
  ]);

  useEffect(() => {
    const onHeaderSignupClick = (event: MouseEvent) => {
      const target = event.target;
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

      const label = (trigger.textContent || '').trim().toLowerCase();
      const isSignupTrigger =
        label === 'sign up' ||
        label === 'signup' ||
        label.includes('sign up') ||
        label.includes('create account');

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

        if (githubImportPhase === 'running' && next >= 48) {
          clearGithubImportTimer();
          setGithubImportPhase('awaitingSeniority');
          return 48;
        }

        if (githubImportPhase === 'finishing' && next >= 100) {
          clearGithubImportTimer();
          setGithubImportPhase('complete');
          setTimeout(() => {
            setShowGithubImportFlow(false);
            setShowExtensionPromo(true);
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

  // Live engagement ticker: rapidly tick counters across many cards (Polymarket-style)
  useEffect(() => {
    if (!feedVisible) return undefined;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) return undefined;

    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // The QuaternaryButton renders: <div.btn-quaternary> <button#id/> <label>{counter}</label> </div>
    // So the counter span is in a sibling label, not inside the button itself.
    const getButtonWrapper = (article: Element, suffix: string): Element | null => {
      const btn = article.querySelector(`[id$="${suffix}"]`);
      if (!btn) return null;
      return btn.closest('.btn-quaternary') || btn.parentElement;
    };

    const findCounterIn = (wrapper: Element): HTMLSpanElement | null => {
      for (const span of Array.from(wrapper.querySelectorAll('span'))) {
        const t = span.textContent?.trim();
        if (t && /^[\d][.\dkKmM]*$/.test(t) && !span.querySelector('span')) {
          return span as HTMLSpanElement;
        }
      }
      return null;
    };

    const ensureCounter = (wrapper: Element, btnId: string, seed: number): HTMLSpanElement => {
      const existing = findCounterIn(wrapper);
      if (existing) return existing;

      const label = document.createElement('label');
      label.htmlFor = btnId;
      label.className = 'flex cursor-pointer items-center pl-1 font-bold typo-callout';
      label.setAttribute('data-onb-injected', 'true');

      const span = document.createElement('span');
      span.className = 'flex h-5 min-w-[1ch] flex-col overflow-hidden tabular-nums typo-footnote';
      span.textContent = String(seed);
      label.appendChild(span);
      wrapper.appendChild(label);

      return span;
    };

    const formatCount = (n: number): string => {
      if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}m`;
      if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
      return String(n);
    };

    const parseCount = (text: string): number | null => {
      const clean = text.trim().toLowerCase();
      if (/^\d+$/.test(clean)) return parseInt(clean, 10);
      const m = clean.match(/^([\d.]+)([km])$/);
      if (!m) return null;
      const n = parseFloat(m[1]);
      return m[2] === 'k' ? n * 1000 : n * 1000000;
    };

    // Seed all visible cards with upvote counters if they don't have one
    const seedCards = () => {
      const articles = document.querySelectorAll('.onb-feed-stage article');
      articles.forEach((article) => {
        const upWrapper = getButtonWrapper(article, '-upvote-btn');
        if (upWrapper) {
          const btn = article.querySelector('[id$="-upvote-btn"]');
          const btnId = btn?.id || '';
          ensureCounter(upWrapper, btnId, 3 + Math.floor(Math.random() * 60));
        }

        const cmtWrapper = getButtonWrapper(article, '-comment-btn');
        if (cmtWrapper && Math.random() < 0.7) {
          const btn = article.querySelector('[id$="-comment-btn"]');
          const btnId = btn?.id || '';
          ensureCounter(cmtWrapper, btnId, 1 + Math.floor(Math.random() * 20));
        }
      });
    };

    const bumpOne = (article: Element) => {
      const isUpvote = Math.random() < 0.75;
      const suffix = isUpvote ? '-upvote-btn' : '-comment-btn';
      const wrapper = getButtonWrapper(article, suffix);
      if (!wrapper) return;

      const counter = findCounterIn(wrapper);
      if (!counter) return;

      const val = parseCount(counter.textContent || '');
      if (val === null) return;

      const increment = 1 + (Math.random() < 0.22 ? 1 : 0);
      const newVal = val + increment;
      counter.textContent = formatCount(newVal);

      // Brief color flash on the number
      const color = isUpvote
        ? 'var(--theme-accent-avocado-default)'
        : 'var(--theme-accent-blueCheese-default)';
      counter.style.setProperty('--onb-bump-color', color);
      counter.classList.remove('onb-live-bump');
      void (counter as HTMLElement).offsetWidth;
      counter.classList.add('onb-live-bump');

      // Emit multiple overlapping floaters so engagement feels continuous.
      const wrapperEl = wrapper as HTMLElement;
      wrapperEl.style.position = 'relative';
      wrapperEl.style.overflow = 'visible';
      const burstCount = 2 + Math.floor(Math.random() * 2);
      const tickLabel = `+${increment}`;

      for (let i = 0; i < burstCount; i++) {
        const floater = document.createElement('span');
        floater.className = 'onb-live-tick';
        floater.textContent = tickLabel;
        floater.style.color = color;
        floater.style.setProperty(
          '--onb-live-x',
          `${(Math.random() - 0.5) * 1.9}rem`,
        );
        floater.style.setProperty(
          '--onb-live-y',
          `${1.2 + Math.random() * 1.1}rem`,
        );
        floater.style.setProperty(
          '--onb-live-scale',
          `${1 + Math.random() * 0.45}`,
        );
        floater.style.setProperty('--onb-live-rot', `${(Math.random() - 0.5) * 14}deg`);
        floater.style.setProperty('--onb-live-delay', `${i * 130}ms`);
        wrapperEl.appendChild(floater);
        setTimeout(() => floater.remove(), 1800 + i * 130);
      }
    };

    const tick = () => {
      const articles = Array.from(
        document.querySelectorAll('.onb-feed-stage article'),
      );
      if (!articles.length) return;

      const count = 5 + Math.floor(Math.random() * 5);
      const picked = shuffle(articles).slice(0, Math.min(count, articles.length));

      picked.forEach((article, i) => {
        setTimeout(() => bumpOne(article), i * 45);
      });
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = 300 + Math.random() * 420;
      timeoutId = setTimeout(() => {
        tick();
        scheduleNext();
      }, delay);
    };

    const startDelay = setTimeout(() => {
      seedCards();
      tick();
      scheduleNext();
    }, 2000);

    // Re-seed when new articles appear
    const mo = new MutationObserver(() => seedCards());
    const feedStage = document.querySelector('.onb-feed-stage');
    if (feedStage) {
      mo.observe(feedStage, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeoutId);
      mo.disconnect();
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

  const confettiParticles = useMemo(
    () => (feedReadyState ? buildConfettiParticles() : []),
    [feedReadyState],
  );
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
  const isAiSetupContext =
    signupContext === 'ai' || signupContext === 'manual';
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
  const panelBackdropOpacity = 1;
  const panelShadowOpacity = 0.12 + panelStageProgress * 0.2;
  const panelRevealOffset = panelVisible ? 40 : 120;
  const importSteps = useMemo(
    () => (importFlowSource === 'github' ? GITHUB_IMPORT_STEPS : AI_IMPORT_STEPS),
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
  const selectedExperienceLevelLabel = useMemo(() => {
    if (!selectedExperienceLevel) {
      return null;
    }

    return (
      EXPERIENCE_LEVEL_OPTIONS.find(
        (option) => option.value === selectedExperienceLevel,
      )?.label ?? null
    );
  }, [selectedExperienceLevel]);
  const githubImportBodyPhase = useMemo(() => {
    if (githubImportPhase === 'running' || githubImportPhase === 'finishing') {
      return 'checklist';
    }
    if (githubImportPhase === 'awaitingSeniority') {
      return 'seniority';
    }
    if (githubImportPhase === 'confirmingSeniority') {
      return 'confirming';
    }

    return 'default';
  }, [githubImportPhase]);

  return (
    <div className={classNames('onb-page onb-sidebar-locked relative overflow-x-hidden', !feedReadyState && 'onb-page-locked')} role="presentation">
      {/* ── Hero ── */}
      <section ref={heroRef} className={classNames('onb-hero relative overflow-hidden pb-10 pt-4 tablet:pb-14 tablet:pt-18', feedReadyState && 'hidden')} style={{ '--scroll-y': '0' } as React.CSSProperties}>
        <div className="relative z-10 mx-auto mb-3 flex w-full max-w-[63.75rem] items-center justify-between px-4 tablet:hidden">
          <Logo
            compact
            position={LogoPosition.Relative}
            className="!left-0 !top-0 !mt-0 !translate-x-0"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openLogin}
              className="rounded-10 border border-white/[0.14] bg-white/[0.02] px-3 py-1.5 text-text-secondary transition-colors duration-200 hover:bg-white/[0.08] typo-footnote"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setShowSignupChooser(true)}
              className="rounded-10 bg-white px-3 py-1.5 font-semibold text-black transition-opacity duration-200 hover:opacity-90 typo-footnote"
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
          <div className="onb-float-1 absolute left-[15%] top-[20%] h-1 w-1 rounded-full bg-accent-cabbage-default/30" />
          <div className="onb-float-2 absolute left-[75%] top-[15%] h-1.5 w-1.5 rounded-full bg-accent-onion-default/20" />
          <div className="onb-float-3 absolute left-[60%] top-[60%] h-1 w-1 rounded-full bg-accent-water-default/25" />
          <div className="onb-float-1 absolute left-[25%] top-[70%] h-1 w-1 rounded-full bg-accent-cheese-default/20" />
          <div className="onb-float-2 absolute left-[85%] top-[45%] h-1 w-1 rounded-full bg-accent-cabbage-default/20" />
          <div className="onb-float-3 absolute left-[40%] top-[30%] h-0.5 w-0.5 rounded-full bg-white/20" />
          {HERO_TAG_TREND.map((tag, index) => {
            const sizeClass =
              tag.size === 'lg'
                ? 'px-4 py-2 typo-body'
                : tag.size === 'md'
                  ? 'px-3.5 py-1.5 typo-callout'
                  : 'px-3 py-1.5 typo-caption1';

            return (
              <span
                key={`${tag.label}-${index}`}
                className={classNames(
                  'onb-hero-tag absolute hidden whitespace-nowrap rounded-10 border border-white/[0.10] bg-white/[0.04] text-text-tertiary shadow-[0_6px_20px_rgba(0,0,0,0.14)] backdrop-blur-sm tablet:block',
                  sizeClass,
                )}
                style={
                  {
                    left: tag.left,
                    top: tag.top,
                    '--tag-delay': tag.delay,
                    '--tag-duration': tag.duration,
                    '--tag-drift-x': `${tag.driftX}px`,
                    '--tag-drift-y': `${tag.driftY}px`,
                  } as React.CSSProperties
                }
              >
                {tag.label}
              </span>
            );
          })}
        </div>

        {/* Ambient glows */}
        {/* Magical breathing glow */}
        <div className="onb-magical-glow pointer-events-none absolute left-1/2 top-[-5%] h-[30rem] w-full max-w-[60rem] -translate-x-1/2 rounded-[100%] bg-gradient-to-tr from-accent-cabbage-default/10 via-accent-water-default/20 to-accent-onion-default/10 blur-[90px] shadow-[0_0_100px_40px_rgba(255,255,255,0.08)]" />
        
        <div className="onb-glow-drift pointer-events-none absolute left-1/2 top-0 h-[22rem] w-full max-w-[48rem] -translate-x-1/2 bg-accent-cabbage-default/5 blur-[100px]" />
        <div className="onb-glow-drift-reverse pointer-events-none absolute left-[40%] top-[4rem] h-[18rem] w-full max-w-[30rem] -translate-x-1/2 bg-accent-onion-default/[0.03] blur-[120px]" />
        <div className="pointer-events-none absolute left-1/2 top-[5rem] h-[24rem] w-full max-w-[64rem] -translate-x-1/2 bg-gradient-to-r from-accent-water-default/[0.03] via-accent-cabbage-default/[0.10] to-accent-onion-default/[0.06] blur-[90px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[20rem] bg-gradient-to-b from-white/[0.03] to-transparent" />

        {/* Centered text content */}
        <div className="relative mx-auto max-w-[63.75rem] px-4 text-center laptop:px-6">
          {/* Mobile-only tag strip — top */}
          <div
            className={classNames(
              'relative mb-4 h-[4.75rem] transition-all duration-700 ease-out tablet:hidden',
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: '100ms' }}
          >
            {mounted && MOBILE_TAG_CLOUD_TOP.map((tag) => (
              <span
                key={`mob-top-${tag.label}`}
                className="onb-mobile-tag absolute whitespace-nowrap rounded-8 border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-text-quaternary typo-caption2"
                style={
                  {
                    left: tag.left,
                    top: tag.top,
                    '--tag-delay': tag.delay,
                    '--tag-duration': tag.duration,
                    '--tag-drift-x': `${tag.driftX}px`,
                    '--tag-drift-y': `${tag.driftY}px`,
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
              mounted
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0',
            )}
            style={{ transitionDelay: '200ms' }}
          >
            <h1 className="mx-auto max-w-[20rem] font-bold leading-[1.12] tracking-tight typo-title1 tablet:max-w-[48rem] tablet:leading-[1.08] tablet:typo-mega1">
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
            <p className="mx-auto mt-4 max-w-[20rem] text-text-secondary typo-callout tablet:mt-5 tablet:max-w-[36rem] tablet:typo-body" style={{ lineHeight: '1.65' }}>
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
            <div className="relative mx-auto flex w-full flex-col items-center justify-center gap-3 tablet:w-fit tablet:flex-row">
              <div className="onb-btn-glow pointer-events-none absolute -inset-3 rounded-20 bg-white/[0.06] blur-xl" />
              <button
                type="button"
                onClick={startGithubImportFlow}
                className="onb-btn-shine group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-7 py-3.5 font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 typo-callout tablet:w-auto"
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
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 font-bold text-text-primary backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.22] hover:bg-white/[0.08] hover:shadow-[0_10px_35px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 typo-callout tablet:w-auto"
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

          {/* Mobile-only tag strip — bottom */}
          <div
            className={classNames(
              'relative mt-5 h-[5.5rem] transition-all duration-700 ease-out tablet:hidden',
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: '650ms' }}
          >
            {mounted && MOBILE_TAG_CLOUD_BOTTOM.map((tag) => (
              <span
                key={`mob-bot-${tag.label}`}
                className="onb-mobile-tag absolute whitespace-nowrap rounded-8 border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-text-quaternary typo-caption2"
                style={
                  {
                    left: tag.left,
                    top: tag.top,
                    '--tag-delay': tag.delay,
                    '--tag-duration': tag.duration,
                    '--tag-drift-x': `${tag.driftX}px`,
                    '--tag-drift-y': `${tag.driftY}px`,
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
            const sizeClass =
              p.size === 'xl'
                ? 'h-4 w-2.5'
                : p.size === 'lg'
                  ? 'h-3 w-2'
                  : p.size === 'md'
                    ? 'h-2.5 w-1.5'
                    : 'h-2 w-1';
            const shapeClass =
              p.shape === 'circle'
                ? 'rounded-full'
                : p.shape === 'star'
                  ? 'onb-confetti-star'
                  : 'rounded-[1px]';
            return (
              <span
                key={p.id}
                className={classNames(
                  'onb-confetti-piece absolute',
                  shapeClass,
                  sizeClass,
                  p.color,
                )}
                style={{
                  left: p.left,
                  top: '-16px',
                  animationDelay: p.delay,
                  animationDuration: `${p.speed}s`,
                  '--confetti-drift': `${p.drift}px`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}

      {/* ── Feed Ready: Celebration Banner ── */}
      {feedReadyState && (
        <div className="onb-feed-ready-banner relative overflow-hidden pt-8 pb-6 tablet:pt-12 tablet:pb-8">
          {/* Radial burst glows — multi-layered */}
          <div className="onb-ready-burst pointer-events-none absolute left-1/2 top-0 h-[24rem] w-full max-w-[48rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent-cabbage-default/[0.14] blur-[120px]" />
          <div className="onb-ready-burst pointer-events-none absolute left-1/2 top-0 h-[16rem] w-full max-w-[28rem] -translate-x-1/2 -translate-y-1/4 rounded-full bg-accent-onion-default/[0.10] blur-[90px]" style={{ animationDelay: '150ms' }} />
          <div className="onb-ready-burst pointer-events-none absolute left-1/2 top-0 h-[10rem] w-full max-w-[16rem] -translate-x-1/2 -translate-y-1/5 rounded-full bg-accent-water-default/[0.08] blur-[60px]" style={{ animationDelay: '350ms' }} />

          {/* Sparkle accents */}
          {[
            { left: '15%', top: '18%', delay: '200ms', size: 12 },
            { left: '80%', top: '12%', delay: '500ms', size: 16 },
            { left: '25%', top: '65%', delay: '700ms', size: 10 },
            { left: '72%', top: '55%', delay: '400ms', size: 14 },
            { left: '50%', top: '8%', delay: '100ms', size: 18 },
            { left: '90%', top: '40%', delay: '600ms', size: 8 },
          ].map((s, i) => (
            <svg
              key={`sparkle-${i}`}
              className="onb-sparkle pointer-events-none absolute text-accent-cheese-default/60"
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
              <div className="absolute inset-0 animate-ping rounded-full bg-accent-avocado-default/20" style={{ animationDuration: '2s', animationIterationCount: '2' }} />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent-avocado-default/20 ring-2 ring-accent-avocado-default/30">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-accent-avocado-default">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                </svg>
              </div>
            </div>

            {/* Headline */}
            <h2 className="onb-ready-reveal mb-2 text-center text-text-primary typo-title1" style={{ animationDelay: '120ms' }}>
              Your feed is ready
            </h2>
            <p className="onb-ready-reveal mb-7 text-center text-text-tertiary typo-body" style={{ animationDelay: '220ms' }}>
              Here&apos;s how to get the most out of daily.dev
            </p>

            {/* Action chips */}
            <div className="onb-ready-reveal flex flex-col items-stretch gap-3 tablet:flex-row tablet:flex-wrap tablet:items-center tablet:justify-center" style={{ animationDelay: '380ms' }}>
              {/* Install extension */}
              <button
                type="button"
                onClick={() => window.open(downloadBrowserExtension, '_blank', 'noopener,noreferrer')}
                className="group flex items-center gap-2.5 rounded-14 border border-white/[0.10] bg-white/[0.06] px-5 py-3 transition-all duration-200 hover:border-accent-cabbage-default/40 hover:bg-accent-cabbage-default/10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent-cabbage-default">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor" />
                </svg>
                <span className="text-text-primary typo-callout">Install extension</span>
              </button>

              {/* Get mobile app */}
              <button
                type="button"
                onClick={() => window.open('https://app.daily.dev', '_blank', 'noopener,noreferrer')}
                className="group flex items-center gap-2.5 rounded-14 border border-white/[0.10] bg-white/[0.06] px-5 py-3 transition-all duration-200 hover:border-accent-onion-default/40 hover:bg-accent-onion-default/10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent-onion-default">
                  <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <line x1="10" y1="19" x2="14" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="text-text-primary typo-callout">Get mobile app</span>
              </button>

              {/* Enable notifications */}
              <button
                type="button"
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission();
                  }
                }}
                className="group flex items-center gap-2.5 rounded-14 border border-white/[0.10] bg-white/[0.06] px-5 py-3 transition-all duration-200 hover:border-accent-cheese-default/40 hover:bg-accent-cheese-default/10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent-cheese-default">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor" />
                </svg>
                <span className="text-text-primary typo-callout">Enable notifications</span>
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
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Bottom fade into feed */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-background-default" />
        </div>
      )}

      {/* ── Feed ── */}
      <div
        className={classNames(
          'onb-feed-stage transition-[opacity,transform] duration-500 ease-out',
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
          className={classNames('relative left-1/2 h-[42vh] w-screen -translate-x-1/2', feedReadyState && 'hidden')}
        >
          <div className="sticky top-[50vh] -translate-y-1/2">
            {/* Dark gradient overlay — fades feed out progressively */}
            <div
              className="onb-panel-fade pointer-events-none absolute inset-x-0 -top-[18rem] h-[40rem] bg-gradient-to-b from-background-default/0 via-background-default to-background-default transition-opacity duration-300"
              style={{ opacity: panelVisible ? panelBackdropOpacity : 0 }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-[-12rem] h-[28rem] bg-background-default transition-opacity duration-300"
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
              <div
                ref={panelBoxRef}
                className="onb-cursor-glow mx-auto max-w-[48rem] px-4 pb-10 pt-12 tablet:px-8 tablet:pt-20"
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
                  'onb-glass flex h-full flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:self-stretch',
                  panelVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0',
                )}
                style={{ transitionDelay: '200ms' }}
              >
                {/* Animated orb — full-width energy field */}
                <div className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center" style={{ width: 'calc(100% + 3rem)' }}>
                  {/* Radial gradient from top center */}
                  <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--theme-accent-cabbage-default) 0%, transparent 65%)', opacity: 0.22 }} />
                  {/* Wide glow */}
                  <div className="ghub-orb-glow pointer-events-none absolute h-32 w-52 rounded-full bg-accent-cabbage-default/15 blur-3xl" />
                  {/* Outer ring */}
                  <svg className="ghub-ring pointer-events-none absolute" style={{ width: '11rem', height: '11rem' }} viewBox="0 0 176 176">
                    <circle cx="88" cy="88" r="84" fill="none" stroke="var(--theme-accent-cabbage-default)" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.18" />
                  </svg>
                  {/* Middle ring */}
                  <svg className="ghub-ring-reverse pointer-events-none absolute h-24 w-24" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="44" fill="none" stroke="var(--theme-accent-cabbage-default)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.35" />
                  </svg>
                  {/* Inner ring */}
                  <svg className="onb-ring-slow pointer-events-none absolute h-16 w-16" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--theme-accent-cabbage-default)" strokeWidth="1" strokeDasharray="3 5" opacity="0.3" />
                  </svg>
                  {/* Particles from far away */}
                  {[
                    { px: '-6rem', py: '-3.5rem', dur: '3.0s', delay: '0s', color: 'bg-accent-cheese-default' },
                    { px: '5.5rem', py: '-4rem', dur: '3.4s', delay: '0.5s', color: 'bg-accent-water-default' },
                    { px: '-5rem', py: '3.5rem', dur: '3.2s', delay: '1.0s', color: 'bg-accent-cabbage-default' },
                    { px: '6rem', py: '3rem', dur: '3.6s', delay: '1.5s', color: 'bg-accent-onion-default' },
                    { px: '0.5rem', py: '-5rem', dur: '2.8s', delay: '0.7s', color: 'bg-accent-cheese-default' },
                    { px: '-6.5rem', py: '0.5rem', dur: '3.1s', delay: '1.2s', color: 'bg-accent-water-default' },
                  ].map((p) => (
                    <span
                      key={`panel-ghub-${p.delay}`}
                      className={classNames(
                        'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                        p.color,
                      )}
                      style={{
                        '--px': p.px,
                        '--py': p.py,
                        '--dur': p.dur,
                        '--delay': p.delay,
                        animationDelay: p.delay,
                      } as React.CSSProperties}
                    />
                  ))}
                  {/* Center icon with pulse */}
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-text-primary">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </div>
                </div>

                <h4 className="mb-1.5 font-bold text-text-primary typo-body">
                  One-click setup
                </h4>
                <p className="mb-5 text-center text-text-tertiary typo-footnote">
                  Connect GitHub and let our AI do the rest.
                </p>

                <div className="mb-5 flex w-full flex-col gap-3">
                  {[
                    { text: 'Detects your stack from your repos', icon: 'stack' },
                    { text: 'AI maps your skills to the most relevant topics', icon: 'ai' },
                    { text: 'Your personalized feed is ready in seconds', icon: 'feed' },
                  ].map(({ text, icon }) => (
                    <div key={text} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                        {icon === 'stack' && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-text-secondary">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {icon === 'ai' && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-text-secondary">
                            <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="currentColor" />
                          </svg>
                        )}
                        {icon === 'feed' && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-text-secondary">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-left text-text-tertiary typo-footnote">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-5 h-px w-full bg-border-subtlest-tertiary/30" />

                <div className="relative w-full">
                  <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                  <button
                    type="button"
                    onClick={startGithubImportFlow}
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
                  'onb-glass flex h-full flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:self-stretch',
                  panelVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0',
                )}
                style={{ transitionDelay: '350ms' }}
              >
                {/* Animated orb — full-width energy field */}
                <div className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center" style={{ width: 'calc(100% + 3rem)' }}>
                  {/* Radial gradient from top center */}
                  <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--theme-accent-onion-default) 0%, transparent 65%)', opacity: 0.22 }} />
                  {/* Wide glow */}
                  <div className="onb-ai-orb-glow pointer-events-none absolute h-32 w-52 rounded-full bg-accent-onion-default/15 blur-3xl" />
                  {/* Outer ring */}
                  <svg className="onb-ai-ring pointer-events-none absolute" style={{ width: '11rem', height: '11rem' }} viewBox="0 0 176 176">
                    <circle cx="88" cy="88" r="84" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.18" />
                  </svg>
                  {/* Middle ring */}
                  <svg className="onb-ai-ring-reverse pointer-events-none absolute h-24 w-24" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="44" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.35" />
                  </svg>
                  {/* Inner ring */}
                  <svg className="onb-ring-slow pointer-events-none absolute h-16 w-16" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1" strokeDasharray="3 5" opacity="0.3" />
                  </svg>
                  {/* Particles from far away */}
                  {[
                    { px: '-6rem', py: '-3.5rem', dur: '3.2s', delay: '0s', color: 'bg-accent-cheese-default' },
                    { px: '5.5rem', py: '-4rem', dur: '3.6s', delay: '0.5s', color: 'bg-accent-water-default' },
                    { px: '-5rem', py: '3.5rem', dur: '3.0s', delay: '1.0s', color: 'bg-accent-onion-default' },
                    { px: '6rem', py: '3rem', dur: '3.4s', delay: '1.5s', color: 'bg-accent-cabbage-default' },
                    { px: '-0.5rem', py: '-5rem', dur: '2.8s', delay: '0.3s', color: 'bg-accent-cheese-default' },
                    { px: '6.5rem', py: '-0.5rem', dur: '3.1s', delay: '0.8s', color: 'bg-accent-water-default' },
                  ].map((p) => (
                    <span
                      key={`panel-ai-${p.delay}`}
                      className={classNames(
                        'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                        p.color,
                      )}
                      style={{
                        '--px': p.px,
                        '--py': p.py,
                        '--dur': p.dur,
                        '--delay': p.delay,
                        animationDelay: p.delay,
                      } as React.CSSProperties}
                    />
                  ))}
                  {/* Center icon with pulse */}
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                    <MagicIcon secondary size={IconSize.Small} className="text-white" />
                  </div>
                </div>

                <h4 className="mb-1.5 font-bold text-text-primary typo-body">
                  Tell our AI about yourself
                </h4>
                <p className="mb-5 text-center text-text-tertiary typo-footnote">
                  Describe your stack and let AI build your feed.
                </p>

                {/* Textarea */}
                <div className="onb-textarea-glow mb-3 w-full rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.02] hover:shadow-none focus-within:border-white/[0.18] focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_28px_rgba(0,0,0,0.3)]">
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
                    placeholder={"I'm a frontend engineer working with React and TypeScript. Interested in system design, AI tooling..."}
                    className="min-h-[6.25rem] w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary placeholder:text-text-quaternary transition-colors duration-200 focus:outline-none focus:placeholder:text-text-disabled typo-callout"
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
                          'onb-chip-enter inline-flex items-center gap-1.5 rounded-8 border px-2.5 py-1 font-medium shadow-[0_0_12px_rgba(255,255,255,0.04)] transition-all duration-200 hover:bg-white/[0.14] hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] active:scale-[0.96] focus-visible:outline-none typo-caption1',
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
                    'w-full overflow-hidden transition-all duration-400 ease-out',
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

                {/* Build feed CTA — disabled when no input */}
                <div className="relative mt-4 w-full">
                  <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                  <button
                    type="button"
                    disabled={!aiPrompt.trim() && selectedTopics.size === 0}
                    onClick={() => startAiProcessing()}
                    className={classNames(
                      'group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 px-5 py-3.5 font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 typo-callout',
                      aiPrompt.trim() || selectedTopics.size > 0
                        ? 'bg-white text-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]'
                        : 'cursor-not-allowed bg-white/[0.08] text-text-disabled',
                    )}
                  >
                    <MagicIcon secondary size={IconSize.Size16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
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
          <div className="relative z-1 mx-auto mt-16 flex w-full max-w-[48rem] justify-center px-5 pb-8 mobileL:px-6 tablet:mt-14">
            <FooterLinks className="mx-auto w-full max-w-[21rem] justify-center px-1 text-center typo-caption2 tablet:max-w-none tablet:typo-footnote" />
          </div>
        )}
        </MainFeedLayout>
        </ActiveFeedNameContext.Provider>
      </div>

      {/* ── CSS: feed limit, article fade, marquee, sidebar disable ── */}
      <style jsx global>{`
        body:has(.onb-sidebar-locked) aside[data-testid="sidebar-aside"],
        body:has(.onb-sidebar-locked) nav[aria-label] {
          pointer-events: none !important;
          opacity: 0.15 !important;
          user-select: none !important;
          filter: grayscale(1) brightness(0.35) !important;
          cursor: not-allowed !important;
        }

        body:has(.onb-sidebar-locked) aside[data-testid="sidebar-aside"] *,
        body:has(.onb-sidebar-locked) nav[aria-label] * {
          pointer-events: none !important;
          cursor: not-allowed !important;
          color: var(--theme-text-disabled) !important;
          fill: var(--theme-text-disabled) !important;
        }

        .onb-page-locked aside a,
        .onb-page-locked aside button,
        .onb-page-locked aside [role="button"],
        .onb-page-locked aside svg,
        .onb-page-locked aside img {
          pointer-events: none !important;
          cursor: not-allowed !important;
          color: var(--theme-text-disabled) !important;
          fill: var(--theme-text-disabled) !important;
        }

        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(n + 19) {
          display: none !important;
        }
        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(18) ~ div {
          display: none !important;
        }

        .onb-feed-stage > main[class*='utilities_feedPage'] {
          padding-top: 0 !important;
        }

        /* fade-out handled by .onb-revealed nth-of-type rules below */

        /* ─── HERO PARALLAX ─── */
        .onb-hero {
          --scroll-y: 0;
        }

        /* ─── MAGICAL BREATHE GLOW ─── */
        @keyframes onb-magical-breathe {
          0%, 100% {
            opacity: 0.4;
            transform: translateX(-50%) scale(1) translateY(0) rotate(0deg);
            filter: blur(90px) brightness(1);
          }
          50% {
            opacity: 0.85;
            transform: translateX(-50%) scale(1.1) translateY(-3%) rotate(2deg);
            filter: blur(110px) brightness(1.3);
          }
        }
        .onb-hero .onb-magical-glow {
          animation: onb-magical-breathe 7s ease-in-out infinite;
          mix-blend-mode: screen;
          will-change: opacity, transform, filter;
          /* Tie to scroll slightly for extra life */
          margin-top: calc(var(--scroll-y) * -0.05px);
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

        /* ─── HERO TAG CLOUD ─── */
        @keyframes onb-hero-tag-float {
          0% {
            opacity: 0;
            transform: translate3d(0, 12px, 0) scale(0.92);
          }
          18% {
            opacity: 0.9;
            transform: translate3d(
              calc(var(--tag-drift-x, 0px) * 0.2),
              calc(var(--tag-drift-y, 0px) * 0.2),
              0
            ) scale(1);
          }
          72% {
            opacity: 0.9;
            transform: translate3d(
              calc(var(--tag-drift-x, 0px) * 0.75),
              calc(var(--tag-drift-y, 0px) * 0.75),
              0
            ) scale(1.03);
          }
          100% {
            opacity: 0;
            transform: translate3d(
              var(--tag-drift-x, 0px),
              var(--tag-drift-y, 0px),
              0
            ) scale(1.06);
          }
        }
        .onb-hero-tag {
          animation: onb-hero-tag-float var(--tag-duration, 12s) ease-in-out infinite;
          animation-delay: var(--tag-delay, 0s);
          will-change: opacity, transform;
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

        /* ─── GITHUB IMPORT FLOW ─── */

        /* Orb: breathing glow behind the icon */
        @keyframes ghub-orb-breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 0.75; }
        }
        .ghub-orb-glow {
          animation: ghub-orb-breathe 2.6s ease-in-out infinite;
        }

        /* Rings that rotate around the orb */
        @keyframes ghub-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ghub-ring { animation: ghub-ring-spin 8s linear infinite; }
        .ghub-ring-reverse { animation: ghub-ring-spin 12s linear infinite reverse; }
        .onb-ring-slow { animation: ghub-ring-spin 18s linear infinite; }

        /* Particles that fly toward the orb center */
        @keyframes ghub-particle-in {
          0% { transform: translate(var(--px), var(--py)) scale(0.8); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.6; }
          100% { transform: translate(0, 0) scale(0); opacity: 0; }
        }
        .ghub-particle {
          animation: ghub-particle-in var(--dur) ease-in infinite;
          animation-delay: var(--delay);
        }

        /* Step checklist fade-in */
        @keyframes ghub-step-in {
          from { transform: translateY(0.375rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .ghub-step-reveal {
          animation: ghub-step-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Import panel phase transitions */
        @keyframes ghub-phase-in {
          from { opacity: 0; transform: translateY(0.25rem) scale(0.995); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ghub-phase-panel {
          animation: ghub-phase-in 0.24s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Confetti for completion */
        @keyframes ghub-confetti {
          0% { transform: translateY(-0.625rem) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(4rem) rotate(260deg); opacity: 0; }
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
          5% { opacity: 1; }
          25% { opacity: 0.95; }
          75% { opacity: 0.7; }
          100% {
            transform: translateY(110vh) translateX(var(--confetti-drift, 0px)) rotate(960deg) scale(0.2);
            opacity: 0;
          }
        }
        .onb-confetti-piece {
          animation: onb-confetti-fall 4s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          filter: brightness(1.2);
        }
        .onb-confetti-star {
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }
        @keyframes onb-confetti-stage-fade {
          0%, 85% { opacity: 1; }
          100% { opacity: 0; }
        }
        .onb-confetti-stage {
          animation: onb-confetti-stage-fade 6s ease-out forwards;
        }

        @keyframes onb-ready-burst {
          0% { transform: translate(-50%, -33%) scale(0.4); opacity: 0; }
          20% { opacity: 1; }
          60% { opacity: 0.6; }
          100% { transform: translate(-50%, -33%) scale(1.2); opacity: 0; }
        }
        .onb-ready-burst {
          animation: onb-ready-burst 2.5s ease-out forwards;
        }

        @keyframes onb-ready-reveal {
          0% { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .onb-ready-reveal {
          opacity: 0;
          animation: onb-ready-reveal 0.6s ease-out forwards;
        }

        @keyframes onb-celebration-sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          30% { transform: scale(1.2) rotate(90deg); opacity: 1; }
          100% { transform: scale(0) rotate(180deg); opacity: 0; }
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
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.35); opacity: 0.6; }
        }
        .onb-ai-orb-glow {
          animation: onb-ai-orb-breathe 2.5s ease-in-out infinite;
        }
        @keyframes onb-ai-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .onb-ai-ring {
          animation: onb-ai-ring-spin 10s linear infinite;
        }
        .onb-ai-ring-reverse {
          animation: onb-ai-ring-spin 7s linear infinite reverse;
        }

        /* ─── AI ICON GLOW ─── */
        @keyframes onb-ai-shimmer {
          0%, 100% { box-shadow: 0 0 8px rgba(168,85,247,0.15), 0 0 20px rgba(168,85,247,0.05); }
          50% { box-shadow: 0 0 14px rgba(168,85,247,0.25), 0 0 32px rgba(168,85,247,0.10); }
        }
        .onb-ai-icon-glow {
          animation: onb-ai-shimmer 3s ease-in-out infinite;
        }

        /* ─── EXTENSION PROMO ─── */
        @keyframes onb-ext-enter {
          from { transform: scale(0.94) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .onb-ext-enter {
          animation: onb-ext-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes onb-ext-reveal {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .onb-ext-reveal {
          opacity: 0;
          animation: onb-ext-reveal 0.4s ease-out forwards;
        }

        @keyframes onb-ext-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .onb-ext-float {
          animation: onb-ext-float 4s ease-in-out infinite;
        }

        /* ─── PANEL FADE: progressive blur + dark overlay ─── */
        .onb-panel-fade {
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.82) 35%, black 55%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.82) 35%, black 55%);
        }

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
                      transform 0.38s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.25s ease,
                      border-color 0.25s ease !important;
          transition-delay: var(--reveal-delay, 0ms);
        }
        .onb-feed-stage:not(.onb-feed-unlocked) article.onb-revealed {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
        }
        .onb-feed-stage:not(.onb-feed-unlocked) article.onb-revealed:hover {
          transform: translateY(0) scale(1) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25),
                      0 0 0 1px rgba(255,255,255,0.03) !important;
          border-color: rgba(255,255,255,0.06) !important;
        }

        /* ─── FEED FADE-OUT GRADIENT (bottom of visible articles) ─── */
        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(13).onb-revealed { opacity: 0.88 !important; }
        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(14).onb-revealed { opacity: 0.72 !important; }
        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(15).onb-revealed { opacity: 0.52 !important; }
        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(16).onb-revealed { opacity: 0.32 !important; }
        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(17).onb-revealed { opacity: 0.15 !important; }
        .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(18).onb-revealed { opacity: 0.05 !important; }

        @media (max-width: 63.9375rem) {
          .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(n + 11) {
            display: none !important;
          }
          .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(10) ~ div {
            display: none !important;
          }

          .onb-feed-stage:not(.onb-feed-unlocked) article.onb-revealed:hover {
            box-shadow: none !important;
          }

          .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(7).onb-revealed { opacity: 0.88 !important; }
          .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(8).onb-revealed { opacity: 0.65 !important; }
          .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(9).onb-revealed { opacity: 0.38 !important; }
          .onb-feed-stage:not(.onb-feed-unlocked) article:nth-of-type(10).onb-revealed { opacity: 0.12 !important; }
        }

        /* ─── TOPIC PILLS (no interaction) ─── */
        .onb-marquee span {
          pointer-events: none;
        }

        /* ─── LIVE ENGAGEMENT TICKER ─── */

        /* Counter number bump — bigger/longer scale + color flash */
        @keyframes onb-live-bump {
          0% { transform: translateY(0) scale(1); color: inherit; }
          22% { transform: translateY(-0.08rem) scale(1.5); color: var(--onb-bump-color, var(--theme-accent-avocado-default)); }
          55% { transform: translateY(0) scale(1.08); color: var(--onb-bump-color, var(--theme-accent-avocado-default)); }
          78% { transform: translateY(0) scale(1.02); color: inherit; }
          100% { transform: scale(1); }
        }
        .onb-live-bump {
          animation: onb-live-bump 0.72s cubic-bezier(0.2, 0.9, 0.2, 1) !important;
          display: inline-block;
        }

        /* "+N" floaters that drift up in overlapping bursts */
        @keyframes onb-live-tick-up {
          0% {
            transform: translate3d(0, 0, 0) scale(0.92) rotate(0deg);
            opacity: 0;
            filter: blur(0);
          }
          18% {
            transform: translate3d(calc(var(--onb-live-x, 0rem) * 0.28), calc(var(--onb-live-y, 1.7rem) * -0.18), 0)
              scale(var(--onb-live-scale, 1.15)) rotate(calc(var(--onb-live-rot, 0deg) * 0.45));
            opacity: 0.98;
          }
          100% {
            transform: translate3d(var(--onb-live-x, 0rem), calc(var(--onb-live-y, 1.7rem) * -1), 0)
              scale(0.78) rotate(var(--onb-live-rot, 0deg));
            opacity: 0;
            filter: blur(0.4px);
          }
        }
        .onb-live-tick {
          position: absolute;
          top: -0.18rem;
          right: -0.3rem;
          font-size: 0.72rem;
          font-weight: 700;
          line-height: 1;
          text-shadow: 0 0 8px color-mix(in srgb, currentColor 40%, transparent);
          pointer-events: none;
          animation: onb-live-tick-up 1.3s cubic-bezier(0.18, 0.84, 0.25, 1) forwards;
          animation-delay: var(--onb-live-delay, 0ms);
          z-index: 10;
          white-space: nowrap;
          will-change: transform, opacity;
        }

        /* ─── SCROLL PROGRESS LINE ─── */
        @keyframes onb-progress-glow {
          0%, 100% { box-shadow: 0 0 6px 1px rgba(168,85,247,0.3); }
          50% { box-shadow: 0 0 12px 2px rgba(168,85,247,0.5); }
        }

        /* ─── MOBILE TAG PILLS ─── */
        .onb-mobile-tag {
          opacity: 0;
          animation: onb-hero-tag-float var(--tag-duration, 6.5s) ease-in-out infinite;
          animation-delay: var(--tag-delay, 0s);
          animation-fill-mode: both;
          will-change: transform, opacity;
        }

        /* ─── MOBILE MODAL SLIDE-UP ─── */
        @keyframes onb-modal-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (max-width: 655px) {
          .onb-modal-enter,
          .onb-ext-enter {
            animation: onb-modal-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
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
          .onb-modal-backdrop,
          .ghub-orb-glow,
          .ghub-ring,
          .ghub-ring-reverse,
          .ghub-particle,
          .ghub-confetti,
          .ghub-phase-panel,
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
          .onb-ext-float,
          .onb-sparkle,
          .onb-confetti-star,
          .onb-live-bump,
          .onb-live-tick,
          .onb-mobile-tag {
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
            className="onb-modal-backdrop absolute inset-0 bg-black/80 backdrop-blur-lg"
            onClick={closeSignupChooser}
            role="presentation"
          />

          <div className="onb-modal-enter onb-glass relative z-1 flex w-full max-h-[100dvh] flex-col overflow-y-auto rounded-t-24 border border-white/[0.08] bg-background-default shadow-[0_32px_90px_rgba(0,0,0,0.58)] tablet:max-w-[58rem] tablet:rounded-24">
            <button
              type="button"
              onClick={closeSignupChooser}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
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
                <div className="onb-glass flex h-full flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:self-stretch">
                  {/* Animated orb — full-width energy field */}
                  <div className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center" style={{ width: 'calc(100% + 3rem)' }}>
                    <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--theme-accent-cabbage-default) 0%, transparent 65%)', opacity: 0.22 }} />
                    <div className="ghub-orb-glow pointer-events-none absolute h-32 w-52 rounded-full bg-accent-cabbage-default/15 blur-3xl" />
                    <svg className="ghub-ring pointer-events-none absolute" style={{ width: '11rem', height: '11rem' }} viewBox="0 0 176 176">
                      <circle cx="88" cy="88" r="84" fill="none" stroke="var(--theme-accent-cabbage-default)" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.18" />
                    </svg>
                    <svg className="ghub-ring-reverse pointer-events-none absolute h-24 w-24" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="44" fill="none" stroke="var(--theme-accent-cabbage-default)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.35" />
                    </svg>
                    <svg className="onb-ring-slow pointer-events-none absolute h-16 w-16" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="var(--theme-accent-cabbage-default)" strokeWidth="1" strokeDasharray="3 5" opacity="0.3" />
                    </svg>
                    {[
                      { px: '-6rem', py: '-3.5rem', dur: '3.0s', delay: '0s', color: 'bg-accent-cheese-default' },
                      { px: '5.5rem', py: '-4rem', dur: '3.4s', delay: '0.5s', color: 'bg-accent-water-default' },
                      { px: '-5rem', py: '3.5rem', dur: '3.2s', delay: '1.0s', color: 'bg-accent-cabbage-default' },
                      { px: '6rem', py: '3rem', dur: '3.6s', delay: '1.5s', color: 'bg-accent-onion-default' },
                      { px: '0.5rem', py: '-5rem', dur: '2.8s', delay: '0.7s', color: 'bg-accent-cheese-default' },
                      { px: '-6.5rem', py: '0.5rem', dur: '3.1s', delay: '1.2s', color: 'bg-accent-water-default' },
                    ].map((p) => (
                      <span
                        key={`modal-panel-ghub-${p.delay}`}
                        className={classNames(
                          'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                          p.color,
                        )}
                        style={{
                          '--px': p.px,
                          '--py': p.py,
                          '--dur': p.dur,
                          '--delay': p.delay,
                          animationDelay: p.delay,
                        } as React.CSSProperties}
                      />
                    ))}
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-text-primary">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                    </div>
                  </div>

                  <h4 className="mb-1.5 font-bold text-text-primary typo-body">
                    One-click setup
                  </h4>
                  <p className="mb-5 text-center text-text-tertiary typo-footnote">
                    Connect GitHub and let our AI do the rest.
                  </p>

                  <div className="mb-5 flex w-full flex-col gap-3">
                    {[
                      { text: 'Detects your stack from your repos', icon: 'stack' },
                      { text: 'AI maps your skills to the most relevant topics', icon: 'ai' },
                      { text: 'Your personalized feed is ready in seconds', icon: 'feed' },
                    ].map(({ text, icon }) => (
                      <div key={text} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                          {icon === 'stack' && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-text-secondary">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          {icon === 'ai' && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-text-secondary">
                              <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="currentColor" />
                            </svg>
                          )}
                          {icon === 'feed' && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-text-secondary">
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="text-left text-text-tertiary typo-footnote">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-5 h-px w-full bg-border-subtlest-tertiary/30" />

                  <div className="relative w-full">
                    <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                    <button
                      type="button"
                      onClick={startGithubFlowFromChooser}
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
                <div className="onb-glass flex h-full flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:self-stretch">
                  {/* Animated orb — full-width energy field */}
                  <div className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center" style={{ width: 'calc(100% + 3rem)' }}>
                    <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--theme-accent-onion-default) 0%, transparent 65%)', opacity: 0.22 }} />
                    <div className="onb-ai-orb-glow pointer-events-none absolute h-32 w-52 rounded-full bg-accent-onion-default/15 blur-3xl" />
                    <svg className="onb-ai-ring pointer-events-none absolute" style={{ width: '11rem', height: '11rem' }} viewBox="0 0 176 176">
                      <circle cx="88" cy="88" r="84" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.18" />
                    </svg>
                    <svg className="onb-ai-ring-reverse pointer-events-none absolute h-24 w-24" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="44" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.35" />
                    </svg>
                    <svg className="onb-ring-slow pointer-events-none absolute h-16 w-16" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1" strokeDasharray="3 5" opacity="0.3" />
                    </svg>
                    {[
                      { px: '-6rem', py: '-3.5rem', dur: '3.2s', delay: '0s', color: 'bg-accent-cheese-default' },
                      { px: '5.5rem', py: '-4rem', dur: '3.6s', delay: '0.5s', color: 'bg-accent-water-default' },
                      { px: '-5rem', py: '3.5rem', dur: '3.0s', delay: '1.0s', color: 'bg-accent-onion-default' },
                      { px: '6rem', py: '3rem', dur: '3.4s', delay: '1.5s', color: 'bg-accent-cabbage-default' },
                      { px: '-0.5rem', py: '-5rem', dur: '2.8s', delay: '0.3s', color: 'bg-accent-cheese-default' },
                      { px: '6.5rem', py: '-0.5rem', dur: '3.1s', delay: '0.8s', color: 'bg-accent-water-default' },
                    ].map((p) => (
                      <span
                        key={`modal-panel-ai-${p.delay}`}
                        className={classNames(
                          'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                          p.color,
                        )}
                        style={{
                          '--px': p.px,
                          '--py': p.py,
                          '--dur': p.dur,
                          '--delay': p.delay,
                          animationDelay: p.delay,
                        } as React.CSSProperties}
                      />
                    ))}
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                      <MagicIcon secondary size={IconSize.Small} className="text-white" />
                    </div>
                  </div>

                  <h4 className="mb-1.5 font-bold text-text-primary typo-body">
                    Tell our AI about yourself
                  </h4>
                  <p className="mb-5 text-center text-text-tertiary typo-footnote">
                    Describe your stack and let AI build your feed.
                  </p>

                  {/* Textarea */}
                  <div className="onb-textarea-glow mb-3 w-full rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.02] hover:shadow-none focus-within:border-white/[0.18] focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_28px_rgba(0,0,0,0.3)]">
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
                      placeholder={"I'm a frontend engineer working with React and TypeScript. Interested in system design, AI tooling..."}
                      className="min-h-[6.25rem] w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary placeholder:text-text-quaternary transition-colors duration-200 focus:outline-none focus:placeholder:text-text-disabled typo-callout"
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
                            'onb-chip-enter inline-flex items-center gap-1.5 rounded-8 border px-2.5 py-1 font-medium shadow-[0_0_12px_rgba(255,255,255,0.04)] transition-all duration-200 hover:bg-white/[0.14] hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] active:scale-[0.96] focus-visible:outline-none typo-caption1',
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
                      'w-full overflow-hidden transition-all duration-400 ease-out',
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
                          className="onb-chip-enter rounded-8 border border-border-subtlest-tertiary/40 px-2.5 py-1 text-text-tertiary transition-all duration-200 hover:bg-white/[0.06] hover:text-text-secondary active:scale-[0.97] focus-visible:outline-none typo-caption1"
                        >
                          + {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Build feed CTA — disabled when no input */}
                  <div className="relative mt-4 w-full">
                    <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                    <button
                      type="button"
                      disabled={!canStartAiFlow}
                      onClick={startAiFlowFromChooser}
                      className={classNames(
                        'group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 px-5 py-3.5 font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 typo-callout',
                        canStartAiFlow
                          ? 'bg-white text-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]'
                          : 'cursor-not-allowed bg-white/[0.08] text-text-disabled',
                      )}
                    >
                      <MagicIcon secondary size={IconSize.Size16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
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

      {/* ── Extension Promotion Overlay ── */}
      {showExtensionPromo && (
        <div
          className="fixed inset-0 z-modal flex items-end tablet:items-center tablet:justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Install browser extension"
        >
          <div
            className="onb-modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={dismissExtensionPromo}
            role="presentation"
          />

          <div className="onb-ext-enter relative z-1 flex max-h-[100dvh] w-full flex-col items-center overflow-y-auto rounded-t-24 border border-white/[0.10] bg-[#0e1217] shadow-[0_32px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] tablet:max-w-lg tablet:rounded-24">
            {/* Close / Skip */}
            <button
              type="button"
              onClick={dismissExtensionPromo}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-10 text-text-quaternary transition-colors duration-200 hover:text-text-secondary"
              aria-label="Skip"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Top section: text content */}
            <div className="flex w-full flex-col items-center px-5 pt-8 pb-5 tablet:px-8 tablet:pt-10 tablet:pb-6">
              {/* Icon */}
                <div className="onb-ext-reveal mb-5 flex h-14 w-14 items-center justify-center rounded-16 bg-white/[0.06]">
                {isEdgeBrowser ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M21.86 17.86q.14 0 .25.12.1.13.1.25t-.11.33l-.32.46-.43.53-.44.46q-.54.52-1.15.97l-.09.06q-.88.56-1.86.97-1.14.46-2.42.66-1.34.2-2.71.06-1.14-.12-2.2-.5-1.2-.42-2.27-1.12-1.17-.78-2.1-1.86-.83-.94-1.41-2.07-.66-1.27-.96-2.67-.17-.79-.22-1.6-.06-.91.05-1.84.1-.78.3-1.54.27-1.01.72-1.96.37-.78.88-1.51.47-.68 1.03-1.28.41-.44.87-.83l.13-.1q.49-.38 1.04-.71.53-.32 1.1-.56.92-.39 1.93-.56 1.19-.2 2.49-.08.38.03.76.1.36.07.72.17.42.12.82.29.34.14.67.31.3.15.58.33l.06.04q.28.18.55.38 0 0-.55.92T13.8 4.4q-.26-.13-.55-.24-.34-.12-.7-.2-.31-.07-.63-.1-.42-.04-.85-.02-.76.06-1.46.33-.82.32-1.51.86-.57.45-1.03 1.02-.54.66-.9 1.42-.27.57-.42 1.18-.12.48-.17.97-.06.64.03 1.3.11.79.39 1.52.32.82.84 1.52.57.76 1.32 1.34.64.5 1.39.84.79.36 1.66.52.57.1 1.16.12.78.02 1.56-.12.65-.11 1.26-.35.75-.3 1.4-.76.55-.39 1.01-.87.36-.37.67-.78l.36-.56Z" fill="#0078D4" />
                  </svg>
                ) : (
                    <ChromeIcon aria-hidden size={IconSize.Medium} />
                )}
              </div>

              {/* Headline */}
              <h2 className="onb-ext-reveal mb-2 text-center font-bold text-text-primary typo-title1" style={{ animationDelay: '80ms' }}>
                Open this every time you{'\u00A0'}open a new tab
              </h2>

              {/* Trust line */}
              <p
                className="onb-ext-reveal mb-5 text-center text-text-quaternary typo-footnote"
                style={{ animationDelay: '160ms' }}
              >
                Trusted by 500K+ developers &middot; Only replaces your new tab
              </p>

              {/* CTA */}
              <button
                type="button"
                onClick={() => {
                  window.open(downloadBrowserExtension, '_blank', 'noopener,noreferrer');
                  dismissExtensionPromo();
                }}
                className="onb-ext-reveal group mb-4 flex w-full items-center justify-center gap-2.5 rounded-14 bg-white py-3.5 font-bold text-black transition-all duration-200 hover:bg-white/90 typo-callout"
                style={{ animationDelay: '240ms' }}
              >
                {isEdgeBrowser ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M21.86 17.86q.14 0 .25.12.1.13.1.25t-.11.33l-.32.46-.43.53-.44.46q-.54.52-1.15.97l-.09.06q-.88.56-1.86.97-1.14.46-2.42.66-1.34.2-2.71.06-1.14-.12-2.2-.5-1.2-.42-2.27-1.12-1.17-.78-2.1-1.86-.83-.94-1.41-2.07-.66-1.27-.96-2.67-.17-.79-.22-1.6-.06-.91.05-1.84.1-.78.3-1.54.27-1.01.72-1.96.37-.78.88-1.51.47-.68 1.03-1.28.41-.44.87-.83l.13-.1q.49-.38 1.04-.71.53-.32 1.1-.56.92-.39 1.93-.56 1.19-.2 2.49-.08.38.03.76.1.36.07.72.17.42.12.82.29.34.14.67.31.3.15.58.33l.06.04q.28.18.55.38 0 0-.55.92T13.8 4.4q-.26-.13-.55-.24-.34-.12-.7-.2-.31-.07-.63-.1-.42-.04-.85-.02-.76.06-1.46.33-.82.32-1.51.86-.57.45-1.03 1.02-.54.66-.9 1.42-.27.57-.42 1.18-.12.48-.17.97-.06.64.03 1.3.11.79.39 1.52.32.82.84 1.52.57.76 1.32 1.34.64.5 1.39.84.79.36 1.66.52.57.1 1.16.12.78.02 1.56-.12.65-.11 1.26-.35.75-.3 1.4-.76.55-.39 1.01-.87.36-.37.67-.78l.36-.56Z" fill="#0078D4" />
                  </svg>
                ) : (
                  <ChromeIcon aria-hidden size={IconSize.Size16} />
                )}
                Add to {isEdgeBrowser ? 'Edge' : 'Chrome'} — it&apos;s free
              </button>

              {/* Skip */}
              <button
                type="button"
                onClick={dismissExtensionPromo}
                className="onb-ext-reveal flex w-full items-center justify-center gap-1.5 rounded-14 border border-white/[0.10] bg-white/[0.04] py-3 text-text-secondary transition-all duration-200 typo-callout hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-text-primary"
                style={{ animationDelay: '300ms' }}
              >
                Continue without extension
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Screenshot with float animation */}
            <div className="onb-ext-reveal relative w-full px-4 pb-4 tablet:px-6 tablet:pb-6" style={{ animationDelay: '380ms' }}>
              <div className="onb-ext-float overflow-hidden rounded-16 shadow-[0_16px_60px_rgba(0,0,0,0.4)]">
                <img
                  alt={`daily.dev extension in ${isEdgeBrowser ? 'Edge' : 'Chrome'}`}
                  className="block w-full"
                  loading="eager"
                  src={extensionImages.default}
                  srcSet={`${extensionImages.default} 820w, ${extensionImages.retina} 1640w`}
                  sizes="(max-width: 480px) 100vw, 480px"
                />
              </div>
            </div>

            {/* Social proof */}
            <div className="onb-ext-reveal w-full border-t border-white/[0.06] px-5 py-4 tablet:px-8" style={{ animationDelay: '440ms' }}>
              <p className="text-center text-text-quaternary typo-caption1">
                Trusted by <span className="font-bold text-text-tertiary">500,000+</span> developers
              </p>
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
            className="onb-modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={closeGithubImportFlow}
            role="presentation"
          />

          {/* Centered content */}
          <div className="relative z-1 flex max-h-[100dvh] w-full flex-col items-center overflow-y-auto rounded-t-20 border border-white/[0.10] bg-[#0e1217] px-5 py-6 shadow-[0_32px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] tablet:mx-4 tablet:max-w-md tablet:rounded-20 tablet:px-6">
            <button
              type="button"
              onClick={closeGithubImportFlow}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {/* ── Animated orb — full-width energy field ── */}
            <div className="pointer-events-none relative -mx-5 -mt-6 mb-0 flex h-32 items-center justify-center overflow-hidden tablet:-mx-6" style={{ width: 'calc(100% + 2.5rem)' }}>
              <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 0%, ${importFlowSource === 'github' ? 'var(--theme-accent-cabbage-default)' : 'var(--theme-accent-onion-default)'} 0%, transparent 65%)`, opacity: 0.22 }} />
              <div className={classNames('pointer-events-none absolute h-32 w-52 rounded-full blur-3xl', importFlowSource === 'github' ? 'ghub-orb-glow bg-accent-cabbage-default/15' : 'onb-ai-orb-glow bg-accent-onion-default/15')} />
              <svg className={classNames('pointer-events-none absolute', importFlowSource === 'github' ? 'ghub-ring' : 'onb-ai-ring')} style={{ width: '11rem', height: '11rem' }} viewBox="0 0 176 176">
                <circle cx="88" cy="88" r="84" fill="none" stroke={importFlowSource === 'github' ? 'var(--theme-accent-cabbage-default)' : 'var(--theme-accent-onion-default)'} strokeWidth="1.5" strokeDasharray="6 10" opacity="0.18" />
              </svg>
              <svg className={classNames('pointer-events-none absolute h-24 w-24', importFlowSource === 'github' ? 'ghub-ring-reverse' : 'onb-ai-ring-reverse')} viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="44" fill="none" stroke={importFlowSource === 'github' ? 'var(--theme-accent-cabbage-default)' : 'var(--theme-accent-onion-default)'} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.35" />
              </svg>
              <svg className="onb-ring-slow pointer-events-none absolute h-16 w-16" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke={importFlowSource === 'github' ? 'var(--theme-accent-cabbage-default)' : 'var(--theme-accent-onion-default)'} strokeWidth="1" strokeDasharray="3 5" opacity="0.3" />
              </svg>
              {[
                { px: '-6rem', py: '-3.5rem', dur: '3.0s', delay: '0s', color: 'bg-accent-cheese-default' },
                { px: '5.5rem', py: '-4rem', dur: '3.4s', delay: '0.5s', color: 'bg-accent-water-default' },
                { px: '-5rem', py: '3.5rem', dur: '3.2s', delay: '1.0s', color: 'bg-accent-cabbage-default' },
                { px: '6rem', py: '3rem', dur: '3.6s', delay: '1.5s', color: 'bg-accent-onion-default' },
                { px: '0.5rem', py: '-5rem', dur: '2.8s', delay: '0.7s', color: 'bg-accent-cheese-default' },
                { px: '-6.5rem', py: '0.5rem', dur: '3.1s', delay: '1.2s', color: 'bg-accent-water-default' },
              ].map((p) => (
                <span
                  key={`import-flow-${p.delay}`}
                  className={classNames(
                    'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                    p.color,
                  )}
                  style={{
                    '--px': p.px,
                    '--py': p.py,
                    '--dur': p.dur,
                    '--delay': p.delay,
                    animationDelay: p.delay,
                  } as React.CSSProperties}
                />
              ))}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                {importFlowSource === 'github' ? (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-text-primary">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                ) : (
                  <MagicIcon secondary size={IconSize.Small} className="text-text-primary" />
                )}
              </div>
            </div>

            {/* ── Title & progress ── */}
            <h2 className="mb-1 text-center font-bold text-text-primary typo-title3">
              {githubImportPhase === 'complete'
                ? 'Your feed is ready'
                : githubImportPhase === 'awaitingSeniority' || githubImportPhase === 'confirmingSeniority'
                  ? 'Almost there'
                  : importFlowSource === 'github'
                    ? 'Reading your GitHub'
                    : 'Analyzing your profile'}
            </h2>

            <p className="mb-4 text-center text-text-tertiary typo-footnote">
              {githubImportPhase === 'complete'
                ? 'We built a personalized feed just for you.'
                : githubImportPhase === 'awaitingSeniority'
                  ? importFlowSource === 'github'
                    ? 'One thing we couldn\u2019t find on your profile.'
                    : 'One last detail to finish your profile setup.'
                  : githubImportPhase === 'confirmingSeniority'
                    ? 'Got it. Finishing up...'
                    : currentImportStep}
            </p>

            {/* ── Progress track ── */}
            {githubImportPhase !== 'complete' && (
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
              <div className="mb-4 w-full overflow-hidden rounded-16 border border-white/[0.06] bg-white/[0.01] p-3.5">
                <div key={githubImportBodyPhase} className="ghub-phase-panel min-h-[10.5rem]">
                  {/* ── Import checklist (during active import) ── */}
                  {(githubImportPhase === 'running' ||
                    githubImportPhase === 'finishing') && (
                    <div className="flex w-full flex-col gap-2.5">
                      {importSteps.map((step, i) => {
                        const done = githubImportProgress >= step.threshold;
                        const active =
                          !done && githubImportProgress >= step.threshold - 16;
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
                  {githubImportPhase === 'awaitingSeniority' && (
                    <div>
                      <p className="mb-3 text-left font-medium text-text-primary typo-callout">
                        What is your seniority level?
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {EXPERIENCE_LEVEL_OPTIONS.map((option) => {
                          const optionParts = getExperienceLevelOptionParts(
                            option.label,
                          );
                          const optionMeta = optionParts.meta ?? 'Non-technical';
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
                                'group flex items-center rounded-12 border px-4 py-2.5 text-left transition-all duration-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default/60',
                                isSelected
                                  ? 'border-white/[0.24] bg-surface-hover text-text-primary shadow-[0_8px_24px_rgba(0,0,0,0.3)]'
                                  : 'border-white/[0.12] bg-surface-float text-text-secondary hover:border-white/[0.2] hover:bg-surface-hover hover:text-text-primary',
                              )}
                            >
                              <span
                                className={classNames(
                                  'min-w-0 flex-1 truncate font-medium leading-tight typo-callout',
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

                  {/* ── Seniority confirmation ── */}
                  {githubImportPhase === 'confirmingSeniority' && (
                    <div className="flex h-full flex-col justify-center rounded-12 border border-white/[0.08] bg-surface-float px-4 py-3">
                      <p className="text-text-secondary typo-footnote">
                        Applying your experience level
                      </p>
                      {selectedExperienceLevelLabel && (
                        <p className="mt-1 truncate text-text-primary typo-callout">
                          {selectedExperienceLevelLabel}
                        </p>
                      )}
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-[0.125rem] bg-white/[0.12]">
                        <span className="block h-full w-1/2 animate-pulse rounded-[0.125rem] bg-accent-cabbage-default/80" />
                      </div>
                    </div>
                  )}
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
            className="onb-modal-backdrop absolute inset-0 bg-black/80 backdrop-blur-lg"
            onClick={() => setShowSignupPrompt(false)}
            role="presentation"
          />

          {/* Modal */}
          <div className="onb-modal-enter onb-glass relative flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-20 border border-white/[0.08] bg-background-default shadow-[0_24px_80px_rgba(0,0,0,0.5)] tablet:max-w-[26rem] tablet:rounded-20">
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowSignupPrompt(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
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

              {/* ── Shared AI setup context (manual + ai) ── */}
              {isAiSetupContext && (
                <>
                  <div className="pointer-events-none relative -mx-5 -mt-8 mb-0 flex h-32 items-center justify-center overflow-hidden tablet:-mx-7" style={{ width: 'calc(100% + 2.5rem)' }}>
                    <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--theme-accent-onion-default) 0%, transparent 65%)', opacity: 0.22 }} />
                    <div className="onb-ai-orb-glow pointer-events-none absolute h-32 w-52 rounded-full bg-accent-onion-default/15 blur-3xl" />
                    <svg className="onb-ai-ring pointer-events-none absolute" style={{ width: '11rem', height: '11rem' }} viewBox="0 0 176 176">
                      <circle cx="88" cy="88" r="84" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.18" />
                    </svg>
                    <svg className="onb-ai-ring-reverse pointer-events-none absolute h-24 w-24" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="44" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.35" />
                    </svg>
                    <svg className="onb-ring-slow pointer-events-none absolute h-16 w-16" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1" strokeDasharray="3 5" opacity="0.3" />
                    </svg>
                    {[
                      { px: '-6rem', py: '-3.5rem', dur: '3.2s', delay: '0s', color: 'bg-accent-cheese-default' },
                      { px: '5.5rem', py: '-4rem', dur: '3.6s', delay: '0.5s', color: 'bg-accent-water-default' },
                      { px: '-5rem', py: '3.5rem', dur: '3.0s', delay: '1.0s', color: 'bg-accent-onion-default' },
                      { px: '6rem', py: '3rem', dur: '3.4s', delay: '1.5s', color: 'bg-accent-cabbage-default' },
                      { px: '-0.5rem', py: '-5rem', dur: '2.8s', delay: '0.3s', color: 'bg-accent-cheese-default' },
                      { px: '6.5rem', py: '-0.5rem', dur: '3.1s', delay: '0.8s', color: 'bg-accent-water-default' },
                    ].map((p) => (
                      <span
                        key={`signup-ai-${p.delay}`}
                        className={classNames(
                          'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                          p.color,
                        )}
                        style={{
                          '--px': p.px,
                          '--py': p.py,
                          '--dur': p.dur,
                          '--delay': p.delay,
                          animationDelay: p.delay,
                        } as React.CSSProperties}
                      />
                    ))}
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
                      <MagicIcon secondary size={IconSize.Small} className="text-white" />
                    </div>
                  </div>
                  <div className="mt-4 mb-4 flex flex-col items-center">
                    <h4 className="mb-1.5 font-bold text-text-primary typo-body">
                      Tell our AI about yourself
                    </h4>
                    <p className="mb-5 text-center text-text-tertiary typo-footnote">
                      Describe your stack and let AI build your feed.
                    </p>
                  </div>

                  <div className="onb-textarea-glow mb-3 w-full rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.02] hover:shadow-none focus-within:border-white/[0.18] focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_28px_rgba(0,0,0,0.3)]">
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
                      className="min-h-[6.25rem] w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary placeholder:text-text-quaternary transition-colors duration-200 focus:outline-none focus:placeholder:text-text-disabled typo-callout"
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
                  {recommendedTopics.length > 0 && (
                    <div className="mb-2 w-full overflow-hidden transition-all duration-400 ease-out">
                      <div className="flex flex-wrap gap-1.5">
                      {recommendedTopics.map(({ label }) => (
                        <button
                          key={`signup-match-${label}`}
                          type="button"
                          onClick={() => toggleTopic(label)}
                          className="onb-chip-enter rounded-8 border border-border-subtlest-tertiary/40 px-2.5 py-1 text-text-tertiary transition-all duration-200 hover:bg-white/[0.06] hover:text-text-secondary active:scale-[0.97] focus-visible:outline-none typo-caption1"
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
              <div className={classNames('relative', isAiSetupContext && 'mt-4 w-full')}>
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
                ) : isAiSetupContext ? (
                  <>
                    <button
                      type="button"
                      disabled={!canStartAiFlow}
                      className={classNames(
                        'group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 px-5 py-3.5 font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 typo-callout',
                        canStartAiFlow
                          ? 'bg-white text-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]'
                          : 'cursor-not-allowed bg-white/[0.08] text-text-disabled',
                      )}
                      onClick={startAiFlowFromSignup}
                    >
                      <MagicIcon secondary size={IconSize.Size16} className={classNames('transition-transform duration-300', canStartAiFlow && 'group-hover:translate-x-0.5')} />
                      Generate my feed with AI
                    </button>
                    <p className="mt-2.5 text-center text-text-quaternary typo-caption2">
                      AI-powered &middot; instant personalization
                    </p>
                  </>
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
