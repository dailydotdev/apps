import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAtom } from 'jotai/react';
import type {
  FunnelStep,
  FunnelJSON,
  FunnelStepChapter,
  FunnelPosition,
} from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import type { TrackOnNavigate } from './useFunnelTracking';
import {
  funnelPositionAtom,
  getFunnelStepByPosition,
} from '../store/funnelStore';

interface UseFunnelNavigationProps {
  funnel: FunnelJSON;
  onNavigation: TrackOnNavigate;
}

type Step = Exclude<FunnelStep, FunnelStepChapter>;
type Chapters = Array<{ steps: number }>;

export interface UseFunnelStepReturn {
  canSkip: boolean;
  chapters: Chapters;
  hasPrev: boolean;
  navigateNext: () => void;
  navigatePrev: () => void;
  position: FunnelPosition;
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
  const [position, setPosition] = useAtom(funnelPositionAtom);

  const chapters: Chapters = useMemo(
    () =>
      funnel.steps
        .filter((step) => 'steps' in step)
        .map((chapter) => ({ steps: chapter.steps.length })),
    [funnel],
  );

  const step: Step = useMemo(
    () => getFunnelStepByPosition(funnel, position),
    [funnel, position],
  );

  const canSkip = useMemo(() => {
    return !!step?.transitions?.some(
      ({ on }) => on === FunnelStepTransitionType.Skip,
    );
  }, [step?.transitions]);

  const hasPrev = !!position.step || !!position.chapter;

  const navigateNext = useCallback(() => {
    if (!step) {
      return;
    }

    const from = step.id;
    const timeDuration = Date.now() - stepTimerStart;

    const isLastStep = position.step === chapters[position.chapter].steps - 1;
    const isLastChapter = position.chapter === chapters.length - 1;
    const hasNext = !isLastChapter || !isLastStep;

    if (!hasNext) {
      return;
    }

    const newPosition: FunnelPosition = {
      chapter: isLastStep ? position.chapter + 1 : position.chapter,
      step: isLastStep ? 0 : position.step + 1,
    };

    const to = getFunnelStepByPosition(funnel, newPosition)?.id;
    setPosition(newPosition);
    // track navigation events
    onNavigation({ from, to, timeDuration });
  }, [
    chapters,
    funnel,
    onNavigation,
    position.chapter,
    position.step,
    setPosition,
    step,
    stepTimerStart,
  ]);

  const navigatePrev = useCallback(() => {
    if (!step) {
      return;
    }
    const from = step.id;
    const timeDuration = Date.now() - stepTimerStart;

    if (!hasPrev) {
      return;
    }

    const isFirstStep = position.step === 0;
    const newPosition: FunnelPosition = {
      chapter: isFirstStep ? position.chapter - 1 : position.chapter,
      step: isFirstStep
        ? chapters[position.chapter - 1].steps - 1
        : position.step - 1,
    };

    const to = getFunnelStepByPosition(funnel, newPosition)?.id;
    setPosition(newPosition);

    // track navigation events
    onNavigation({ from, to, timeDuration });
  }, [
    chapters,
    funnel,
    hasPrev,
    onNavigation,
    position.chapter,
    position.step,
    setPosition,
    step,
    stepTimerStart,
  ]);

  useEffect(() => {
    // Reset the timer when the step changes
    setStepTimerStart(Date.now());

    // update URL
    if (step?.id) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('stepId', step.id);
      router.replace(`/${pathname}?${params.toString()}`, {
        scroll: false,
      });
    }
  }, [pathname, router, searchParams, step?.id]);

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
