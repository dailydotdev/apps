import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
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
import { defaultSeo } from '../../next-seo';

const quizPathname = '/quiz/ai-fluency';

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
  const resolvedUserId = hasSharedResult ? sharedUserId : user?.id;
  const shouldShowTips = Boolean(resolvedTier);
  const { data: sharedResultUser } = useUserShortByIdQuery({
    id: resolvedUserId || '',
  });
  const resultUser =
    user?.id && resolvedUserId === user.id ? user : sharedResultUser;
  const resultName = resultUser?.name || 'Unknown user';
  const resultUsername = resultUser?.username
    ? `@${resultUser.username}`
    : undefined;

  const nextTier = resolvedTier
    ? getAiFluencyNextTier(resolvedTier.key)
    : undefined;

  const shareLink = useMemo(() => {
    if (!resolvedTier || !resolvedUserId || typeof window === 'undefined') {
      return '';
    }

    return `${window.location.origin}${getResultUrl(
      resolvedUserId,
      resolvedTier.key,
    )}`;
  }, [resolvedTier, resolvedUserId]);

  const [copyingShareLink, copyShareLink] = useCopyLink(() => shareLink);

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
    if (!shareLink || !resolvedTier || !resolvedUserId) {
      return;
    }

    await copyShareLink({
      message: 'Result link copied to clipboard',
    });

    logEvent({
      event_name: LogEvent.ShareAiFluencyQuiz,
      extra: JSON.stringify({
        tier: resolvedTier.key,
        userId: resolvedUserId,
      }),
    });
  };

  const onRetake = async () => {
    resetQuizState();
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
          <div className="space-y-2">
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
            <h2 className="font-bold text-text-primary typo-title2">
              {resolvedTier.label}
            </h2>
            <p className="text-text-secondary typo-body">
              {resolvedTier.summary}
            </p>
          </div>

          {shouldShowTips && (
            <div className="mt-6 rounded-12 border border-border-subtlest-secondary bg-background-default p-4">
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
