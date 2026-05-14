import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  FunnelStepPersonaQuiz,
  FunnelStepPersonaQuizParameters,
  PersonaQuizOption,
  PersonaQuizQuestion,
} from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { withIsActiveGuard } from '../../shared/withActiveGuard';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';
import useMutateFilters from '../../../../hooks/useMutateFilters';
import {
  discoverAndHydrateOnboardingPosts,
  extractOnboardingTagsFromQuiz,
  fetchNextQuizQuestion,
  type PersonaQuizAnswerInput,
  type PersonaQuizRevealText,
} from '../../../../graphql/personaQuiz';
import { usePersonaQuizState } from './usePersonaQuizState';
import { PersonaQuizQuestionView } from './PersonaQuizQuestion';
import { PersonaQuizEnriching } from './PersonaQuizEnriching';
import { PersonaQuizFeedPreview } from './PersonaQuizFeedPreview';
import { PersonaQuizReveal } from './PersonaQuizReveal';
import { PERSONA_QUIZ_TIPS } from './quizTips';

const buildSeedTags = (
  tagScores: Record<string, number>,
  floor: number,
  cap: number,
): string[] => {
  const positive = Object.entries(tagScores).filter(
    ([, score]) => score >= floor,
  );
  positive.sort(([, a], [, b]) => b - a);
  return positive.slice(0, cap).map(([tag]) => tag);
};

const buildAnswerInputs = (
  answers: Array<{ questionId: string; optionId: string }>,
  questions: PersonaQuizQuestion[],
): PersonaQuizAnswerInput[] =>
  answers
    .map(({ questionId, optionId }) => {
      const question = questions.find((q) => q.id === questionId);
      const option = question?.options.find((o) => o.id === optionId);
      if (!question || !option) {
        return null;
      }
      // Prefer the canonical `signal` over the playful display `label` so the
      // LLM gets a neutral, unambiguous description of what the user picked.
      return {
        questionId,
        question: question.prompt,
        optionId,
        answer: option.signal ?? option.label,
      };
    })
    .filter((entry): entry is PersonaQuizAnswerInput => entry !== null);

const dedupePreserveOrder = (tags: string[]): string[] =>
  Array.from(new Set(tags));

// Artificial pause between pre-authored static questions so the quiz feels
// deliberate rather than instant. The LLM path already has natural latency
// from the network call, so it gets the same loading screen for free.
// Tuned to leave a tip readable on the loading interstitial.
const STATIC_TRANSITION_DELAY_MS = 1800;

// Hard cap on the reveal LLM call. If bragi/recswipe stalls the user would
// otherwise be stuck on "Cooking up your developer profile…" indefinitely;
// after this we fall back to the seed-tag / fallback-tag path.
const ENRICHMENT_TIMEOUT_MS = 25_000;

class EnrichmentTimeoutError extends Error {
  constructor() {
    super('enrichment timed out');
    this.name = 'EnrichmentTimeoutError';
  }
}

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new EnrichmentTimeoutError()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });

