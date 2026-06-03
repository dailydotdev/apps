import type { ReactElement, ReactNode } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  FunnelStepPersonaQuiz,
  FunnelStepPersonaQuizParameters,
  PersonaArchetype,
  PersonaQuizOption,
} from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { withIsActiveGuard } from '../../shared/withActiveGuard';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';
import useMutateFilters from '../../../../hooks/useMutateFilters';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { usePersonaQuizState } from './usePersonaQuizState';
import type { PersonaQuizAnswer } from './usePersonaQuizState';
import { PersonaQuizQuestionView } from './PersonaQuizQuestion';
import { PersonaQuizReveal } from './PersonaQuizReveal';
import Feed from '../../../../components/Feed';
import { FeedLayoutProvider } from '../../../../contexts/FeedContext';
import { OtherFeedPage, RequestKey } from '../../../../lib/query';
import { PREVIEW_FEED_QUERY } from '../../../../graphql/feed';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { onboardingGradientClasses } from '../../../../components/onboarding/common';

const dedupePreserveOrder = (tags: string[]): string[] =>
  Array.from(new Set(tags));

function FunnelPersonaQuizComponent({
  id,
  parameters,
  onTransition,
}: FunnelStepPersonaQuiz): ReactElement | null {
  const { logEvent } = useLogContext();
  const auth = useAuthContext();
  const user = auth?.user;
  const { followTags } = useMutateFilters(user);
  const { feedSettings } = useFeedSettings();
  const queryClient = useQueryClient();

  const params = parameters as FunnelStepPersonaQuizParameters;
  const {
    questions,
    selection,
    archetypes,
    reveal: revealCopy,
    entryQuestionId,
    headline,
    explainer,
  } = params;

  const {
    phase,
    currentQuestion,
    answers,
    tagScores,
    finalTags,
    lastOption,
    goToQuestion,
    answer,
    enrichmentComplete,
  } = usePersonaQuizState({ questions });

  const [revealArchetype, setRevealArchetype] =
    useState<PersonaArchetype | null>(null);

  // When the step provides an intro headline, gate the quiz behind a "Begin"
  // screen; otherwise start immediately (keeps embeddings without an intro,
  // e.g. tests, unchanged).
  const [started, setStarted] = useState(!params.headline);

  const didStartLogRef = useRef(false);
  useEffect(() => {
    if (didStartLogRef.current) {
      return;
    }
    didStartLogRef.current = true;
    logEvent({
      event_name: LogEvent.StartPersonaQuiz,
      extra: JSON.stringify({ stepId: id, version: parameters.version }),
    });
  }, [id, logEvent, parameters.version]);

  // Tags accumulated so far, sorted by score (used both for the live feed
  // preview and to derive the final follow list at reveal time).
  const accumulatedTags = useMemo(
    () =>
      Object.entries(tagScores)
        .filter(([, score]) => score >= selection.tagConfidenceFloor)
        .sort(([, a], [, b]) => b - a)
        .map(([tag]) => tag),
    [tagScores, selection.tagConfidenceFloor],
  );

  // Top tags used to filter the inter-question feed preview. Capped at 12 to
  // keep the GraphQL request lean.
  const previewTags = useMemo(
    () => accumulatedTags.slice(0, 12),
    [accumulatedTags],
  );

  // The server's `feedPreview` resolver reads from the user's persisted
  // `feedSettings` rather than the inline `filters` argument we can pass
  // through `Feed`'s `variables` prop. So to make the preview reflect the
  // user's evolving interests we have to actually persist tags as they
  // accumulate. Track the session's "already followed" set so each tag fires
  // `followTags` at most once.
  const followedRef = useRef<Set<string>>(new Set());
  const [refetchPreview] = useDebounceFn(() => {
    queryClient.invalidateQueries({
      queryKey: [RequestKey.FeedPreview],
      predicate: (q) => !q.queryKey.includes(RequestKey.FeedPreviewCustom),
    });
  }, 500);

  useEffect(() => {
    if (phase !== 'question' || !user?.id) {
      return;
    }
    const fresh = accumulatedTags.filter((t) => !followedRef.current.has(t));
    if (fresh.length === 0) {
      return;
    }
    fresh.forEach((t) => followedRef.current.add(t));
    Promise.resolve(followTags({ tags: fresh })).catch(() => undefined);
    refetchPreview();
  }, [accumulatedTags, phase, user?.id, followTags, refetchPreview]);

  // Resolve the archetype from the terminal question's `archetypeId`, build
  // the final tag list, persist it (so `TagSelection` on the reveal screen
  // sees the quiz tags pre-selected via `feedSettings`), then transition to
  // the reveal phase.
  const finishQuiz = useCallback(
    (committedAnswers: PersonaQuizAnswer[]) => {
      const lastAnswer = committedAnswers[committedAnswers.length - 1];
      const terminalQuestion = lastAnswer
        ? questions.find((q) => q.id === lastAnswer.questionId)
        : null;
      const archetype =
        archetypes.find((a) => a.id === terminalQuestion?.archetypeId) ?? null;
      setRevealArchetype(archetype);

      // Backfill with tags relevant to the chosen domain (the opener answer)
      // rather than a generic list, falling back to the generic one.
      const domainAnswer = committedAnswers[0]?.optionId;
      const fallback =
        (domainAnswer && selection.fallbackTagsByDomain?.[domainAnswer]) ||
        selection.fallbackTags ||
        [];

      // Seed the persona's canonical tags first so the reveal headline and the
      // followed tags stay coherent, then the user's strongest answer-derived
      // tags, then domain backfill. Cap at the target.
      const merged = dedupePreserveOrder([
        ...(archetype?.keyTags ?? []).slice(0, 4),
        ...accumulatedTags,
        ...fallback,
      ]).slice(0, selection.targetTotalTags);

      // Most tags are already followed (we stream them incrementally above);
      // catch any residue — typically the fallback backfill — so the reveal's
      // `TagSelection` reads a complete `feedSettings`.
      const fresh = merged.filter((t) => !followedRef.current.has(t));
      if (fresh.length > 0) {
        fresh.forEach((t) => followedRef.current.add(t));
        Promise.resolve(followTags({ tags: fresh })).catch(() => undefined);
        refetchPreview();
      }

      enrichmentComplete(merged);
    },
    [
      archetypes,
      questions,
      accumulatedTags,
      selection.targetTotalTags,
      selection.fallbackTags,
      selection.fallbackTagsByDomain,
      enrichmentComplete,
      followTags,
      refetchPreview,
    ],
  );

  // Bootstrap: once started, on first render with no current question, route
  // to the opener.
  const bootstrapRef = useRef(false);
  useEffect(() => {
    if (!started) {
      return;
    }
    if (bootstrapRef.current) {
      return;
    }
    if (phase !== 'question' || currentQuestion) {
      return;
    }
    bootstrapRef.current = true;
    const opener =
      (entryQuestionId && questions.find((q) => q.id === entryQuestionId)) ||
      questions[0];
    if (opener) {
      goToQuestion(opener.id);
    } else {
      finishQuiz(answers);
    }
  }, [
    started,
    phase,
    currentQuestion,
    entryQuestionId,
    questions,
    goToQuestion,
    answers,
    finishQuiz,
  ]);

  // Drive forward after each answer: follow `option.next` if it exists, or
  // finish the quiz (terminal answer / safety cap). Instant — no waiting.
  const lastHandledCountRef = useRef(0);
  useEffect(() => {
    if (phase !== 'question') {
      return;
    }
    if (answers.length === 0) {
      return;
    }
    if (answers.length === lastHandledCountRef.current) {
      return;
    }
    lastHandledCountRef.current = answers.length;

    if (answers.length >= selection.maxQuestions) {
      finishQuiz(answers);
      return;
    }

    if (lastOption?.next) {
      const nextQuestion = questions.find((q) => q.id === lastOption.next);
      if (nextQuestion) {
        goToQuestion(nextQuestion.id);
        return;
      }
    }

    finishQuiz(answers);
  }, [
    phase,
    answers,
    lastOption,
    questions,
    selection.maxQuestions,
    goToQuestion,
    finishQuiz,
  ]);

  const handleAnswer = useCallback(
    (option: PersonaQuizOption) => {
      if (!currentQuestion) {
        return;
      }
      logEvent({
        event_name: LogEvent.AnswerPersonaQuestion,
        target_id: currentQuestion.id,
        extra: JSON.stringify({
          optionId: option.id,
          axis: currentQuestion.axis,
        }),
      });
      answer(currentQuestion, option);
    },
    [currentQuestion, answer, logEvent],
  );

  // Tags were persisted in `finishQuiz`; further add/remove during the reveal
  // happens inside `TagSelection` via `useTagAndSource`. Finalising is a pure
  // transition with the latest `finalTags` snapshot passed by the reveal.
  const finalizeMutation = useMutation({
    mutationFn: async (latestTags: string[]) => latestTags,
    onSuccess: (latestTags) => {
      logEvent({
        event_name: LogEvent.CompletePersonaQuiz,
        extra: JSON.stringify({
          tagCount: latestTags.length,
          answerCount: answers.length,
        }),
      });
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: {
          tags: latestTags,
          quizAnswers: answers,
        },
      });
    },
  });

  const handleSubmitFeedback = useCallback(
    (text: string) => {
      logEvent({
        event_name: LogEvent.PersonaQuizFeedback,
        extra: JSON.stringify({
          revealArchetypeId: revealArchetype?.id ?? null,
          revealHeadline: revealArchetype?.headline ?? null,
          tags: finalTags,
          text,
        }),
      });
    },
    [revealArchetype, finalTags, logEvent],
  );

  // Soft, drifting accent glows behind every screen for the "cosmic" feel —
  // pure decoration, built from design-system accent tokens (no raw colours).
  const withBackdrop = (node: ReactNode): ReactElement => (
    <div className="relative flex w-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="animate-float-slow bg-accent-cabbage-default/10 absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl" />
        <div className="animate-float-slow-reverse bg-accent-onion-default/[0.08] absolute -right-24 top-1/3 h-64 w-64 rounded-full blur-3xl" />
        <div className="animate-float-slow-delayed bg-accent-bacon-default/[0.06] absolute bottom-0 left-1/3 h-56 w-56 rounded-full blur-3xl" />
      </div>
      <div className="relative z-1 flex flex-1 flex-col">{node}</div>
    </div>
  );

  if (!started) {
    return withBackdrop(
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4 py-10 text-center tablet:mx-auto tablet:max-w-xl">
        <div className="relative grid place-items-center">
          <div
            aria-hidden
            className="bg-accent-cabbage-default/20 absolute h-32 w-32 rounded-full blur-3xl"
          />
          <span aria-hidden className="animate-float-slow relative text-8xl">
            🧞
          </span>
        </div>
        {headline && (
          <h1
            className={classNames(
              'typo-mega2 tablet:typo-giga3',
              onboardingGradientClasses,
            )}
          >
            {headline}
          </h1>
        )}
        {explainer && (
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="max-w-md"
          >
            {explainer}
          </Typography>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.XLarge}
          onClick={() => setStarted(true)}
        >
          Begin
        </Button>
      </div>,
    );
  }

  if (phase === 'question') {
    if (!currentQuestion) {
      return null;
    }
    return withBackdrop(
      <div className="flex w-full flex-1 flex-col">
        <PersonaQuizQuestionView
          question={currentQuestion}
          step={answers.length + 1}
          totalSteps={selection.maxQuestions}
          onSelect={handleAnswer}
        />
        {answers.length >= 1 && user?.id && previewTags.length > 0 && (
          <FeedLayoutProvider>
            <p className="mt-10 text-center text-text-tertiary typo-footnote">
              Sneak peek of your feed
            </p>
            <Feed
              className="relative mx-auto px-6 pt-6 tablet:left-1/2 tablet:w-screen tablet:-translate-x-1/2"
              feedName={OtherFeedPage.Preview}
              feedQueryKey={[RequestKey.FeedPreview, user.id]}
              query={PREVIEW_FEED_QUERY}
              showSearch={false}
              options={{ refetchOnMount: true }}
              allowPin
            />
          </FeedLayoutProvider>
        )}
      </div>,
    );
  }

  // `enriching` phase is vestigial — the reducer still exposes it but the
  // orchestration transitions straight from `question` to `reveal` via
  // `enrichmentComplete` inside `finishQuiz`. Nothing should ever render here.
  if (phase === 'enriching') {
    return null;
  }

  return withBackdrop(
    <PersonaQuizReveal
      archetype={revealArchetype}
      tags={finalTags}
      userId={user?.id}
      reveal={revealCopy}
      isFinalizing={finalizeMutation.isPending}
      onSubmitFeedback={handleSubmitFeedback}
      onComplete={() => {
        // Tag list is whatever feedSettings holds RIGHT NOW (TagSelection has
        // been mutating it during the reveal). Fall back to the quiz-derived
        // snapshot when feedSettings isn't available (e.g. anonymous user).
        const latest = feedSettings?.includeTags?.length
          ? feedSettings.includeTags
          : finalTags;
        finalizeMutation.mutate(latest);
      }}
    />,
  );
}

export const FunnelPersonaQuiz = withIsActiveGuard(FunnelPersonaQuizComponent);
