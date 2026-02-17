import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useCopyLink } from '@dailydotdev/shared/src/hooks/useCopy';
import { useUserShortByIdQuery } from '@dailydotdev/shared/src/hooks/user/useUserShortByIdQuery';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib/links';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { getTemplatedTitle } from '../../components/layouts/utils';
import {
  aiFluencyQuestions,
  aiFluencyTipsByTier,
  aiFluencyTiers,
  getAiFluencyNextTier,
  getShuffledAiFluencyQuestionOptions,
  getAiFluencyTierByKey,
  getAiFluencyTierFromAnswers,
} from '../../components/quiz/aiFluencyQuiz';
import type { AiFluencyTierKey } from '../../components/quiz/aiFluencyQuiz';
import { defaultSeo } from '../../next-seo';

const quizPathname = '/quiz/ai-fluency';
const quizCompletionSessionKey = 'ai_fluency_quiz_completion';
const tipsFadeDelayMs = 30;
const tiersFadeOutDurationMs = 420;

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('AI Fluency Quiz'),
  description:
    'Assess your AI fluency tier and get actionable tips to improve your workflow.',
};

const getFirstQueryParam = (
  queryParam: string | string[] | undefined,
): string | undefined =>
  Array.isArray(queryParam) ? queryParam[0] : queryParam;

const getResultUrl = (userId: string, tier: string): string => {
  const params = new URLSearchParams({ userId, tier });

  return getPathnameWithQuery(quizPathname, params);
};

