import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAtom } from 'jotai/react';
import { UNDO } from 'jotai-history';
import type {
  FunnelJSON,
  FunnelPosition,
  NonChapterStep,
} from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import type { TrackOnNavigate } from './useFunnelTracking';
import {
  funnelPositionAtom,
  getFunnelStepByPosition,
  funnelPositionHistoryAtom,
} from '../store/funnelStore';

interface UseFunnelNavigationProps {
  funnel: FunnelJSON;
  onNavigation: TrackOnNavigate;
}

type Step = NonChapterStep;
type Chapters = Array<{ steps: number }>;
type StepMap = Record<Step['id'], { position: FunnelPosition }>;
type NavigateFunction = (options: {
  to: Step['id'];
  type?: FunnelStepTransitionType;
}) => void;

export interface UseFunnelStepReturn {
  canSkip: boolean;
  chapters: Chapters;
  hasPrev: boolean;
  navigate: NavigateFunction;
  onBack: () => void;
  onSkip: () => void;
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
  const [history, dispatchHistory] = useAtom(funnelPositionHistoryAtom);

  const chapters: Chapters = useMemo(
    () =>
      funnel.steps
        .filter((step) => 'steps' in step)
        .map((chapter) => ({ steps: chapter.steps.length })),
    [funnel],
  );

  const stepMap: StepMap = useMemo(() => {
    const map: StepMap = {};
    funnel.steps.forEach((chapter, chapterIndex) => {
      if ('steps' in chapter) {
        chapter.steps.forEach((step, stepIndex) => {
          map[step.id] = {
            position: {
              chapter: chapterIndex,
              step: stepIndex,
            },
          };
        });
      }
    });
    return map;
  }, [funnel]);

  const step: Step = useMemo(
    () => getFunnelStepByPosition(funnel, position),
    [funnel, position],
  );

  const hasPrev = history.canUndo;
  const onBack = useCallback(() => {
    if (!hasPrev) {
      return;
    }

    dispatchHistory(UNDO);
  }, [hasPrev, dispatchHistory]);

  const navigate: NavigateFunction = useCallback(
    ({ to, type = FunnelStepTransitionType.Complete }) => {
      if (!step) {
        return;
      }

      const from = step.id;
      const timeDuration = Date.now() - stepTimerStart;

      if (!stepMap[to]?.position) {
        return;
      }

      const newPosition = stepMap[to]?.position;
      setPosition(newPosition);
      // track navigation events
      onNavigation({ from, to, timeDuration, type });
    },
    [onNavigation, setPosition, step, stepMap, stepTimerStart],
  );

  const skipTarget = useMemo(() => {
    return step?.transitions?.find(
      ({ on }) => on === FunnelStepTransitionType.Skip,
    )?.destination;
  }, [step?.transitions]);

  const canSkip = !!skipTarget;

  const onSkip = useCallback(() => {
    return navigate({ to: skipTarget, type: FunnelStepTransitionType.Skip });
  }, [navigate, skipTarget]);

  useEffect(
    () => {
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
    },
    // Reset timer and update URL - ONLY - when step changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step?.id],
  );

  useEffect(
    () => {
      // on load check if stepId is in the URL and set the position
      const stepId = searchParams.get('stepId');

      if (!stepId) {
        return;
      }

      const newPosition = stepMap[stepId]?.position;
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
    navigate,
    onBack,
    onSkip,
    position,
    step,
  };
};
