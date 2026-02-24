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
import {
  ThemeMode,
  useSettingsContext,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { downloadBrowserExtension } from '@dailydotdev/shared/src/lib/constants';
import { UserExperienceLevel } from '@dailydotdev/shared/src/lib/user';
import {
  BrowserName,
  getCurrentBrowserName,
} from '@dailydotdev/shared/src/lib/func';
import { cloudinaryOnboardingExtension } from '@dailydotdev/shared/src/lib/image';
import { ChromeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Chrome';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
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

type GithubImportPhase =
  | 'idle'
  | 'running'
  | 'awaitingSeniority'
  | 'confirmingSeniority'
  | 'finishing'
  | 'complete';

type AiProcessingPhase = 'idle' | 'analyzing' | 'complete';

const AI_PROCESSING_STEPS = [
  { label: 'Reading your description', threshold: 15 },
  { label: 'Extracting technologies', threshold: 35 },
  { label: 'Mapping interests', threshold: 55 },
  { label: 'Identifying seniority', threshold: 75 },
  { label: 'Building your feed', threshold: 95 },
];

const EXPERIENCE_LEVEL_OPTIONS = Object.entries(UserExperienceLevel).map(
  ([value, label]) => ({
    value: value as keyof typeof UserExperienceLevel,
    label,
  }),
);

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

const TopicPill = ({ label }: { label: string }): ReactElement => (
  <span className="pointer-events-none shrink-0 whitespace-nowrap rounded-10 border border-white/[0.12] bg-white/[0.06] px-3.5 py-1.5 text-text-secondary backdrop-blur-sm typo-caption1">
    {label}
  </span>
);

const OnboardingV2Page = (): ReactElement => {
  const router = useRouter();
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
  const [showGithubImportFlow, setShowGithubImportFlow] = useState(false);
  const [showAiProcessing, setShowAiProcessing] = useState(false);
  const [aiProcessingPhase, setAiProcessingPhase] =
    useState<AiProcessingPhase>('idle');
  const [aiProcessingProgress, setAiProcessingProgress] = useState(0);
  const [showAuthAfterAi, setShowAuthAfterAi] = useState(false);
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
  const aiProcessingTimerRef = useRef<number | null>(null);

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

  const startGithubImportFlow = useCallback(() => {
    clearGithubImportTimer();
    clearGithubResumeTimeout();
    setSelectedExperienceLevel(null);
    setGithubImportProgress(10);
    setGithubImportPhase('running');
    setShowGithubImportFlow(true);
  }, [clearGithubImportTimer, clearGithubResumeTimeout]);

  const closeGithubImportFlow = useCallback(() => {
    clearGithubImportTimer();
    clearGithubResumeTimeout();
    setShowGithubImportFlow(false);
    setSelectedExperienceLevel(null);
    setGithubImportProgress(0);
    setGithubImportPhase('idle');
  }, [clearGithubImportTimer, clearGithubResumeTimeout]);

  const clearAiProcessingTimer = useCallback(() => {
    if (aiProcessingTimerRef.current === null) {
      return;
    }
    window.clearInterval(aiProcessingTimerRef.current);
    aiProcessingTimerRef.current = null;
  }, []);

  const startAiProcessing = useCallback(() => {
    clearAiProcessingTimer();
    setAiProcessingProgress(5);
    setAiProcessingPhase('analyzing');
    setShowAiProcessing(true);
  }, [clearAiProcessingTimer]);

  const closeAiProcessing = useCallback(() => {
    clearAiProcessingTimer();
    setShowAiProcessing(false);
    setAiProcessingProgress(0);
    setAiProcessingPhase('idle');
  }, [clearAiProcessingTimer]);

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
      showSignupPrompt ||
      showGithubImportFlow ||
      showAiProcessing ||
      showAuthAfterAi ||
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
    showSignupPrompt,
    showGithubImportFlow,
    showAiProcessing,
    showAuthAfterAi,
    showExtensionPromo,
  ]);

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
      clearAiProcessingTimer();
    };
  }, [
    clearGithubImportTimer,
    clearGithubResumeTimeout,
    clearAiProcessingTimer,
  ]);

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
    if (!showAiProcessing || aiProcessingPhase !== 'analyzing') {
      return undefined;
    }

    clearAiProcessingTimer();

    aiProcessingTimerRef.current = window.setInterval(() => {
      setAiProcessingProgress((prev) => {
        const next = Math.min(100, prev + 2);

        if (next >= 100) {
          clearAiProcessingTimer();
          setAiProcessingPhase('complete');
          setTimeout(() => {
            setShowAiProcessing(false);
            setShowAuthAfterAi(true);
          }, 600);
          return 100;
        }

        return next;
      });
    }, 100);

    return () => {
      clearAiProcessingTimer();
    };
  }, [showAiProcessing, aiProcessingPhase, clearAiProcessingTimer]);

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
  const dismissAuthAfterAi = useCallback(() => {
    setShowAuthAfterAi(false);
  }, []);
  const isAiSetupContext =
    signupContext === 'ai' || signupContext === 'manual';
  const canStartAiFlow = aiPrompt.trim().length > 0 || selectedTopics.size > 0;
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
  const currentGithubImportStep = useMemo(() => {
    if (githubImportPhase === 'awaitingSeniority') {
      return 'Waiting for your seniority level';
    }
    if (githubImportPhase === 'confirmingSeniority') {
      return 'Applying your seniority level';
    }
    if (githubImportPhase === 'complete') {
      return 'Your feed is ready';
    }

    const upcomingStep = GITHUB_IMPORT_STEPS.find(
      (step) => githubImportProgress < step.threshold,
    );
    return upcomingStep?.label ?? 'Building personalized feed';
  }, [githubImportPhase, githubImportProgress]);

  const currentAiStep = useMemo(() => {
    if (aiProcessingPhase === 'complete') {
      return 'Feed generated';
    }
    const upcoming = AI_PROCESSING_STEPS.find(
      (step) => aiProcessingProgress < step.threshold,
    );
    return upcoming?.label ?? 'Finalizing your feed';
  }, [aiProcessingPhase, aiProcessingProgress]);

  return (
    <div className={classNames('onb-page onb-sidebar-locked relative', !feedReadyState && 'onb-page-locked')} role="presentation">
      <div className={classNames('onb-top-explore fixed left-1/2 top-4 z-header hidden -translate-x-1/2 items-center gap-2 rounded-12 border border-white/[0.08] bg-background-default/80 px-4 py-1.5 text-text-secondary shadow-1 backdrop-blur-md typo-callout laptop:flex', feedReadyState && '!hidden')}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-avocado-default opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-avocado-default" />
        </span>
        <span className="text-text-quaternary typo-caption1">
          1M+ developers &middot; live now
        </span>
      </div>
      {/* ── Hero ── */}
      <section ref={heroRef} className={classNames('onb-hero relative overflow-hidden pb-20 pt-24 tablet:pb-24 tablet:pt-28', feedReadyState && 'hidden')} style={{ '--scroll-y': '0' } as React.CSSProperties}>
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
            <p className="mx-auto mt-5 max-w-[30rem] text-text-secondary typo-body tablet:typo-callout">
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
                onClick={startGithubImportFlow}
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

      </section>

      {/* ── Topic marquee with gradient backdrop ── */}
      <div
        className={classNames(
          'relative mb-3 mt-2 pb-0 pt-2 transition-all duration-700 ease-out',
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          feedReadyState && 'hidden',
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
          <div className="onb-ready-burst pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[48rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent-cabbage-default/[0.14] blur-[120px]" />
          <div className="onb-ready-burst pointer-events-none absolute left-1/2 top-0 h-[16rem] w-[28rem] -translate-x-1/2 -translate-y-1/4 rounded-full bg-accent-onion-default/[0.10] blur-[90px]" style={{ animationDelay: '150ms' }} />
          <div className="onb-ready-burst pointer-events-none absolute left-1/2 top-0 h-[10rem] w-[16rem] -translate-x-1/2 -translate-y-1/5 rounded-full bg-accent-water-default/[0.08] blur-[60px]" style={{ animationDelay: '350ms' }} />

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

          <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6">
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
            <div className="onb-ready-reveal flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '380ms' }}>
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
              className="pointer-events-none absolute inset-x-0 bottom-[-6rem] h-[18rem] bg-background-default transition-opacity duration-300"
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
                className="onb-cursor-glow mx-auto max-w-[48rem] px-5 pb-10 pt-16 tablet:px-8 tablet:pt-20"
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
            <div className="relative z-1 flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:gap-5">
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
                  'onb-glass flex flex-1 flex-col rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out',
                  panelVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0',
                )}
                style={{ transitionDelay: '350ms' }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="onb-ai-icon-glow relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.18] bg-white/[0.08]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-white"
                    >
                      <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="currentColor" opacity="0.9" />
                      <path d="M19 15l1.04 3.13L23.18 19l-3.14.87L19 23l-1.04-3.13L14.82 19l3.14-.87L19 15z" fill="currentColor" opacity="0.5" />
                      <path d="M5 17l.78 2.34L8.13 20l-2.35.66L5 23l-.78-2.34L1.87 20l2.35-.66L5 17z" fill="currentColor" opacity="0.35" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary typo-callout">
                      Tell our AI about yourself
                    </h4>
                    <p className="text-text-quaternary typo-caption2">
                      AI-powered &middot; instant personalization
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
                        startAiProcessing();
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
                    className="text-white/70"
                  >
                    <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="currentColor" />
                  </svg>
                  Our AI extracts your interests to build a unique feed
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
                    onClick={() => startAiProcessing()}
                    className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-4 py-3.5 font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_8px_30px_rgba(255,255,255,0.18)] focus-visible:outline-none"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5">
                      <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="currentColor" opacity="0.9" />
                    </svg>
                    {selectedTopics.size > 0
                      ? `Generate with AI · ${selectedTopics.size} topic${selectedTopics.size !== 1 ? 's' : ''}`
                      : 'Generate my feed with AI'}
                  </button>
                </div>
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
        .onb-sidebar-locked aside,
        .onb-sidebar-locked nav[aria-label] {
          pointer-events: none !important;
          opacity: 0.22 !important;
          user-select: none !important;
          filter: grayscale(1) brightness(0.5) !important;
          cursor: not-allowed !important;
        }

        .onb-sidebar-locked aside a,
        .onb-sidebar-locked aside button,
        .onb-sidebar-locked aside [role="button"],
        .onb-sidebar-locked aside svg,
        .onb-sidebar-locked aside img {
          pointer-events: none !important;
          cursor: not-allowed !important;
          color: var(--theme-text-disabled) !important;
          fill: var(--theme-text-disabled) !important;
        }

        .onb-page-locked aside,
        .onb-page-locked nav[aria-label] {
          pointer-events: none !important;
          opacity: 0.22 !important;
          user-select: none !important;
          filter: grayscale(1) brightness(0.5) !important;
          cursor: not-allowed !important;
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

        /* ─── GITHUB IMPORT FLOW ─── */

        /* Orb: soft breathing glow behind the icon */
        @keyframes ghub-orb-breathe {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
        .ghub-orb-glow {
          animation: ghub-orb-breathe 2.6s ease-in-out infinite;
        }

        /* Rings that rotate around the orb (data flowing) */
        @keyframes ghub-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .ghub-ring { animation: ghub-ring-spin 6s linear infinite; }
        .ghub-ring-reverse { animation: ghub-ring-spin 9s linear infinite reverse; }

        /* Particles that fly toward the orb center */
        @keyframes ghub-particle-in {
          0% { transform: translate(var(--px), var(--py)) scale(0.7); opacity: 0; }
          30% { opacity: 1; }
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
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.15); opacity: 0.4; }
        }
        .onb-ai-orb-glow {
          animation: onb-ai-orb-breathe 2.5s ease-in-out infinite;
        }
        @keyframes onb-ai-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .onb-ai-ring {
          animation: onb-ai-ring-spin 12s linear infinite;
        }
        .onb-ai-ring-reverse {
          animation: onb-ai-ring-spin 8s linear infinite reverse;
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

          .onb-feed-stage:not(.onb-feed-unlocked) [data-testid='posts-feed'] article {
            grid-column: 1 / -1 !important;
          }

          /* Mobile list mode: flatten cards to match main feed */
          .onb-feed-stage [data-testid='posts-feed'] {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .onb-feed-stage [data-testid='posts-feed'] article {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            background: transparent !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border-top: 0 !important;
            border-bottom: 0 !important;
            border-left: 0 !important;
            border-right: 0 !important;
          }
          .onb-feed-stage:not(.onb-feed-unlocked) [data-testid='posts-feed'] article {
            transform: translateY(0.45rem) scale(1) !important;
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
          .onb-modal-backdrop,
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
          .onb-ext-enter,
          .onb-ext-reveal,
          .onb-ext-float,
          .onb-sparkle,
          .onb-confetti-star {
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

      {/* ── AI Processing Overlay ── */}
      {showAiProcessing && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="AI personalization"
        >
          <div
            className="onb-modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={closeAiProcessing}
            role="presentation"
          />

          <button
            type="button"
            onClick={closeAiProcessing}
            className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-10 text-text-quaternary transition-colors duration-200 hover:text-text-secondary"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="relative z-1 flex w-full max-w-md flex-col items-center rounded-24 border border-white/[0.10] bg-[#0e1217] px-8 py-10 shadow-[0_32px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]">
            {/* Animated AI orb */}
            <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
              <div className="onb-ai-orb-glow pointer-events-none absolute inset-0 rounded-full bg-accent-cabbage-default/25 blur-xl" />

              <svg className="onb-ai-ring pointer-events-none absolute h-full w-full" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="52" fill="none" stroke="var(--theme-accent-cabbage-default)" strokeWidth="1" strokeDasharray="4 6" opacity="0.35" />
              </svg>
              <svg className="onb-ai-ring-reverse pointer-events-none absolute h-20 w-20" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1" strokeDasharray="3 8" opacity="0.3" />
              </svg>

              {/* Sparkle particles */}
              {[
                { px: '-2.5rem', py: '-1.5rem', dur: '2.2s', delay: '0s' },
                { px: '2.25rem', py: '-2rem', dur: '2.6s', delay: '0.5s' },
                { px: '-2rem', py: '2rem', dur: '2.0s', delay: '1.0s' },
                { px: '2.5rem', py: '1.25rem', dur: '2.4s', delay: '0.3s' },
                { px: '0rem', py: '-2.75rem', dur: '2.1s', delay: '0.7s' },
              ].map((p, i) => (
                <span
                  key={`ai-p-${i}`}
                  className="ghub-particle pointer-events-none absolute h-1 w-1 rounded-full bg-accent-cabbage-default"
                  style={{
                    left: `calc(50% + ${p.px})`,
                    top: `calc(50% + ${p.py})`,
                    animationDuration: p.dur,
                    animationDelay: p.delay,
                  }}
                />
              ))}

              {/* Center sparkle icon */}
              <div className="relative z-1 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.06] bg-[#0e1217]">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="currentColor" opacity="0.9" />
                  <path d="M19 15l1.04 3.13L23.18 19l-3.14.87L19 23l-1.04-3.13L14.82 19l3.14-.87L19 15z" fill="currentColor" opacity="0.5" />
                  <path d="M5 17l.78 2.34L8.13 20l-2.35.66L5 23l-.78-2.34L1.87 20l2.35-.66L5 17z" fill="currentColor" opacity="0.35" />
                </svg>
              </div>
            </div>

            <h2 className="mb-2 text-center text-text-primary typo-title2">
              {aiProcessingPhase === 'complete'
                ? 'Your feed is ready'
                : 'Analyzing your profile'}
            </h2>

            <p className="mb-6 text-center text-text-tertiary typo-callout">
              {aiProcessingPhase === 'complete'
                ? 'We built a personalized feed just for you.'
                : currentAiStep}
            </p>

            {/* Progress bar */}
            {aiProcessingPhase !== 'complete' && (
              <div className="mb-8 w-full">
                <div className="relative h-1.5 w-full overflow-hidden rounded-[0.125rem] bg-white/[0.10]">
                  <div
                    className="h-full rounded-[0.125rem] bg-accent-cabbage-default transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(aiProcessingProgress, 6)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Step checklist */}
            {aiProcessingPhase === 'analyzing' && (
              <div className="flex w-full flex-col gap-1.5">
                {AI_PROCESSING_STEPS.map((step, i) => {
                  const done = aiProcessingProgress >= step.threshold;
                  const active = !done && aiProcessingProgress >= step.threshold - 16;

                  return (
                    <div
                      key={step.label}
                      className="ghub-step-reveal flex items-center gap-2.5"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span
                        className={classNames(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                          done
                            ? 'bg-accent-avocado-default/20'
                            : active
                              ? 'bg-accent-cabbage-default/20'
                              : 'bg-surface-float',
                        )}
                      >
                        {done ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-accent-avocado-default">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span
                            className={classNames(
                              'h-1.5 w-1.5 rounded-full',
                              active ? 'bg-accent-cabbage-default' : 'bg-text-quaternary',
                            )}
                          />
                        )}
                      </span>
                      <span
                        className={classNames(
                          'transition-colors duration-300 typo-footnote',
                          done ? 'text-text-primary' : active ? 'text-text-secondary' : 'text-text-quaternary',
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quoted user input */}
            {aiProcessingPhase === 'analyzing' && aiPrompt.trim() && (
              <div className="mt-6 w-full rounded-12 border border-accent-cabbage-default/10 bg-accent-cabbage-default/[0.04] px-4 py-3">
                <p className="line-clamp-2 text-text-tertiary typo-footnote italic">
                  &ldquo;{aiPrompt}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Auth / Registration (after AI processing) ── */}
      {showAuthAfterAi && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create your account"
        >
          <div
            className="onb-modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={dismissAuthAfterAi}
            role="presentation"
          />

          <div className="onb-modal-enter relative z-1 w-full max-w-[26rem] rounded-24 border border-white/[0.10] bg-[#0e1217] shadow-[0_32px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]">
            <button
              type="button"
              onClick={dismissAuthAfterAi}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-10 text-text-quaternary transition-colors duration-200 hover:text-text-secondary"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="px-7 pb-7 pt-8">
              {/* Success badge */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-avocado-default/15">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent-avocado-default">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-text-primary typo-title3">
                    Your feed is generated
                  </h3>
                  <p className="text-accent-avocado-default typo-caption1">
                    Personalized with AI
                  </p>
                </div>
              </div>

              <p className="mb-6 text-text-secondary typo-callout">
                Create an account to save your personalized feed and unlock all features.
              </p>

              {/* Auth providers */}
              <div className="flex flex-col gap-2.5">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthAfterAi(false);
                    setShowExtensionPromo(true);
                  }}
                  className="group flex w-full items-center gap-3 rounded-14 border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.07]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="font-medium text-text-primary typo-callout">
                    Continue with Google
                  </span>
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthAfterAi(false);
                    startGithubImportFlow();
                  }}
                  className="group flex w-full items-center gap-3 rounded-14 border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.07]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-text-primary">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span className="font-medium text-text-primary typo-callout">
                    Continue with GitHub
                  </span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-text-quaternary typo-caption2">or</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                {/* Email */}
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthAfterAi(false);
                    setShowExtensionPromo(true);
                  }}
                  className="group flex w-full items-center gap-3 rounded-14 border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.07]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-secondary">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="font-medium text-text-primary typo-callout">
                    Continue with email
                  </span>
                </button>
              </div>

              {/* Terms */}
              <p className="mt-5 text-center text-text-quaternary typo-caption2">
                By signing up you agree to our Terms of Service and Privacy Policy
              </p>
              <button
                type="button"
                onClick={dismissAuthAfterAi}
                className="mt-2 w-full rounded-12 py-2.5 text-center text-text-quaternary transition-all duration-200 typo-footnote hover:text-text-tertiary"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Extension Promotion Overlay ── */}
      {showExtensionPromo && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Install browser extension"
        >
          <div
            className="onb-modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={dismissExtensionPromo}
            role="presentation"
          />

          <div className="onb-ext-enter relative z-1 flex w-full max-w-lg flex-col items-center overflow-hidden rounded-24 border border-white/[0.10] bg-[#0e1217] shadow-[0_32px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]">
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
            <div className="flex w-full flex-col items-center px-8 pt-10 pb-6">
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
              <h2 className="onb-ext-reveal mb-3 text-center text-text-primary typo-title1" style={{ animationDelay: '80ms' }}>
                Open this every time you{'\u00A0'}open a new tab
              </h2>

              {/* Trust anchor */}
              <div
                className="onb-ext-reveal mb-5 flex items-center gap-2 rounded-12 bg-white/[0.05] px-4 py-2"
                style={{ animationDelay: '160ms' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-accent-avocado-default">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="text-text-tertiary typo-callout">
                  Only controls your new tab. Doesn&apos;t run on other sites.
                </span>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => {
                  window.open(downloadBrowserExtension, '_blank', 'noopener,noreferrer');
                  dismissExtensionPromo();
                }}
                className="onb-ext-reveal group mb-3 flex w-full items-center justify-center gap-2.5 rounded-14 bg-white py-3.5 font-bold text-black transition-all duration-200 hover:bg-white/90 typo-callout"
                style={{ animationDelay: '240ms' }}
              >
                {isEdgeBrowser ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M21.86 17.86q.14 0 .25.12.1.13.1.25t-.11.33l-.32.46-.43.53-.44.46q-.54.52-1.15.97l-.09.06q-.88.56-1.86.97-1.14.46-2.42.66-1.34.2-2.71.06-1.14-.12-2.2-.5-1.2-.42-2.27-1.12-1.17-.78-2.1-1.86-.83-.94-1.41-2.07-.66-1.27-.96-2.67-.17-.79-.22-1.6-.06-.91.05-1.84.1-.78.3-1.54.27-1.01.72-1.96.37-.78.88-1.51.47-.68 1.03-1.28.41-.44.87-.83l.13-.1q.49-.38 1.04-.71.53-.32 1.1-.56.92-.39 1.93-.56 1.19-.2 2.49-.08.38.03.76.1.36.07.72.17.42.12.82.29.34.14.67.31.3.15.58.33l.06.04q.28.18.55.38 0 0-.55.92T13.8 4.4q-.26-.13-.55-.24-.34-.12-.7-.2-.31-.07-.63-.1-.42-.04-.85-.02-.76.06-1.46.33-.82.32-1.51.86-.57.45-1.03 1.02-.54.66-.9 1.42-.27.57-.42 1.18-.12.48-.17.97-.06.64.03 1.3.11.79.39 1.52.32.82.84 1.52.57.76 1.32 1.34.64.5 1.39.84.79.36 1.66.52.57.1 1.16.12.78.02 1.56-.12.65-.11 1.26-.35.75-.3 1.4-.76.55-.39 1.01-.87.36-.37.67-.78l.36-.56Z" fill="#0078D4" />
                  </svg>
                ) : (
                  <ChromeIcon aria-hidden size={IconSize.Size16} />
                )}
                Add to {isEdgeBrowser ? 'Edge' : 'Chrome'}
              </button>

              {/* Skip */}
              <button
                type="button"
                onClick={dismissExtensionPromo}
                className="onb-ext-reveal text-text-quaternary transition-colors duration-200 typo-footnote hover:text-text-secondary"
                style={{ animationDelay: '300ms' }}
              >
                Continue without extension &rarr;
              </button>
            </div>

            {/* Screenshot with float animation */}
            <div className="onb-ext-reveal relative w-full px-6 pb-6" style={{ animationDelay: '380ms' }}>
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
            <div className="onb-ext-reveal w-full border-t border-white/[0.06] px-8 py-4" style={{ animationDelay: '440ms' }}>
              <p className="text-center text-text-quaternary typo-caption1">
                Trusted by <span className="font-bold text-text-tertiary">1,000,000+</span> developers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── GitHub Import Overlay ── */}
      {showGithubImportFlow && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Importing GitHub profile"
        >
          {/* Full-screen scrim — blurred glass so feed peeks through */}
          <div
            className="onb-modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={closeGithubImportFlow}
            role="presentation"
          />

          {/* Centered content */}
          <div className="relative z-1 mx-4 flex w-full max-w-md flex-col items-center rounded-20 border border-white/[0.10] bg-[#0e1217] px-6 py-6 shadow-[0_32px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]">
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
            {/* ── Animated orb ── */}
            <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
              <div className="ghub-orb-glow pointer-events-none absolute inset-0 rounded-full bg-accent-cabbage-default/25 blur-xl" />
              <svg className="ghub-ring pointer-events-none absolute h-full w-full" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="44" fill="none" stroke="var(--theme-accent-cabbage-default)" strokeWidth="1" strokeDasharray="4 6" opacity="0.35" />
              </svg>
              <svg className="ghub-ring-reverse pointer-events-none absolute h-16 w-16" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="var(--theme-accent-onion-default)" strokeWidth="1" strokeDasharray="3 7" opacity="0.3" />
              </svg>
              {[
                { px: '-2.25rem', py: '-1.25rem', dur: '2.0s', delay: '0s', color: 'bg-accent-cheese-default' },
                { px: '2rem', py: '-1.75rem', dur: '2.4s', delay: '0.4s', color: 'bg-accent-water-default' },
                { px: '-1.75rem', py: '1.75rem', dur: '2.2s', delay: '0.8s', color: 'bg-accent-cabbage-default' },
                { px: '2.25rem', py: '1rem', dur: '2.6s', delay: '1.2s', color: 'bg-accent-onion-default' },
              ].map((p) => (
                <span
                  key={`particle-${p.delay}`}
                  className={classNames(
                    'ghub-particle pointer-events-none absolute h-1.5 w-1.5 rounded-full',
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
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-surface-float">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-text-primary">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.292 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </div>
            </div>

            {/* ── Title & progress ── */}
            <h2 className="mb-1 text-center font-bold text-text-primary typo-title3">
              {githubImportPhase === 'complete'
                ? 'Your feed is ready'
                : githubImportPhase === 'awaitingSeniority' || githubImportPhase === 'confirmingSeniority'
                  ? 'Almost there'
                  : 'Reading your GitHub'}
            </h2>

            <p className="mb-4 text-center text-text-tertiary typo-footnote">
              {githubImportPhase === 'complete'
                ? 'We built a personalized feed just for you.'
                : githubImportPhase === 'awaitingSeniority'
                  ? 'One thing we couldn\u2019t find on your profile.'
                  : githubImportPhase === 'confirmingSeniority'
                    ? 'Got it. Finishing up...'
                    : currentGithubImportStep}
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

            {/* ── Import checklist (during active import) ── */}
            {(githubImportPhase === 'running' || githubImportPhase === 'finishing') && (
              <div className="mb-4 flex w-full flex-col gap-1">
                {GITHUB_IMPORT_STEPS.map((step, i) => {
                  const done = githubImportProgress >= step.threshold;
                  const active = !done && githubImportProgress >= step.threshold - 16;

                  return (
                    <div
                      key={step.label}
                      className="ghub-step-reveal flex items-center gap-2"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span
                        className={classNames(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                          done
                            ? 'bg-accent-avocado-default/20'
                            : active
                              ? 'bg-accent-cabbage-default/20'
                              : 'bg-surface-float',
                        )}
                      >
                        {done ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-accent-avocado-default">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span
                            className={classNames(
                              'h-1 w-1 rounded-full',
                              active ? 'bg-accent-cabbage-default' : 'bg-text-quaternary',
                            )}
                          />
                        )}
                      </span>
                      <span
                        className={classNames(
                          'transition-colors duration-300 typo-caption1',
                          done ? 'text-text-primary' : active ? 'text-text-secondary' : 'text-text-quaternary',
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Seniority question ── */}
            {githubImportPhase === 'awaitingSeniority' && (
              <div className="w-full">
                <p className="mb-2.5 text-left text-text-primary typo-footnote">
                  What is your seniority level?
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleExperienceLevelSelect(option.value)}
                      className={classNames(
                        'rounded-10 px-3 py-2 text-left transition-all duration-200 typo-caption1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default/60',
                        selectedExperienceLevel === option.value
                          ? 'bg-white font-bold text-black'
                          : 'bg-surface-float text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
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
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
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

              {/* ── Shared AI setup context (manual + ai) ── */}
              {isAiSetupContext && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="onb-ai-icon-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.18] bg-white/[0.08]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="currentColor" opacity="0.9" />
                        <path d="M19 15l1.04 3.13L23.18 19l-3.14.87L19 23l-1.04-3.13L14.82 19l3.14-.87L19 15z" fill="currentColor" opacity="0.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary typo-title3">
                        Tell our AI about yourself
                      </h3>
                      <p className="text-text-tertiary typo-caption1">
                        Same setup flow, smarter results
                      </p>
                    </div>
                  </div>
                  <p className="mb-4 text-text-secondary typo-callout">
                    Describe what you work on and our AI will extract your
                    interests to build a feed that&apos;s uniquely yours.
                  </p>
                  <div className="onb-textarea-glow mb-3 rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 focus-within:border-accent-cabbage-default/20 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.06)]">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' || e.shiftKey) {
                          return;
                        }
                        e.preventDefault();
                        startAiFlowFromSignup();
                      }}
                      rows={4}
                      placeholder="I'm a frontend engineer using React and TypeScript. Interested in system design, performance, and AI tooling..."
                      className="w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary placeholder:text-text-quaternary focus:outline-none typo-callout"
                    />
                  </div>
                  <p className="mb-3 flex items-center gap-1.5 text-text-quaternary typo-caption2">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-white/70"
                    >
                      <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="currentColor" />
                    </svg>
                    We only use this to personalize your feed
                  </p>
                  {selectedTopics.size > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {Array.from(selectedTopics).map((topic) => (
                        <button
                          key={`signup-sel-${topic}`}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={classNames(
                            'onb-chip-enter inline-flex items-center gap-1.5 rounded-8 border px-2.5 py-1 font-medium transition-all duration-200 hover:bg-white/[0.14] active:scale-[0.96] focus-visible:outline-none typo-caption1',
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
                    <div className="mb-2 flex flex-wrap gap-1.5">
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
                  )}
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
                ) : isAiSetupContext ? (
                  <button
                    type="button"
                    className={classNames(
                      'group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 px-4 py-3.5 font-bold transition-all duration-300 focus-visible:outline-none',
                      canStartAiFlow
                        ? 'bg-white text-black hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_8px_30px_rgba(255,255,255,0.18)]'
                        : 'cursor-not-allowed bg-white/[0.10] text-text-quaternary',
                    )}
                    onClick={startAiFlowFromSignup}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={classNames('transition-transform duration-300', canStartAiFlow && 'group-hover:translate-x-0.5')}>
                      <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" fill="currentColor" opacity="0.9" />
                    </svg>
                    {selectedTopics.size > 0
                      ? `Generate with AI · ${selectedTopics.size} topic${selectedTopics.size !== 1 ? 's' : ''}`
                      : 'Generate my feed with AI'}
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