const AiFluencyQuizPage = (): ReactElement => {
  const router = useRouter();
  const { user, isLoggedIn, isAuthReady, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();

  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [localTierKey, setLocalTierKey] = useState<string>();
  const [slotActiveTierKey, setSlotActiveTierKey] =
    useState<AiFluencyTierKey>();
  const [isBlinkingLandingTier, setIsBlinkingLandingTier] = useState(false);
  const [isLandingBlinkVisible, setIsLandingBlinkVisible] = useState(false);
  const [shouldPlayResultAnimation, setShouldPlayResultAnimation] =
    useState(false);
  const [hasCheckedResultAnimation, setHasCheckedResultAnimation] =
    useState(false);
  const [isAnimatingResult, setIsAnimatingResult] = useState(false);
  const [didAnimateResult, setDidAnimateResult] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [isTipsVisible, setIsTipsVisible] = useState(false);
  const [isFadingOutTiers, setIsFadingOutTiers] = useState(false);
  const [hideNonAchievedTiers, setHideNonAchievedTiers] = useState(false);
  const displayQuestions = useMemo(
    () =>
      aiFluencyQuestions.map((question) => ({
        ...question,
        options: getShuffledAiFluencyQuestionOptions(question),
      })),
    [],
  );

  const sharedUserId = getFirstQueryParam(router.query.userId);
  const sharedTier = getAiFluencyTierByKey(
    getFirstQueryParam(router.query.tier),
  );

  const hasSharedResult = Boolean(sharedUserId && sharedTier);
  const localTier = getAiFluencyTierByKey(localTierKey);
  const resolvedTier = sharedTier || localTier;
  const resolvedTierKey = resolvedTier?.key;
  const resolvedUserId = hasSharedResult ? sharedUserId : user?.id;
  const shouldShowTips = Boolean(resolvedTier && showTips);
  const { data: sharedResultUser } = useUserShortByIdQuery({
    id: resolvedUserId || '',
  });
  const resultUser =
    user?.id && resolvedUserId === user.id ? user : sharedResultUser;
  const resultName = resultUser?.name || 'Unknown user';
  const resultUsername = resultUser?.username
    ? `@${resultUser.username}`
    : undefined;

  const nextTier = resolvedTierKey
    ? getAiFluencyNextTier(resolvedTierKey)
    : undefined;

  useEffect(() => {
    if (!resolvedTierKey || !resolvedUserId || typeof window === 'undefined') {
      return;
    }

    setHasCheckedResultAnimation(false);
    setShouldPlayResultAnimation(false);
    setIsAnimatingResult(false);
    setDidAnimateResult(false);
    setSlotActiveTierKey(undefined);
    setIsBlinkingLandingTier(false);
    setIsLandingBlinkVisible(false);
    setShowTips(false);
    setIsTipsVisible(false);
    setIsFadingOutTiers(false);
    setHideNonAchievedTiers(false);

    let shouldAnimate = false;
    const storedCompletion = window.sessionStorage.getItem(
      quizCompletionSessionKey,
    );

    if (storedCompletion) {
      try {
        const parsedCompletion = JSON.parse(storedCompletion) as {
          userId?: string;
          tier?: string;
        };

        shouldAnimate =
          parsedCompletion.userId === resolvedUserId &&
          parsedCompletion.tier === resolvedTierKey;
      } catch (error) {
        shouldAnimate = false;
      }
    }

    setShouldPlayResultAnimation(shouldAnimate);
    setHasCheckedResultAnimation(true);

    if (!shouldAnimate) {
      setHideNonAchievedTiers(true);
      setShowTips(true);
      setIsTipsVisible(true);
    }
  }, [resolvedTierKey, resolvedUserId]);

  useEffect(() => {
    if (
      !resolvedTierKey ||
      !hasCheckedResultAnimation ||
      !shouldPlayResultAnimation ||
      typeof window === 'undefined'
    ) {
      return undefined;
    }

    const targetTierIndex = aiFluencyTiers.findIndex(
      ({ key }) => key === resolvedTierKey,
    );

    if (targetTierIndex < 0) {
      setShouldPlayResultAnimation(false);
      setShowTips(true);
      setIsTipsVisible(true);
      return undefined;
    }

    window.sessionStorage.removeItem(quizCompletionSessionKey);

    setDidAnimateResult(true);
    setIsAnimatingResult(true);

    const spinLoopCount = 4;
    const totalSteps =
      aiFluencyTiers.length * spinLoopCount + targetTierIndex + 1;

    let currentStep = 0;
    let currentIndex = -1;
    let spinTimeout: ReturnType<typeof setTimeout>;
    let blinkInterval: ReturnType<typeof setInterval>;
    let tiersFadeTimeout: ReturnType<typeof setTimeout>;
    let tipsFadeTimeout: ReturnType<typeof setTimeout>;

    const finishAnimation = () => {
      setIsAnimatingResult(false);
      setIsBlinkingLandingTier(false);
      setIsLandingBlinkVisible(false);
      setSlotActiveTierKey(undefined);
      setIsFadingOutTiers(true);

      tiersFadeTimeout = setTimeout(() => {
        setHideNonAchievedTiers(true);
        setIsFadingOutTiers(false);
        setIsTipsVisible(false);
        setShowTips(true);
        tipsFadeTimeout = setTimeout(() => {
          setIsTipsVisible(true);
          setShouldPlayResultAnimation(false);
        }, tipsFadeDelayMs);
      }, tiersFadeOutDurationMs);
    };

    const startLandingBlink = () => {
      let blinkTick = 0;
      const maxBlinkTicks = 6;

      setSlotActiveTierKey(resolvedTierKey);
      setIsBlinkingLandingTier(true);
      setIsLandingBlinkVisible(true);

      blinkInterval = setInterval(() => {
        blinkTick += 1;
        setIsLandingBlinkVisible((prev) => !prev);

        if (blinkTick < maxBlinkTicks) {
          return;
        }

        clearInterval(blinkInterval);
        finishAnimation();
      }, 180);
    };

    const spinToResult = () => {
      currentIndex = (currentIndex + 1) % aiFluencyTiers.length;
      currentStep += 1;

      setSlotActiveTierKey(aiFluencyTiers[currentIndex].key);

      if (currentStep >= totalSteps) {
        startLandingBlink();
        return;
      }

      const progress = currentStep / totalSteps;
      const delay = 70 + progress ** 2 * 260;
      spinTimeout = setTimeout(spinToResult, delay);
    };

    spinToResult();

    return () => {
      clearTimeout(spinTimeout);
      clearInterval(blinkInterval);
      clearTimeout(tiersFadeTimeout);
      clearTimeout(tipsFadeTimeout);
    };
  }, [hasCheckedResultAnimation, resolvedTierKey, shouldPlayResultAnimation]);

  const shareLink = useMemo(() => {
    if (!resolvedTierKey || !resolvedUserId || typeof window === 'undefined') {
      return '';
    }

    return `${window.location.origin}${getResultUrl(
      resolvedUserId,
      resolvedTierKey,
    )}`;
  }, [resolvedTierKey, resolvedUserId]);

  const [copyingShareLink, copyShareLink] = useCopyLink(() => shareLink, true);

  const currentQuestion = displayQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === displayQuestions.length - 1;
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;
  const startButtonLabel = isLoggedIn ? 'Start test' : 'Sign in to take test';

  const resetQuizState = () => {
    setStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setLocalTierKey(undefined);
  };

  const onStart = () => {
    logEvent({ event_name: LogEvent.StartAiFluencyQuiz });

    if (!isLoggedIn) {
      showLogin({ trigger: AuthTriggers.AiFluencyQuiz });
      return;
    }

    resetQuizState();
    setStarted(true);
  };

  const onBack = () => {
    if (currentQuestionIndex === 0) {
      return;
    }

    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const onSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const onCompleteQuiz = async () => {
    const tier = getAiFluencyTierFromAnswers(answers);

    setLocalTierKey(tier.key);
    setStarted(false);

    if (user?.id) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          quizCompletionSessionKey,
          JSON.stringify({
            userId: user.id,
            tier: tier.key,
            completedAt: Date.now(),
          }),
        );
      }
      await router.replace(getResultUrl(user.id, tier.key));
    }

    logEvent({
      event_name: LogEvent.CompleteAiFluencyQuiz,
      extra: JSON.stringify({ tier: tier.key }),
    });
  };

  const onNext = async () => {
    if (!currentQuestion || !currentAnswer) {
      return;
    }

    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    await onCompleteQuiz();
  };

  const onShareResult = async () => {
    if (!shareLink || !resolvedTierKey || !resolvedUserId) {
      return;
    }

    await copyShareLink({
      message: 'Result link copied to clipboard',
    });

    logEvent({
      event_name: LogEvent.ShareAiFluencyQuiz,
      extra: JSON.stringify({
        tier: resolvedTierKey,
        userId: resolvedUserId,
      }),
    });
  };

  const onRetake = async () => {
    resetQuizState();
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(quizCompletionSessionKey);
    }
    await router.replace(quizPathname);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 laptop:py-10">
      <Toast autoDismissNotifications />

      <header className="space-y-3">
        <h1 className="font-bold text-text-primary typo-title1">
          AI Fluency Quiz
        </h1>
        <p className="text-text-secondary typo-body">
          Answer 10 questions to discover your current AI fluency tier.
        </p>
      </header>

      {!resolvedTier && !started && (
        <section className="rounded-16 border border-border-subtlest-secondary bg-background-subtle p-6 laptop:p-8">
          <div className="space-y-3">
            <h2 className="font-bold text-text-primary typo-title3">
              Understand your AI fluency tier
            </h2>
            <p className="text-text-secondary typo-body">
              This 10-question test evaluates how you use AI across prompting,
              workflow design, quality control, automation, and collaboration.
            </p>
            <p className="text-text-tertiary typo-callout">
              You&apos;ll get mapped to one of {aiFluencyTiers.length} tiers,
              from Casual User to AI Pioneer, plus practical tips to strengthen
              your next step.
            </p>
          </div>
          <div className="mt-6">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              onClick={onStart}
              disabled={!isAuthReady}
            >
              {startButtonLabel}
            </Button>
          </div>
        </section>
      )}

      {started && currentQuestion && (
        <section className="rounded-16 border border-border-subtlest-secondary bg-background-subtle p-6 laptop:p-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-text-tertiary typo-callout">
              Question {currentQuestionIndex + 1} of {displayQuestions.length}
            </p>
            <div className="h-2 w-36 overflow-hidden rounded-4 bg-border-subtlest-tertiary">
              <div
                className="h-2 rounded-4 bg-brand-default transition-all"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / displayQuestions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <h2 className="mb-5 font-bold text-text-primary typo-title3">
            {currentQuestion.prompt}
          </h2>

          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option) => {
              const selected = currentAnswer === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectAnswer(currentQuestion.id, option.id)}
                  className={classNames(
                    'rounded-12 border px-4 py-3 text-left transition-colors',
                    selected
                      ? 'border-brand-default bg-brand-float text-text-primary'
                      : 'border-border-subtlest-tertiary bg-background-default text-text-secondary hover:bg-background-default hover:text-text-primary',
                  )}
                >
                  <span className="typo-body">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Medium}
              onClick={onBack}
              disabled={currentQuestionIndex === 0}
            >
              Back
            </Button>
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={onNext}
              disabled={!currentAnswer}
            >
              {isLastQuestion ? 'See result' : 'Next'}
            </Button>
          </div>
        </section>
      )}

      {resolvedTier && (
        <section className="rounded-16 border border-border-subtlest-secondary bg-background-subtle p-6 laptop:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {resultUser && (
                <ProfilePicture
                  user={resultUser}
                  size={ProfileImageSize.Large}
                  nativeLazyLoading
                />
              )}
              {!resultUser && (
                <div className="size-10 rounded-12 bg-border-subtlest-tertiary" />
              )}
              <div className="flex flex-col">
                <p className="font-bold text-text-primary typo-callout">
                  {resultName}
                </p>
                {resultUsername && (
                  <p className="text-text-tertiary typo-footnote">
                    {resultUsername}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {aiFluencyTiers.map((tier) => {
                const isAchievedTier = tier.key === resolvedTierKey;
                if (hideNonAchievedTiers && !isAchievedTier) {
                  return null;
                }

                const isSlotHighlightedTier = slotActiveTierKey === tier.key;
                const shouldShowAnimatedHighlight =
                  isSlotHighlightedTier &&
                  (!isBlinkingLandingTier || isLandingBlinkVisible);
                const shouldShowDefaultAchievedHighlight =
                  isAchievedTier && !isAnimatingResult && !didAnimateResult;
                const shouldUseGreenBackground =
                  shouldShowAnimatedHighlight ||
                  shouldShowDefaultAchievedHighlight;
                const shouldUseGreenBorder =
                  isSlotHighlightedTier ||
                  (isAchievedTier && !isAnimatingResult);
                const shouldFadeTier =
                  isFadingOutTiers && !isAchievedTier && didAnimateResult;
                let tierTitleColorClassName = 'text-text-secondary';
                if (shouldUseGreenBackground) {
                  tierTitleColorClassName = 'text-action-upvote-default';
                } else if (isAchievedTier) {
                  tierTitleColorClassName = 'text-text-primary';
                }

                let tierSummaryColorClassName = 'text-text-tertiary';
                if (shouldUseGreenBackground) {
                  tierSummaryColorClassName = 'text-action-upvote-default';
                } else if (isAchievedTier) {
                  tierSummaryColorClassName = 'text-text-secondary';
                }

                const tierTitleClassName = classNames(
                  'font-bold typo-callout',
                  tierTitleColorClassName,
                );
                const tierSummaryClassName = classNames(
                  'mt-1 typo-footnote',
                  tierSummaryColorClassName,
                );

                return (
                  <div
                    key={tier.key}
                    className={classNames(
                      'overflow-hidden transition-all duration-500',
                      shouldFadeTier
                        ? 'max-h-0 opacity-0'
                        : 'max-h-40 opacity-100',
                    )}
                  >
                    <div
                      className={classNames(
                        'rounded-10 border px-3 py-3',
                        shouldUseGreenBorder
                          ? 'border-action-upvote-default'
                          : 'border-border-subtlest-tertiary',
                        shouldUseGreenBackground
                          ? 'bg-action-upvote-float'
                          : 'bg-background-default',
                      )}
                    >
                      <p className={tierTitleClassName}>{tier.label}</p>
                      <p className={tierSummaryClassName}>{tier.summary}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {shouldShowTips && (
            <div
              className={classNames(
                'mt-6 rounded-12 border border-border-subtlest-secondary bg-background-default p-4 transition-opacity duration-500',
                isTipsVisible ? 'opacity-100' : 'opacity-0',
              )}
            >
              <h3 className="font-bold text-text-primary typo-title3">
                {nextTier
                  ? `How to reach ${nextTier.label}`
                  : 'How to stay at the top'}
              </h3>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-text-secondary typo-body">
                {aiFluencyTipsByTier[resolvedTier.key].map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              onClick={onShareResult}
              disabled={!shareLink}
            >
              {copyingShareLink ? 'Copied' : 'Share'}
            </Button>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Medium}
              onClick={onRetake}
            >
              Retake quiz
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

AiFluencyQuizPage.getLayout = getMainLayout;
AiFluencyQuizPage.layoutProps = { seo };

export default AiFluencyQuizPage;
