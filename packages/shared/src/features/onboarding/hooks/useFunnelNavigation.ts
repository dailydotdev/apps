import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
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
  initialStepId?: string | null;
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
  isReady: boolean;
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
  router.push(`${pathname}?${params.toString()}`, { scroll: true });
}

export const useFunnelNavigation = ({
  funnel,
  initialStepId,
  onNavigation,
}: UseFunnelNavigationProps): UseFunnelNavigationReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [stepTimerStart, setStepTimerStart] = useState<number>(0);
  const [position, setPosition] = useAtom(funnelPositionAtom);
  const [history, dispatchHistory] = useAtom(funnelPositionHistoryAtom);
  const isFirstStep = !position.step && !position.chapter;
  const isInitialized = useRef<boolean>(false);
  const urlStepId = searchParams.get('stepId');

  const chapters: Chapters = useMemo(
    () => funnel.chapters.map((chapter) => ({ steps: chapter.steps.length })),
    [funnel],
  );

  const stepMap: StepMap = useMemo(() => getStepMap(funnel), [funnel]);

  const setPositionById = useCallback(
    (stepId: FunnelStep['id']) => {
      const newPosition = stepMap[stepId]?.position;
      if (newPosition) {
        setPosition(newPosition);
      }
    },
    [setPosition, stepMap],
  );

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
      setPositionById(to);

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
      setPositionById,
      step,
      stepMap,
      stepTimerStart,
    ],
  );

  const back: HeaderNavigation = useMemo(() => {
    const hasTarget = !isFirstStep && history.canUndo;
    return {
      hasTarget,
      navigate: () => {
        if (!hasTarget) {
          return;
        }
        dispatchHistory(UNDO);
      },
    };
  }, [dispatchHistory, history.canUndo, isFirstStep]);

  const skip: UseFunnelNavigationReturn['skip'] = useMemo(
    () => ({
      hasTarget:
        !isFirstStep &&
        !!step?.transitions?.some(
          ({ on, destination }) =>
            on === FunnelStepTransitionType.Skip && !!destination,
        ),
    }),
    [isFirstStep, step?.transitions],
  );

  // On load: Update the initial position in state and URL
  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    if (initialStepId) {
      setPositionById(initialStepId);
    }

    updateURLWithStepId({
      router,
      pathname,
      searchParams,
      stepId: initialStepId || step.id,
    });

    isInitialized.current = true;
  }, [initialStepId, pathname, router, searchParams, setPositionById, step.id]);

  // After load: update the position when the URL's stepId changes
  useEffect(() => {
    if (!urlStepId || !isInitialized.current) {
      return;
    }

    setPositionById(urlStepId);
  }, [setPositionById, urlStepId]);

  return {
    back,
    chapters,
    navigate,
    position,
    skip,
    step,
    isReady: isInitialized.current,
  };
};
