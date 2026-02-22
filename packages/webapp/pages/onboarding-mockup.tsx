import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { NextSeoProps } from 'next-seo';
import { Provider as JotaiProvider } from 'jotai/react';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import type {
  FunnelStep,
  FunnelStepTransitionCallback,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelStepType,
  FunnelStepTransitionType,
  FunnelBackgroundVariant,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { Header } from '@dailydotdev/shared/src/features/onboarding/shared/Header';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepBackground';
import { FunnelFeedPreview } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelFeedPreview';
import { FunnelAIPersonalization } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelAIPersonalization';
import { FunnelSaveFeedAuth } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelSaveFeedAuth';
import { FunnelExtensionCta } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelExtensionCta';
import { FunnelReadingReminder } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelReadingReminder';
import { FunnelInstallPwa } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelInstallPwa';
import { withFeaturesBoundary } from '@dailydotdev/shared/src/components';
import { getTemplatedTitle } from '../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Onboarding Mockup'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

interface MockStep {
  id: string;
  type: FunnelStepType;
  label: string;
  mobileOnly?: boolean;
}

const MOCK_STEPS: MockStep[] = [
  {
    id: 'feed-preview',
    type: FunnelStepType.FeedPreview,
    label: 'Feed Preview',
  },
  {
    id: 'ai-personalize',
    type: FunnelStepType.AIPersonalization,
    label: 'AI Personalization',
  },
  { id: 'auth-gate', type: FunnelStepType.SaveFeedAuth, label: 'Auth Gate' },
  {
    id: 'extension-cta',
    type: FunnelStepType.ExtensionCta,
    label: 'Extension CTA',
  },
  {
    id: 'reading-reminder',
    type: FunnelStepType.ReadingReminder,
    label: 'Reading Reminder',
    mobileOnly: true,
  },
  {
    id: 'pwa-install',
    type: FunnelStepType.InstallPwa,
    label: 'PWA Install',
    mobileOnly: true,
  },
];

const CHAPTERS = [{ steps: 4 }, { steps: 2 }];

const TRANSITION_DURATION = 300;

function buildStepProps(
  mockStep: MockStep,
  isActive: boolean,
  onTransition: FunnelStepTransitionCallback,
): FunnelStep {
  const base = {
    id: mockStep.id,
    isActive,
    onTransition,
    onRegisterStepToSkip: () => {},
    parameters: {
      backgroundType: FunnelBackgroundVariant.Blank,
      headline: mockStep.label,
      explainer: '',
      image: '',
      imageMobile: '',
      cta: 'Next',
    },
    transitions: [
      { on: FunnelStepTransitionType.Complete, destination: 'next' as const },
      { on: FunnelStepTransitionType.Skip, destination: 'next' as const },
    ],
  };

  return { ...base, type: mockStep.type } as unknown as FunnelStep;
}

const STEPS_WITHOUT_HEADER = new Set([FunnelStepType.FeedPreview]);

function StepRenderer({
  step,
  stepProps,
}: {
  step: MockStep;
  stepProps: FunnelStep;
}): ReactElement | null {
  const { type } = step;
  // Step props are built generically by buildStepProps and need to be spread
  // into each specific step component which has its own typed interface.
  const props = stepProps as Record<string, unknown>;

  switch (type) {
    case FunnelStepType.FeedPreview:
      return (
        <FunnelFeedPreview
          {...(props as React.ComponentProps<typeof FunnelFeedPreview>)}
        />
      );
    case FunnelStepType.AIPersonalization:
      return (
        <FunnelAIPersonalization
          {...(props as React.ComponentProps<typeof FunnelAIPersonalization>)}
        />
      );
    case FunnelStepType.SaveFeedAuth:
      return (
        <FunnelSaveFeedAuth
          {...(props as React.ComponentProps<typeof FunnelSaveFeedAuth>)}
        />
      );
    case FunnelStepType.ExtensionCta:
      return (
        <FunnelExtensionCta
          {...(props as React.ComponentProps<typeof FunnelExtensionCta>)}
        />
      );
    case FunnelStepType.ReadingReminder:
      return (
        <FunnelReadingReminder
          {...(props as React.ComponentProps<typeof FunnelReadingReminder>)}
        />
      );
    case FunnelStepType.InstallPwa:
      return (
        <FunnelInstallPwa
          {...(props as React.ComponentProps<typeof FunnelInstallPwa>)}
        />
      );
    default:
      return null;
  }
}

function OnboardingMockup(): ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMobile = useViewSize(ViewSize.MobileL);

  const activeSteps = useMemo(
    () => MOCK_STEPS.filter((step) => !step.mobileOnly || isMobile),
    [isMobile],
  );

  const goTo = useCallback(
    (nextIndex: number) => {
      if (isTransitioning || nextIndex < 0 || nextIndex >= activeSteps.length) {
        return;
      }

      setDirection(nextIndex > currentIndex ? 'forward' : 'backward');
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setIsTransitioning(false);
      }, TRANSITION_DURATION);
    },
    [currentIndex, isTransitioning, activeSteps.length],
  );

  const handleTransition: FunnelStepTransitionCallback = useCallback(
    ({ type }) => {
      if (
        type === FunnelStepTransitionType.Complete ||
        type === FunnelStepTransitionType.Skip
      ) {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= activeSteps.length) {
          // Done — redirect home in real app
          window.location.href = '/';
          return;
        }
        goTo(nextIndex);
      }
    },
    [currentIndex, activeSteps.length, goTo],
  );

  const handleBack = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const currentMockStep = activeSteps[currentIndex];
  const currentChapter = currentIndex < 4 ? 0 : 1;
  const currentStepInChapter =
    currentChapter === 0 ? currentIndex : currentIndex - 4;
  const showHeader = !STEPS_WITHOUT_HEADER.has(currentMockStep.type);

  const stepProps = buildStepProps(currentMockStep, true, handleTransition);

  return (
    <section
      className="flex min-h-dvh flex-col"
      data-testid="onboarding-mockup"
    >
      <FunnelStepBackground step={stepProps}>
        <div className="mx-auto flex w-full flex-1 flex-col">
          {showHeader && (
            <Header
              chapters={CHAPTERS}
              currentChapter={currentChapter}
              currentStep={currentStepInChapter}
              onBack={handleBack}
              onSkip={() =>
                handleTransition({ type: FunnelStepTransitionType.Skip })
              }
              showBackButton={currentIndex > 0}
              showSkipButton={
                currentMockStep.type === FunnelStepType.ExtensionCta
              }
              showProgressBar
            />
          )}

          {/* Step content with transitions */}
          <div
            className={classNames(
              'flex flex-1 flex-col transition-all',
              `duration-${TRANSITION_DURATION}`,
              isTransitioning && 'opacity-0',
              isTransitioning && direction === 'forward' && 'translate-y-4',
              isTransitioning && direction === 'backward' && '-translate-y-4',
              !isTransitioning && 'translate-y-0 opacity-100',
            )}
            style={{ transitionDuration: `${TRANSITION_DURATION}ms` }}
          >
            <StepRenderer step={currentMockStep} stepProps={stepProps} />
          </div>
        </div>
      </FunnelStepBackground>
    </section>
  );
}

function Page(): ReactElement {
  const { autoDismissNotifications } = useSettingsContext();

  return (
    <JotaiProvider>
      <OnboardingMockup />
      <Toast autoDismissNotifications={autoDismissNotifications} />
    </JotaiProvider>
  );
}

Page.layoutProps = { seo };

export default withFeaturesBoundary(Page);
