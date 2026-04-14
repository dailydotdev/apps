import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import MainFeedLayout from '@dailydotdev/shared/src/components/MainFeedLayout';
import { FeedLayoutProvider } from '@dailydotdev/shared/src/contexts/FeedContext';
import { SearchProvider } from '@dailydotdev/shared/src/contexts/search/SearchContext';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities/common';
import {
  ThemeMode,
  useSettingsContext,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  appStoreUrl,
  downloadBrowserExtension,
  playStoreUrl,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import { UserExperienceLevel } from '@dailydotdev/shared/src/lib/user';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { isIOSNative, isIOS } from '@dailydotdev/shared/src/lib/func';
import { AppleIcon } from '@dailydotdev/shared/src/components/icons/Apple';
import { GoogleIcon } from '@dailydotdev/shared/src/components/icons/Google';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { PhoneIcon } from '@dailydotdev/shared/src/components/icons/Phone';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import {
  useViewSize,
  ViewSize,
  useActions,
} from '@dailydotdev/shared/src/hooks';

import { ChromeIcon } from '@dailydotdev/shared/src/components/icons/Browser/Chrome';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { NewTabIcon } from '@dailydotdev/shared/src/components/icons/NewTab';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons/Eye';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { StarIcon } from '@dailydotdev/shared/src/components/icons/Star';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { FooterLinks } from '@dailydotdev/shared/src/components/footer/FooterLinks';
import AuthOptions from '@dailydotdev/shared/src/components/auth/AuthOptions';
import type { AuthProps } from '@dailydotdev/shared/src/components/auth/common';
import { AuthDisplay } from '@dailydotdev/shared/src/components/auth/common';
import { useRouter } from 'next/router';
import {
  requestGitHubProfileTags,
  requestOnboardingProfileTags,
} from '@dailydotdev/shared/src/graphql/onboardingProfileTags';
import usePersistentContext from '@dailydotdev/shared/src/hooks/usePersistentContext';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useOnboardingActions } from '@dailydotdev/shared/src/hooks/auth';

import { UPDATE_USER_PROFILE_MUTATION } from '@dailydotdev/shared/src/graphql/users';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { redirectToApp } from '@dailydotdev/shared/src/features/onboarding/lib/utils';
import { usePushNotificationMutation } from '@dailydotdev/shared/src/hooks/notifications/usePushNotificationMutation';
import { NotificationPromptSource } from '@dailydotdev/shared/src/lib/log';
import { GitHubIcon } from '@dailydotdev/shared/src/components/icons/GitHub';
import { OnboardingV2Styles } from './OnboardingV2Styles';
import { useOnboardingAnimations } from './useOnboardingAnimations';

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

export type OnboardingStep =
  | 'hero'
  | 'prompt'
  | 'chooser'
  | 'auth'
  | 'importing'
  | 'extension'
  | 'complete';

type ImportPhase =
  | 'idle'
  | 'running'
  | 'awaitingSeniority'
  | 'confirmingSeniority'
  | 'finishing'
  | 'complete';
type ImportFlowSource = 'github' | 'ai';
type ImportBodyPhase = 'checklist' | 'seniority' | 'default';

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

const ONBOARDING_AI_PROMPT_KEY = 'onboarding:ai_prompt';
const ONBOARDING_SIGNUP_CONTEXT_KEY = 'onboarding:signup_context';
const ONBOARDING_EXTENSION_SEEN_KEY = 'onboarding:extension_seen';

const GITHUB_IMPORT_STEPS = [
  { label: 'Connecting account', threshold: 12 },
  { label: 'Scanning repositories', threshold: 30 },
  { label: 'Matching interests', threshold: 46 },
  { label: 'Inferring seniority', threshold: 68 },
  { label: 'Building your feed', threshold: 96 },
];

const IMPORT_ANIMATION_MS = 2000;
const FINISHING_ANIMATION_MS = 1500;

