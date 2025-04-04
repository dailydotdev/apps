import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type {
  FunnelStep,
  FunnelJSON,
  FunnelStepChapter,
} from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import type { TrackOnNavigate } from './useFunnelTracking';

interface UseFunnelNavigationProps {
  funnel: FunnelJSON;
  onNavigation: TrackOnNavigate;
}

interface Position {
  chapter: number;
  step: number;
}

type Step = Exclude<FunnelStep, FunnelStepChapter>;
type Chapters = Array<{ steps: number }>;

export interface UseFunnelStepReturn {
  canSkip: boolean;
  chapters: Chapters;
  hasPrev: boolean;
  navigateNext: () => void;
  navigatePrev: () => void;
  position: Position;
  step: Step;
}

export const useFunnelNavigation = ({
  funnel,
  onNavigation,
}: UseFunnelNavigationProps): UseFunnelStepReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [stepTimerStart, setStepTimerStart] = useState<number>(0);
  const [position, setPosition] = useState<Position>({
    chapter: 0,
    step: 0,
  });

  const chapters: Chapters = useMemo(
    () =>
      funnel.steps
        .filter((step) => 'steps' in step)
        .map((chapter) => ({ steps: chapter.steps.length })),
    [funnel],
  );

  const step: Step = funnel.steps?.[position.chapter]?.[position.step];

  const canSkip = useMemo(() => {
    return step.transitions.some(
      ({ on }) => on === FunnelStepTransitionType.Skip,
    );
  }, [step.transitions]);

  const hasPrev = !!position.step || !!position.chapter;

  const navigateNext = useCallback(() => {
    const from = step.id;
    const timeDuration = Date.now() - stepTimerStart;

    const isLastStep = position.step === chapters[position.chapter].steps - 1;
    const isLastChapter = position.chapter === chapters.length - 1;
    const hasNext = !isLastChapter || !isLastStep;

    if (!hasNext) {
      return;
    }

    const newPosition: Position = {
      chapter: isLastStep ? position.chapter + 1 : position.chapter,
      step: isLastStep ? 0 : position.step + 1,
    };

    const to = funnel.steps[newPosition.chapter][newPosition.step].id;
    setPosition(newPosition);
    // track navigation events
    onNavigation({ from, to, timeDuration });
  }, [chapters, funnel.steps, onNavigation, position, step, stepTimerStart]);

  const navigatePrev = useCallback(() => {
    const from = step.id;
    const timeDuration = Date.now() - stepTimerStart;

    if (!hasPrev) {
      return;
    }

    const isFirstStep = position.step === 0;
    const newPosition: Position = {
      chapter: isFirstStep ? position.chapter - 1 : position.chapter,
      step: isFirstStep
        ? chapters[position.chapter - 1].steps - 1
        : position.step - 1,
    };

    const to = funnel.steps[newPosition.chapter][newPosition.step].id;
    setPosition(newPosition);

    // track navigation events
    onNavigation({ from, to, timeDuration });
  }, [
    chapters,
    funnel.steps,
    hasPrev,
    onNavigation,
    position,
    step.id,
    stepTimerStart,
  ]);

  useEffect(() => {
    // Reset the timer when the step changes
    setStepTimerStart(Date.now());

    // update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('stepId', step.id);
    router.replace(`/${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }, [pathname, router, searchParams, step.id]);

  useEffect(
    () => {
      // on load check if stepId is in the URL and set the position
      const stepId = searchParams.get('stepId');

      if (!stepId) {
        return;
      }

      const newPosition = funnel.steps.reduce(
        (acc, currChapter, chapterIndex) => {
          if (!('steps' in currChapter)) {
            return acc;
          }

          const stepIndex = currChapter.steps.findIndex(
            ({ id }) => id === stepId,
          );
          return stepIndex !== -1
            ? { chapter: chapterIndex, step: stepIndex }
            : acc;
        },
        { chapter: 0, step: 0 },
      );
      setPosition(newPosition);
    },
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    canSkip,
    chapters,
    hasPrev,
    navigateNext,
    navigatePrev,
    position,
    step,
  };
};
