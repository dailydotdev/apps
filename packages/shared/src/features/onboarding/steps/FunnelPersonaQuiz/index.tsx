import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

      const merged = dedupePreserveOrder([
        ...accumulatedTags,
        ...(selection.fallbackTags ?? []),
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
      enrichmentComplete,
      followTags,
      refetchPreview,
    ],
  );

  // Bootstrap: on first render with no current question, route to the opener.
  const bootstrapRef = useRef(false);
  useEffect(() => {
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

  if (phase === 'question') {
    if (!currentQuestion) {
      return null;
    }
    return (
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
      </div>
    );
  }

  // `enriching` phase is vestigial — the reducer still exposes it but the
  // orchestration transitions straight from `question` to `reveal` via
  // `enrichmentComplete` inside `finishQuiz`. Nothing should ever render here.
  if (phase === 'enriching') {
    return null;
  }

  return (
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
    />
  );
}

export const FunnelPersonaQuiz = withIsActiveGuard(FunnelPersonaQuizComponent);