export const OnboardingV2 = (): ReactElement => {
  const router = useRouter();
  const { showLogin, isLoggedIn, isAuthReady, isAndroidApp } = useAuthContext();
  const { applyThemeMode } = useSettingsContext();
  const { completeAction } = useActions();
  const { isOnboardingComplete, isOnboardingActionsReady } =
    useOnboardingActions();
  const [step, setStep] = useState<OnboardingStep>('hero');
  const { onEnablePush } = usePushNotificationMutation();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isNativeApp = isIOSNative() || !!isAndroidApp;
  const isIOSDevice = isIOS();
  const isAndroidDevice =
    typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  const getMobileStoreUrl = () => {
    if (isIOSDevice) {
      return appStoreUrl;
    }
    if (isAndroidDevice) {
      return playStoreUrl;
    }
    return null;
  };
  const mobileStoreUrl = getMobileStoreUrl();
  const showExtensionCta = isLaptop && !isNativeApp;
  const showMobileAppCta = !isNativeApp;
  const [showMobileAppPopup, setShowMobileAppPopup] = useState(false);
  const {
    mounted,
    tagsReady,
    feedVisible,
    heroRef,
    confettiParticles,
    isEdgeBrowser,
    extensionImages,
  } = useOnboardingAnimations(step);
  const [aiPrompt, setAiPrompt] = usePersistentContext<string>(
    ONBOARDING_AI_PROMPT_KEY,
    '',
  );
  const [extensionSeen, setExtensionSeen] = usePersistentContext<boolean>(
    ONBOARDING_EXTENSION_SEEN_KEY,
    false,
  );
  const [authDisplay, setAuthDisplay] = useState(AuthDisplay.OnboardingSignup);
  const [importFlowSource, setImportFlowSource] =
    useState<ImportFlowSource>('github');
  const [importPhase, setImportPhase] = useState<ImportPhase>('idle');
  const [importProgress, setImportProgress] = useState(0);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<
    keyof typeof UserExperienceLevel | null
  >(null);
  const [importBodyHeight, setImportBodyHeight] = useState<number | null>(null);
  const [importExiting, setImportExiting] = useState(false);
  const [signupContext, setSignupContext] = usePersistentContext<
    'github' | 'ai' | null
  >(ONBOARDING_SIGNUP_CONTEXT_KEY, null, ['github', 'ai']);
  const pageRef = useRef<HTMLDivElement>(null);
  const importTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const importBodyContentRef = useRef<HTMLDivElement>(null);
  const authFormRef = useRef<HTMLFormElement>(
    null,
  ) as React.MutableRefObject<HTMLFormElement>;

  const popularFeedNameValue = useMemo(
    () => ({ feedName: SharedFeedPage.Popular as const }),
    [],
  );

  const openSignup = useCallback(
    (context: 'github' | 'ai') => {
      setSignupContext(context);
      setStep('prompt');
    },
    [setSignupContext],
  );

  const clearImportTimers = useCallback(() => {
    importTimersRef.current.forEach(clearTimeout);
    importTimersRef.current = [];
  }, []);

  const trackTimer = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    importTimersRef.current.push(id);
    return id;
  }, []);

  const startImportFlow = useCallback(
    async (source: ImportFlowSource) => {
      clearImportTimers();

      setImportFlowSource(source);
      setSelectedExperienceLevel(null);
      setImportProgress(0);
      setImportPhase('running');
      setStep('importing');

      const apiPromise =
        source === 'github'
          ? requestGitHubProfileTags()
          : requestOnboardingProfileTags(aiPrompt);

      // Animate progress bar to 65% via CSS transition
      requestAnimationFrame(() => setImportProgress(65));

      // Wait for both API response AND minimum animation time
      const [apiResult] = await Promise.allSettled([
        apiPromise,
        new Promise((r) => setTimeout(r, IMPORT_ANIMATION_MS)),
      ]);

      if (apiResult.status === 'fulfilled') {
        setAiPrompt('');
        setSignupContext(null);
      }

      setImportProgress(68);
      setImportPhase('awaitingSeniority');
    },
    [clearImportTimers, aiPrompt, setAiPrompt, setSignupContext],
  );

  const startImportFlowGithub = useCallback(() => {
    startImportFlow('github');
  }, [startImportFlow]);

  const [autoTriggerProvider, setAutoTriggerProvider] = useState<
    string | undefined
  >();

  const initiateGithubAuth = useCallback(() => {
    setSignupContext('github');
    setAutoTriggerProvider('github');
    setAuthDisplay(AuthDisplay.OnboardingSignup);
    setStep('auth');
  }, [setSignupContext]);

  const closeImportFlow = useCallback(() => {
    clearImportTimers();
    setStep('hero');
    setImportExiting(false);
    setSelectedExperienceLevel(null);
    setImportProgress(0);
    setImportPhase('idle');
    setImportFlowSource('github');
  }, [clearImportTimers]);

  const startAiProcessing = useCallback(() => {
    startImportFlow('ai');
  }, [startImportFlow]);

  const handleExperienceLevelSelect = useCallback(
    async (level: keyof typeof UserExperienceLevel) => {
      if (importPhase !== 'awaitingSeniority') {
        return;
      }

      clearImportTimers();
      setSelectedExperienceLevel(level);
      setImportProgress((prev) => Math.max(prev, 72));
      setImportPhase('confirmingSeniority');

      await gqlClient
        .request(UPDATE_USER_PROFILE_MUTATION, {
          data: { experienceLevel: UserExperienceLevel[level] },
        })
        .catch(() => undefined);

      completeAction(ActionType.CompletedOnboarding);
      completeAction(ActionType.EditTag);
      completeAction(ActionType.ContentTypes);

      router.replace({
        pathname: `${webappUrl}onboarding`,
        query: { step: 'complete' },
      });

      trackTimer(() => {
        setImportPhase('finishing');
        setImportProgress(100);
        trackTimer(() => {
          setImportPhase('complete');
          trackTimer(() => {
            setImportExiting(true);
            trackTimer(() => {
              setImportExiting(false);
              setStep(showExtensionCta ? 'extension' : 'complete');
            }, 350);
          }, 600);
        }, FINISHING_ANIMATION_MS);
      }, 420);
    },
    [
      clearImportTimers,
      trackTimer,
      importPhase,
      completeAction,
      router,
      showExtensionCta,
    ],
  );

  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  useEffect(() => {
    if (
      !isAuthReady ||
      (
        ['auth', 'importing', 'extension', 'complete'] as OnboardingStep[]
      ).includes(step)
    ) {
      return;
    }

    const urlStep = router.query.step as string | undefined;

    if (urlStep === 'complete') {
      if (!isLoggedIn) {
        router.replace(`${webappUrl}onboarding`);
        return;
      }

      if (extensionSeen || !showExtensionCta) {
        setStep('complete');
      } else {
        setStep('extension');
      }

      return;
    }

    const flow = router.query.flow as string | undefined;

    if (flow === 'github') {
      if (!isLoggedIn) {
        router.replace(`${webappUrl}onboarding`);
        return;
      }
      startImportFlowGithub();
      return;
    }

    if (isLoggedIn && signupContext === 'github') {
      startImportFlowGithub();
      return;
    }

    if (isLoggedIn && signupContext === 'ai' && aiPrompt) {
      startAiProcessing();
      return;
    }

    if (!isOnboardingActionsReady) {
      return;
    }

    if (!isLoggedIn) {
      return;
    }

    if (isOnboardingComplete) {
      redirectToApp(router);
    } else {
      setStep('chooser');
    }
  }, [
    isAuthReady,
    isLoggedIn,
    isOnboardingActionsReady,
    isOnboardingComplete,
    extensionSeen,
    aiPrompt,
    signupContext,
    step,
    router,
    setSignupContext,
    startImportFlowGithub,
    startAiProcessing,
    showExtensionCta,
  ]);

  useEffect(() => {
    return () => {
      clearImportTimers();
    };
  }, [clearImportTimers]);

  const dismissExtensionPromo = useCallback(() => {
    setExtensionSeen(true);
    setStep('complete');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setExtensionSeen]);
  const closeSignupChooser = useCallback(() => {
    setStep('hero');
  }, []);
  const closeAuthSignup = useCallback(() => {
    setStep('hero');
    setAuthDisplay(AuthDisplay.OnboardingSignup);
  }, []);
  const openLogin = useCallback(() => {
    showLogin({
      trigger: AuthTriggers.MainButton,
      options: { isLogin: true },
    });
  }, [showLogin]);
  const openSignupAuth = useCallback(() => {
    setAuthDisplay(AuthDisplay.OnboardingSignup);
    setStep('auth');
  }, []);
  const isAiSetupContext = signupContext === 'ai';
  const canStartAiFlow = aiPrompt?.trim().length > 0;
  const isAwaitingSeniorityInput = importPhase === 'awaitingSeniority';
  const importSteps = useMemo(
    () =>
      importFlowSource === 'github' ? GITHUB_IMPORT_STEPS : AI_IMPORT_STEPS,
    [importFlowSource],
  );
  const currentImportStep = useMemo(() => {
    if (importPhase === 'awaitingSeniority') {
      return 'Waiting for your seniority level';
    }
    if (importPhase === 'confirmingSeniority') {
      return 'Applying your seniority level';
    }
    if (importPhase === 'complete') {
      return 'Your feed is ready';
    }

    const upcomingStep = importSteps.find((s) => importProgress < s.threshold);
    return upcomingStep?.label ?? 'Building personalized feed';
  }, [importPhase, importProgress, importSteps]);
  const importBodyPhase = useMemo<ImportBodyPhase>(() => {
    if (
      importPhase === 'running' ||
      importPhase === 'finishing' ||
      importPhase === 'confirmingSeniority' ||
      importPhase === 'complete'
    ) {
      return 'checklist';
    }
    if (importPhase === 'awaitingSeniority') {
      return 'seniority';
    }

    return 'default';
  }, [importPhase]);

  useEffect(() => {
    if (importBodyPhase === 'default') {
      setImportBodyHeight(null);
      return undefined;
    }

    const contentNode = importBodyContentRef.current;
    if (!contentNode) {
      return undefined;
    }

    const updateHeight = () => {
      setImportBodyHeight(contentNode.getBoundingClientRect().height);
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
  }, [importBodyPhase]);

  return (
    <div
      ref={pageRef}
      className="onb-page relative tablet:pt-16 laptop:pl-11"
      role="presentation"
    >
      <OnboardingV2Styles />
      {/* ── Dummy Header (desktop/tablet only) ── */}
      <header className="fixed left-0 top-0 z-3 hidden h-16 w-full items-center border-b border-border-subtlest-tertiary bg-background-default px-4 tablet:flex">
        <Logo
          position={LogoPosition.Relative}
          className="!left-0 !top-0 !mt-0 !translate-x-0"
        />
        {!isLoggedIn && (
          <div className="ml-auto flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setAuthDisplay(AuthDisplay.Default);
                setStep('auth');
              }}
              className="h-10 rounded-14 border border-border-subtlest-tertiary px-5 font-bold text-text-primary transition-colors duration-200 typo-callout hover:bg-surface-hover"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setStep('chooser')}
              className="hover:opacity-90 h-10 rounded-14 bg-white px-5 font-bold text-black transition-opacity duration-200 typo-callout"
            >
              Sign up
            </button>
          </div>
        )}
      </header>

      {/* ── Dummy Sidebar (laptop only) ── */}
      <aside className="pointer-events-none fixed left-0 top-16 z-2 hidden h-[calc(100vh-theme(space.16))] w-11 select-none flex-col border-r border-border-subtlest-tertiary bg-background-default laptop:flex">
        <nav className="flex flex-col items-center gap-0.5 pt-3">
          <div className="flex h-9 w-full items-center justify-center">
            <HomeIcon
              className="h-5 w-5 text-text-disabled"
              secondary={false}
            />
          </div>
          <div className="flex h-9 w-full items-center justify-center">
            <SquadIcon
              className="h-5 w-5 text-text-disabled"
              secondary={false}
            />
          </div>
          <div className="flex h-9 w-full items-center justify-center">
            <HotIcon className="h-5 w-5 text-text-disabled" secondary={false} />
          </div>
          <div className="flex h-9 w-full items-center justify-center">
            <EyeIcon className="h-5 w-5 text-text-disabled" secondary={false} />
          </div>
          <div className="flex h-9 w-full items-center justify-center">
            <TerminalIcon
              className="h-5 w-5 text-text-disabled"
              secondary={false}
            />
          </div>
        </nav>
      </aside>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className={classNames(
          'onb-hero relative overflow-hidden py-2 tablet:py-8',
          step === 'complete' && 'hidden',
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
              onClick={() => setStep('chooser')}
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
              'pointer-events-none relative mb-4 h-[4.5rem] overflow-hidden tablet:hidden',
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
                onClick={() => {
                  if (isLoggedIn) {
                    startImportFlowGithub();
                  } else {
                    initiateGithubAuth();
                  }
                }}
                className="onb-btn-shine focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-7 py-3.5 font-bold text-black transition-all duration-300 typo-callout hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2 tablet:w-auto"
              >
                <GitHubIcon secondary size={IconSize.XSmall} />
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
                onClick={() => openSignup('ai')}
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
          <div className="pointer-events-none relative mt-5 h-[4.5rem] overflow-hidden tablet:hidden">
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
      {step === 'complete' && (
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
      {step === 'complete' && (
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
              {/* Install extension — desktop only */}
              {showExtensionCta && (
                <a
                  href={downloadBrowserExtension}
                  target="_blank"
                  rel="noopener noreferrer"
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
                </a>
              )}

              {/* Get mobile app — hide if already in native app */}
              {showMobileAppCta &&
                (mobileStoreUrl ? (
                  <a
                    href={mobileStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:border-accent-onion-default/40 hover:bg-accent-onion-default/10 group flex items-center gap-2.5 rounded-14 border border-white/[0.10] bg-white/[0.06] px-5 py-3 transition-all duration-200"
                  >
                    <PhoneIcon
                      size={IconSize.Size16}
                      className="shrink-0 text-accent-onion-default"
                    />
                    <span className="text-text-primary typo-callout">
                      Get mobile app
                    </span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMobileAppPopup(true)}
                    className="hover:border-accent-onion-default/40 hover:bg-accent-onion-default/10 group flex items-center gap-2.5 rounded-14 border border-white/[0.10] bg-white/[0.06] px-5 py-3 transition-all duration-200"
                  >
                    <PhoneIcon
                      size={IconSize.Size16}
                      className="shrink-0 text-accent-onion-default"
                    />
                    <span className="text-text-primary typo-callout">
                      Get mobile app
                    </span>
                  </button>
                ))}

              {/* Enable notifications */}
              <button
                type="button"
                onClick={() =>
                  onEnablePush(NotificationPromptSource.NotificationsPage)
                }
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
              onClick={() => router.replace(webappUrl)}
              className="onb-ready-reveal mt-6 flex items-center gap-2 rounded-12 bg-white/[0.08] px-5 py-2.5 text-text-secondary transition-all duration-200 typo-callout hover:bg-white/[0.14] hover:text-text-primary"
              style={{ animationDelay: '520ms' }}
            >
              Go to my feed
              <ArrowIcon size={IconSize.Size16} className="rotate-90" />
            </button>
          </div>
        </div>
      )}

      {/* ── Feed ── */}
      <div
        className={classNames(
          'onb-feed-stage relative min-h-[50vh] transition-[opacity,transform] duration-500 ease-out laptop:px-10',
          // eslint-disable-next-line no-nested-ternary
          step === 'complete'
            ? 'onb-feed-unlocked translate-y-0 opacity-100'
            : feedVisible
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0',
        )}
      >
        <SearchProvider>
          <FeedLayoutProvider>
            <ActiveFeedNameContext.Provider value={popularFeedNameValue}>
              <MainFeedLayout feedName="popular" isSearchOn={false}>
                {step !== 'complete' && (
                  <div className="relative z-1 mx-auto mt-44 flex w-full max-w-[48rem] justify-center px-5 pb-48 mobileL:mt-48 mobileL:px-6 mobileL:pb-52 tablet:mt-14 tablet:pb-8">
                    <FooterLinks className="mx-auto w-full max-w-[21rem] justify-center px-1 text-center typo-caption2 tablet:max-w-none tablet:typo-footnote" />
                  </div>
                )}
              </MainFeedLayout>
            </ActiveFeedNameContext.Provider>
          </FeedLayoutProvider>
        </SearchProvider>
      </div>

      {/* ── Header signup chooser popup ── */}
      {step === 'chooser' && (
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
              <MiniCloseIcon size={IconSize.Size16} />
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
                      <GitHubIcon
                        secondary
                        className="h-[26px] w-[26px] text-text-primary"
                      />
                    </div>
                  </div>

                  <h4 className="mb-1.5 break-words text-center font-bold text-text-primary typo-body">
                    One-click setup
                  </h4>
                  <p className="mb-5 text-center text-text-tertiary typo-footnote">
                    Connect GitHub and let our AI do the rest.
                  </p>

                  <div className="mb-5 flex w-full flex-col items-center gap-3">
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
                        className="flex w-full max-w-[15.5rem] items-center gap-2"
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
                      onClick={async () => {
                        setStep('hero');
                        if (isLoggedIn) {
                          startImportFlowGithub();
                        } else {
                          initiateGithubAuth();
                        }
                      }}
                      className="onb-btn-shine focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-5 py-3.5 font-bold text-black transition-all duration-300 typo-callout hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2"
                    >
                      <GitHubIcon secondary size={IconSize.XSmall} />
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
                        if (aiPrompt.trim()) {
                          if (isLoggedIn) {
                            setStep('hero');
                            startAiProcessing();
                          } else {
                            openSignupAuth();
                          }
                        }
                      }}
                      rows={4}
                      placeholder="I'm a frontend engineer working with React and TypeScript. Interested in system design, AI tooling..."
                      className="min-h-[6.25rem] w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary transition-colors duration-200 typo-callout placeholder:text-text-quaternary focus:outline-none focus:placeholder:text-text-disabled"
                    />
                  </div>

                  {/* Build feed CTA — disabled when no input */}
                  <div className="relative mt-auto w-full pt-4">
                    <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
                    <button
                      type="button"
                      disabled={!canStartAiFlow}
                      onClick={() => {
                        if (isLoggedIn) {
                          setStep('hero');
                          startAiProcessing();
                        } else {
                          openSignupAuth();
                        }
                      }}
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
      {importExiting && (
        <div
          className="bg-black/80 fixed inset-0 z-modal backdrop-blur-lg"
          aria-hidden
        />
      )}

      {/* ── Auth Signup Overlay (providers: Google, GitHub, email) ── */}
      {step === 'auth' && (
        <div
          className="fixed inset-0 z-modal flex items-end tablet:items-center tablet:justify-center tablet:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create your account"
        >
          <div
            className="onb-modal-backdrop bg-black/80 absolute inset-0 backdrop-blur-lg"
            onClick={closeAuthSignup}
            role="presentation"
          />

          <div className="onb-modal-enter onb-glass relative z-1 flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-24 border border-white/[0.08] bg-background-default shadow-[0_32px_90px_rgba(0,0,0,0.58)] tablet:max-w-md tablet:rounded-24">
            {authDisplay === AuthDisplay.OnboardingSignup && (
              <button
                type="button"
                onClick={closeAuthSignup}
                className="z-10 absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
                aria-label="Close"
              >
                <MiniCloseIcon size={IconSize.Size16} />
              </button>
            )}

            <div className="flex w-full flex-col items-center px-5 py-5 tablet:px-6">
              {authDisplay === AuthDisplay.OnboardingSignup && (
                <>
                  <h2 className="mb-2 text-center font-bold text-text-primary typo-title2">
                    Create your account
                  </h2>
                  <p className="mb-6 text-center text-text-tertiary typo-callout">
                    Sign up to save your personalized feed.
                  </p>
                </>
              )}
              <AuthOptions
                trigger={AuthTriggers.Onboarding}
                formRef={authFormRef}
                defaultDisplay={authDisplay}
                forceDefaultDisplay
                simplified
                autoTriggerProvider={autoTriggerProvider}
                className={{ container: '!min-h-0' }}
                onAuthStateUpdate={(props: Partial<AuthProps>) => {
                  if (props.defaultDisplay) {
                    setAuthDisplay(props.defaultDisplay);
                  }
                }}
                onSuccessfulRegistration={() => {
                  setAutoTriggerProvider(undefined);
                  if (signupContext === 'github') {
                    startImportFlowGithub();
                  } else if (signupContext === 'ai') {
                    startAiProcessing();
                  } else {
                    closeAuthSignup();
                  }
                }}
                onSuccessfulLogin={() => {
                  setAutoTriggerProvider(undefined);
                  closeAuthSignup();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Extension Promotion Overlay ── */}
      {step === 'extension' && (
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
              <MiniCloseIcon size={IconSize.Size16} />
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
              <a
                href={downloadBrowserExtension}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismissExtensionPromo}
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
              </a>

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

      {/* ── Mobile App Download Popup (desktop only) ── */}
      {showMobileAppPopup && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Get the mobile app"
        >
          <div
            className="bg-black/70 absolute inset-0 backdrop-blur-sm"
            onClick={() => setShowMobileAppPopup(false)}
            role="presentation"
          />
          <div className="relative z-1 flex w-full max-w-sm flex-col items-center rounded-24 border border-white/[0.08] bg-background-default p-6 shadow-[0_32px_90px_rgba(0,0,0,0.58)]">
            <button
              type="button"
              onClick={() => setShowMobileAppPopup(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
              aria-label="Close"
            >
              <MiniCloseIcon size={IconSize.Size16} />
            </button>

            <PhoneIcon
              size={IconSize.XLarge}
              className="mb-4 text-accent-onion-default"
            />

            <h3 className="mb-2 text-center font-bold text-text-primary typo-title3">
              Get daily.dev on mobile
            </h3>
            <p className="mb-6 text-center text-text-tertiary typo-callout">
              Your personalized feed, anywhere.
            </p>

            <div className="flex w-full flex-col gap-3">
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-14 bg-white py-3 font-bold text-black transition-all duration-200 typo-callout hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(255,255,255,0.12)]"
              >
                <AppleIcon size={IconSize.Size16} />
                Download for iOS
              </a>
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 rounded-14 border border-white/[0.12] bg-white/[0.06] py-3 font-bold text-text-primary transition-all duration-200 typo-callout hover:-translate-y-0.5 hover:bg-white/[0.10]"
              >
                <GoogleIcon secondary size={IconSize.Size16} />
                Download for Android
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Import Overlay ── */}
      {step === 'importing' && (
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
              importExiting ? 'onb-modal-backdrop-exit' : 'onb-modal-backdrop',
            )}
            onClick={closeImportFlow}
            role="presentation"
          />

          {/* Centered content */}
          <div
            className={classNames(
              'relative z-1 flex max-h-[100dvh] w-full flex-col items-center overflow-y-auto rounded-t-20 border border-white/[0.10] bg-raw-pepper-90 px-5 py-6 shadow-[0_32px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] tablet:mx-4 tablet:max-w-md tablet:rounded-20 tablet:px-6',
              importExiting && 'onb-modal-exit',
            )}
          >
            <button
              type="button"
              onClick={closeImportFlow}
              className="z-10 absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
              aria-label="Close"
            >
              <MiniCloseIcon size={IconSize.Size16} />
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
                      <GitHubIcon
                        secondary
                        className="h-[26px] w-[26px] text-text-primary"
                      />
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
                if (importPhase === 'complete') {
                  return 'Your feed is ready';
                }
                if (
                  importPhase === 'awaitingSeniority' ||
                  importPhase === 'confirmingSeniority'
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
                if (importPhase === 'complete') {
                  return 'We built a personalized feed just for you.';
                }
                if (importPhase === 'awaitingSeniority') {
                  return importFlowSource === 'github'
                    ? 'One thing we couldn\u2019t find on your profile.'
                    : 'One last detail to finish your profile setup.';
                }
                if (importPhase === 'confirmingSeniority') {
                  return 'Got it. Finishing up...';
                }
                return currentImportStep;
              })()}
            </p>

            {/* ── Progress track ── */}
            {importPhase !== 'idle' && (
              <div className="mb-5 w-full">
                <div className="relative h-1 w-full overflow-hidden rounded-[0.125rem] bg-white/[0.10]">
                  <div
                    className="h-full rounded-[0.125rem] bg-accent-cabbage-default transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(importProgress, 6)}%` }}
                  />
                </div>
              </div>
            )}

            {importBodyPhase !== 'default' && (
              <div
                className={classNames(
                  'w-full overflow-hidden',
                  importBodyPhase === 'seniority'
                    ? 'rounded-none border-0 bg-transparent p-0'
                    : 'rounded-16 border border-white/[0.06] bg-white/[0.01] p-3.5',
                )}
              >
                <div
                  className="ghub-phase-shell overflow-hidden transition-[height] duration-300 ease-out"
                  style={{
                    height: importBodyHeight
                      ? `${importBodyHeight}px`
                      : undefined,
                  }}
                >
                  <div
                    key={importBodyPhase}
                    ref={importBodyContentRef}
                    className={
                      importBodyPhase === 'checklist'
                        ? 'min-h-0'
                        : 'min-h-[12rem]'
                    }
                  >
                    {/* ── Import checklist (during active import) ── */}
                    {importBodyPhase === 'checklist' && (
                      <div className="flex w-full flex-col gap-2.5">
                        {importSteps.map((s, i) => {
                          const done = importProgress >= s.threshold;
                          const active =
                            !done && importProgress >= s.threshold - 16;
                          // eslint-disable-next-line no-nested-ternary
                          const statusText = done
                            ? 'Done'
                            : active
                            ? 'In progress'
                            : 'Up next';

                          return (
                            <div
                              key={s.label}
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
                                {s.label}
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
                    {importBodyPhase === 'seniority' && (
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

            {/* Completion handled by step=complete banner — auto-transition */}
          </div>
        </div>
      )}

      {/* ── Contextual Signup Modal ── */}
      {step === 'prompt' && (
        <div
          className="fixed inset-0 z-modal flex items-end tablet:items-center tablet:justify-center tablet:p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="onb-modal-backdrop bg-black/80 absolute inset-0 backdrop-blur-lg"
            onClick={() => setStep('hero')}
            role="presentation"
          />

          {/* Modal */}
          <div className="onb-modal-enter onb-glass relative flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-20 border border-white/[0.08] bg-background-default shadow-[0_24px_80px_rgba(0,0,0,0.5)] tablet:max-w-[26rem] tablet:rounded-20">
            {/* Close */}
            <button
              type="button"
              onClick={() => setStep('hero')}
              className="z-10 absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-10 text-text-quaternary transition-all duration-200 hover:rotate-90 hover:bg-white/[0.06] hover:text-text-secondary"
              aria-label="Close"
            >
              <MiniCloseIcon size={IconSize.Size16} />
            </button>

            {/* Content */}
            <div className="px-5 pb-6 pt-8 tablet:px-7 tablet:pb-7">
              {/* ── GitHub context ── */}
              {signupContext === 'github' && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08]">
                      <GitHubIcon
                        secondary
                        className="h-[22px] w-[22px] text-text-primary"
                      />
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
                          openSignupAuth();
                        }
                      }}
                      rows={4}
                      placeholder="I'm a frontend engineer using React and TypeScript. Interested in system design, performance, and AI tooling..."
                      className="min-h-[6.25rem] w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary transition-colors duration-200 typo-callout placeholder:text-text-quaternary focus:outline-none focus:placeholder:text-text-disabled"
                    />
                  </div>
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
                    onClick={() => {
                      if (isLoggedIn) {
                        setStep('hero');
                        startImportFlowGithub();
                      } else {
                        initiateGithubAuth();
                      }
                    }}
                  >
                    <GitHubIcon secondary size={IconSize.XSmall} />
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
                      onClick={() => {
                        if (isLoggedIn) {
                          setStep('hero');
                          startAiProcessing();
                        } else {
                          openSignupAuth();
                        }
                      }}
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
                    onClick={openSignupAuth}
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
