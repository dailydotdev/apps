import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import type {
  FunnelStepPersonaQuiz,
  FunnelStepPersonaQuizParameters,
  PersonaQuizOption,
  PersonaQuizRevealEntry,
} from '../../types/funnel';
import { FunnelStepTransitionType } from '../../types/funnel';
import { withIsActiveGuard } from '../../shared/withActiveGuard';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';
import useMutateFilters from '../../../../hooks/useMutateFilters';
import { usePersonaQuizState } from './usePersonaQuizState';
import type { PersonaQuizAnswer } from './usePersonaQuizState';
import { PersonaQuizQuestionView } from './PersonaQuizQuestion';
import { PersonaQuizFeedPreview } from './PersonaQuizFeedPreview';
import { PersonaQuizReveal } from './PersonaQuizReveal';

const pathSignature = (answers: PersonaQuizAnswer[]): string =>
  answers.map((a) => `${a.questionId}:${a.optionId}`).join('|');

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

  const params = parameters as FunnelStepPersonaQuizParameters;
  const {
    questions,
    selection,
    revealLookup,
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
    addTag,
    removeTag,
  } = usePersonaQuizState({ questions });

  const [revealText, setRevealText] = useState<PersonaQuizRevealEntry | null>(
    null,
  );

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

  // Resolve the final tag list + look up reveal copy by path signature, then
  // transition to the reveal phase. Pure local computation — no network call.
  const finishQuiz = useCallback(
    (committedAnswers: PersonaQuizAnswer[]) => {
      const signature = pathSignature(committedAnswers);
      const lookupEntry = revealLookup?.[signature] ?? null;
      setRevealText(lookupEntry);

      const merged = dedupePreserveOrder([
        ...accumulatedTags,
        ...(selection.fallbackTags ?? []),
      ]).slice(0, selection.targetTotalTags);
      enrichmentComplete(merged);
    },
    [
      revealLookup,
      accumulatedTags,
      selection.targetTotalTags,
      selection.fallbackTags,
      enrichmentComplete,
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
        {answers.length >= 1 && (
          <PersonaQuizFeedPreview includeTags={accumulatedTags} />
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