function FunnelPersonaQuizComponent({
  id,
  parameters,
  onTransition,
}: FunnelStepPersonaQuiz): ReactElement | null {
  const { logEvent } = useLogContext();
  const auth = useAuthContext();
  const user = auth?.user;
  const { followTags } = useMutateFilters(user);

  const params = parameters as FunnelStepPersonaQuizParameters;
  const {
    questions,
    selection,
    enrichment,
    reveal: revealCopy,
    entryQuestionId,
  } = params;

  const [generatedQuestions, setGeneratedQuestions] = useState<
    PersonaQuizQuestion[]
  >([]);
  const allQuestions = useMemo(
    () => [...questions, ...generatedQuestions],
    [questions, generatedQuestions],
  );

  const {
    phase,
    currentQuestion,
    answers,
    tagScores,
    finalTags,
    lastOption,
    goToQuestion,
    answer,
    startEnriching,
    enrichmentComplete,
    addTag,
    removeTag,
  } = usePersonaQuizState({ questions: allQuestions });

  const [revealText, setRevealText] = useState<PersonaQuizRevealText | null>(
    null,
  );
  const [pendingStaticTarget, setPendingStaticTarget] = useState<string | null>(
    null,
  );
  const [pendingLlmTarget, setPendingLlmTarget] = useState<string | null>(null);
  const [staticMinDelayMet, setStaticMinDelayMet] = useState(false);

  const didStartLogRef = useRef(false);
  const decidedAnswerCountRef = useRef(0);
  const enrichmentTriggeredRef = useRef(false);
  const llmRetryCountRef = useRef(0);

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

  const llmSeedTags = useMemo(
    () =>
      Object.entries(tagScores)
        .filter(([, score]) => score >= 1)
        .sort(([, a], [, b]) => b - a)
        .map(([tag]) => tag)
        .slice(0, 16),
    [tagScores],
  );

  // Recswipe-backed preview for the question the user is about to see.
  // Re-keys on each answer so the cards reflect what the running tag set
  // suggests; the loading screen blocks the transition until this resolves.
  const previewQuery = useQuery({
    queryKey: [
      'persona-quiz-feed-preview',
      llmSeedTags.join('|'),
      answers.length,
    ],
    queryFn: () =>
      discoverAndHydrateOnboardingPosts(
        { selectedTags: llmSeedTags, n: 6 },
        !!user,
      ),
    enabled:
      phase === 'question' && answers.length >= 1 && llmSeedTags.length > 0,
    staleTime: Infinity,
    retry: false,
  });
  // Block transitions while the next question's preview is still being
  // fetched. `isFetching` covers in-flight requests regardless of whether
  // the query has prior data; `fetchStatus === 'idle'` covers the
  // disabled-query case (e.g., no seed tags yet) so we don't deadlock.
  const previewBlocking =
    previewQuery.fetchStatus === 'fetching' && !previewQuery.data;

  const nextQuestionMutation = useMutation({
    mutationFn: async () => {
      const answerInputs = buildAnswerInputs(answers, allQuestions);
      return fetchNextQuizQuestion(
        answerInputs,
        llmSeedTags,
        answers.length,
        selection.maxQuestions,
      );
    },
    onSuccess: (result) => {
      const hasMinQuestions = answers.length >= selection.minQuestions;

      // Happy path: model returned a question. Use it regardless of
      // `isFinal` — we're authoritative on when to stop. Defer the
      // transition until the recswipe preview for the new question
      // resolves, so the loading screen is meaningful instead of arbitrary.
      if (result.question) {
        llmRetryCountRef.current = 0;
        const next = result.question;
        setGeneratedQuestions((prev) =>
          prev.some((q) => q.id === next.id) ? prev : [...prev, next],
        );
        setPendingLlmTarget(next.id);
        return;
      }

      // Model refused to ask anything. If we've already cleared the
      // minimum, honor it.
      if (hasMinQuestions) {
        llmRetryCountRef.current = 0;
        startEnriching();
        return;
      }

      // Below the minimum and the model bailed. Retry a couple of times —
      // temperature=1 means a resend has a real shot at returning a
      // question. After the cap, fall through to enrichment rather than
      // looping forever.
      const MAX_LLM_RETRIES = 2;
      if (llmRetryCountRef.current < MAX_LLM_RETRIES) {
        llmRetryCountRef.current += 1;
        nextQuestionMutation.mutate();
        return;
      }
      llmRetryCountRef.current = 0;
      startEnriching();
    },
    onError: () => {
      // If LLM question generation fails, advance to enrichment so the user
      // still gets seed tags + reveal rather than a stuck quiz.
      startEnriching();
    },
  });

  useEffect(() => {
    if (phase !== 'question') {
      return;
    }
    // Q1 stays static — consistent bucketing across users and the LLM
    // under-delivered on opener width. From Q2 onward, the static decision
    // tree drives via `option.next` until pointers run out (Q5+ → LLM).
    if (
      !currentQuestion &&
      answers.length === 0 &&
      decidedAnswerCountRef.current === 0
    ) {
      decidedAnswerCountRef.current = -1;
      const opener =
        (entryQuestionId && questions.find((q) => q.id === entryQuestionId)) ||
        questions[0];
      if (opener) {
        goToQuestion(opener.id);
      } else {
        startEnriching();
      }
      return;
    }
    if (
      answers.length > 0 &&
      answers.length !== decidedAnswerCountRef.current
    ) {
      decidedAnswerCountRef.current = answers.length;
      if (answers.length >= selection.maxQuestions) {
        startEnriching();
        return;
      }
      // Honor static `next` pointers while they exist (opener and Q2–Q4 are
      // pre-authored). Q4 options have no `next`, so we fall through to the
      // LLM from Q5 onward. Static transitions are gated by a "reading the
      // room" interstitial so the quiz doesn't feel instant.
      if (lastOption?.next) {
        const nextStatic = allQuestions.find((q) => q.id === lastOption.next);
        if (nextStatic) {
          setPendingStaticTarget(nextStatic.id);
          return;
        }
      }
      nextQuestionMutation.mutate();
    }
  }, [
    phase,
    currentQuestion,
    answers.length,
    lastOption,
    questions,
    allQuestions,
    entryQuestionId,
    selection.maxQuestions,
    goToQuestion,
    startEnriching,
    nextQuestionMutation,
  ]);

  // Static path: hold the loading screen for at least STATIC_TRANSITION_DELAY_MS
  // so the tip is readable, then wait for the recswipe preview to finish too.
  useEffect(() => {
    if (!pendingStaticTarget) {
      setStaticMinDelayMet(false);
      return undefined;
    }
    setStaticMinDelayMet(false);
    const timer = setTimeout(
      () => setStaticMinDelayMet(true),
      STATIC_TRANSITION_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [pendingStaticTarget]);

  useEffect(() => {
    if (!pendingStaticTarget) {
      return;
    }
    if (!staticMinDelayMet) {
      return;
    }
    if (previewBlocking) {
      return;
    }
    goToQuestion(pendingStaticTarget);
    setPendingStaticTarget(null);
  }, [pendingStaticTarget, staticMinDelayMet, previewBlocking, goToQuestion]);

  // LLM path: the LLM call itself is the visible delay; once it resolves
  // we only wait for the preview before showing the new question.
  // Guard on `phase === 'question'` so a late-arriving LLM result cannot
  // bounce the user back from `enriching` (the max-questions check) into
  // a stale `question` state.
  useEffect(() => {
    if (!pendingLlmTarget) {
      return;
    }
    if (phase !== 'question') {
      setPendingLlmTarget(null);
      return;
    }
    if (previewBlocking) {
      return;
    }
    goToQuestion(pendingLlmTarget);
    setPendingLlmTarget(null);
  }, [pendingLlmTarget, previewBlocking, goToQuestion, phase]);

  const enrichmentMutation = useMutation({
    mutationFn: async (): Promise<{
      tags: string[];
      reveal: PersonaQuizRevealText | null;
    }> => {
      const seedTags = buildSeedTags(
        tagScores,
        Math.max(1, selection.tagConfidenceFloor),
        enrichment.targetTotalTags,
      );
      if (!enrichment.enabled) {
        return { tags: seedTags, reveal: null };
      }
      const answerInputs = buildAnswerInputs(answers, allQuestions);
      // Bragi's `target_count` is the TOTAL desired tag count, not the
      // remaining slots after seedTags. daily-api's Zod schema also rejects
      // values below 1, so when seedTags already fills the target we'd send
      // `0` and the whole call fails with ZOD_VALIDATION_ERROR (which then
      // surfaces as a null reveal to the user).
      try {
        const result = await withTimeout(
          extractOnboardingTagsFromQuiz(
            answerInputs,
            seedTags,
            enrichment.targetTotalTags,
          ),
          ENRICHMENT_TIMEOUT_MS,
        );
        const merged = dedupePreserveOrder([
          ...seedTags,
          ...result.includeTags,
        ]).slice(0, enrichment.targetTotalTags);
        return { tags: merged, reveal: result.reveal };
      } catch (error) {
        const fallback = enrichment.fallbackTags ?? [];
        return {
          tags: dedupePreserveOrder([...seedTags, ...fallback]).slice(
            0,
            enrichment.targetTotalTags,
          ),
          reveal: null,
        };
      }
    },
    onSuccess: (result) => {
      setRevealText(result.reveal);
      enrichmentComplete(result.tags);
    },
  });

  useEffect(() => {
    if (phase !== 'enriching' || enrichmentTriggeredRef.current) {
      return;
    }
    enrichmentTriggeredRef.current = true;
    enrichmentMutation.mutate();
  }, [phase, enrichmentMutation]);

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

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (finalTags.length > 0) {
        await Promise.resolve(followTags({ tags: finalTags }));
      }
    },
    onSuccess: () => {
      logEvent({
        event_name: LogEvent.CompletePersonaQuiz,
        extra: JSON.stringify({
          tagCount: finalTags.length,
          answerCount: answers.length,
        }),
      });
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: {
          tags: finalTags,
          quizAnswers: answers,
        },
      });
    },
  });

  const handleAddTag = useCallback(
    (tag: string) => {
      logEvent({
        event_name: LogEvent.PersonaQuizTagEdit,
        target_id: tag,
        extra: JSON.stringify({ action: 'add' }),
      });
      addTag(tag);
    },
    [addTag, logEvent],
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      logEvent({
        event_name: LogEvent.PersonaQuizTagEdit,
        target_id: tag,
        extra: JSON.stringify({ action: 'remove' }),
      });
      removeTag(tag);
    },
    [removeTag, logEvent],
  );

  const handleSubmitFeedback = useCallback(
    (text: string) => {
      logEvent({
        event_name: LogEvent.PersonaQuizFeedback,
        extra: JSON.stringify({
          revealHeadline: revealText?.headline ?? null,
          tags: finalTags,
          text,
        }),
      });
    },
    [revealText, finalTags, logEvent],
  );

  const tipIndex = Math.min(answers.length, PERSONA_QUIZ_TIPS.length - 1);
  const currentTip = PERSONA_QUIZ_TIPS[tipIndex];

  if (phase === 'question') {
    if (
      pendingStaticTarget ||
      pendingLlmTarget ||
      nextQuestionMutation.isPending
    ) {
      return (
        <PersonaQuizEnriching message="Reading the room…" tip={currentTip} />
      );
    }
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
        {answers.length >= 1 && (
          <PersonaQuizFeedPreview posts={previewQuery.data?.posts ?? []} />
        )}
      </div>
    );
  }

  if (phase === 'enriching') {
    return <PersonaQuizEnriching tip={currentTip} />;
  }

  return (
    <PersonaQuizReveal
      revealText={revealText}
      tags={finalTags}
      reveal={revealCopy}
      isFinalizing={finalizeMutation.isPending}
      onAddTag={handleAddTag}
      onRemoveTag={handleRemoveTag}
      onSubmitFeedback={handleSubmitFeedback}
      onComplete={() => finalizeMutation.mutate()}
    />
  );
}

export const FunnelPersonaQuiz = withIsActiveGuard(FunnelPersonaQuizComponent);
