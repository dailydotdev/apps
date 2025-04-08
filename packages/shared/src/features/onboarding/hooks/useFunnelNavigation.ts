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

type Chapters = Array<{ steps: number }>;
type StepMap = Record<NonChapterStep['id'], { position: FunnelPosition }>;
type NavigateFunction = (options: {
  to: NonChapterStep['id'];
  type?: FunnelStepTransitionType;
}) => void;

interface HeaderNavigation {
  hasTarget: boolean;
  navigate: () => void;
}

export interface UseFunnelNavigationReturn {
  chapters: Chapters;
  navigate: NavigateFunction;
  position: FunnelPosition;
  step: NonChapterStep;
  back: HeaderNavigation;
  skip: HeaderNavigation;
}

export const useFunnelNavigation = ({
  funnel,
  onNavigation,
}: UseFunnelNavigationProps): UseFunnelNavigationReturn => {
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

  const step: NonChapterStep = useMemo(
    () => getFunnelStepByPosition(funnel, position),
    [funnel, position],
  );

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
      onNavigation({ from, to, timeDuration, type });
    },
    [onNavigation, setPosition, step, stepMap, stepTimerStart],
  );

  const back: HeaderNavigation = useMemo(() => {
    return {
      hasTarget: history.canUndo,
      navigate: () => {
        if (!history.canUndo) {
          return;
        }
        dispatchHistory(UNDO);
      },
    };
  }, [dispatchHistory, history.canUndo]);

  const skip: HeaderNavigation = useMemo(() => {
    const skipTarget = step?.transitions?.find(
      ({ on }) => on === FunnelStepTransitionType.Skip,
    )?.destination;

    return {
      hasTarget: !!skipTarget,
      navigate: () => {
        if (!skipTarget) {
          return;
        }
        navigate({ to: skipTarget, type: FunnelStepTransitionType.Skip });
      },
    };
  }, [navigate, step?.transitions]);

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
    back,
    chapters,
    navigate,
    position,
    skip,
    step,
  };
};
