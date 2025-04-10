import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAtom } from 'jotai/react';
import { UNDO } from 'jotai-history';
import type { FunnelJSON, FunnelPosition, FunnelStep } from '../types/funnel';
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
type StepMap = Record<FunnelStep['id'], { position: FunnelPosition }>;
type NavigateFunction = (options: {
  to: FunnelStep['id'];
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
  step: FunnelStep;
  back: HeaderNavigation;
  skip: Omit<HeaderNavigation, 'navigate'>;
}

function getStepMap(funnel: FunnelJSON): StepMap {
  const stepMap: StepMap = {};

  funnel.chapters.forEach((chapter, chapterIndex) => {
    chapter.steps.forEach((step, stepIndex) => {
      stepMap[step.id] = {
        position: {
          chapter: chapterIndex,
          step: stepIndex,
        },
      };
    });
  });

  return stepMap;
}

function updateURLWithStepId({
  pathname,
  router,
  searchParams,
  stepId,
}: {
  pathname: string;
  router: ReturnType<typeof useRouter>;
  searchParams: URLSearchParams;
  stepId: string;
}) {
  const params = new URLSearchParams(searchParams.toString());
  params.set('stepId', stepId);
  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
    () => funnel.chapters.map((chapter) => ({ steps: chapter.steps.length })),
    [funnel],
  );

  const stepMap: StepMap = useMemo(() => getStepMap(funnel), [funnel]);

  const step: FunnelStep = useMemo(
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

      // update the position in the store
      const newPosition = stepMap[to]?.position;
      setPosition(newPosition);

      // track the navigation event
      onNavigation({ from, to, timeDuration, type });

      // Reset the timer when the step changes
      setStepTimerStart(Date.now());

      // update URL with new stepId
      updateURLWithStepId({ router, pathname, searchParams, stepId: to });
    },
    [
      onNavigation,
      pathname,
      router,
      searchParams,
      setPosition,
      step,
      stepMap,
      stepTimerStart,
    ],
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

  const skip: UseFunnelNavigationReturn['skip'] = useMemo(
    () => ({
      hasTarget: !!step?.transitions?.some(
        ({ on, destination }) =>
          on === FunnelStepTransitionType.Skip && !!destination,
      ),
    }),
    [step?.transitions],
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
