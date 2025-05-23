import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAtom } from 'jotai/react';
import type {
  FunnelJSON,
  FunnelPosition,
  FunnelStep,
  FunnelStepTransition,
} from '../types/funnel';
import {
  COMPLETED_STEP_ID,
  FunnelStepTransitionType,
  NEXT_STEP_ID,
} from '../types/funnel';
import type { TrackOnNavigate } from './useFunnelTracking';
import {
  funnelPositionAtom,
  getFunnelStepByPosition,
} from '../store/funnel.store';
import { useToggle } from '../../../hooks/useToggle';

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
  details?: Record<string, unknown>;
}) => void;

interface HeaderNavigation {
  hasTarget: boolean;
  navigate: () => void;
}

interface SkipNavigation
  extends Omit<HeaderNavigation, 'navigate'>,
    Pick<FunnelStepTransition, 'placement'> {
  destination?: FunnelStep['id'];
}

export interface UseFunnelNavigationReturn {
  chapters: Chapters;
  isReady: boolean;
  navigate: NavigateFunction;
  position: FunnelPosition;
  step: FunnelStep;
  back: HeaderNavigation;
  skip: SkipNavigation;
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
  const isFirstStep = !position.step && !position.chapter;
  const isInitialized = useRef<boolean>(false);
  const [isReady, setIsReady] = useToggle(false);
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
    ({ to, type = FunnelStepTransitionType.Complete, details }) => {
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

      const updatedSearchParams = new URLSearchParams(searchParams.toString());

      if (details?.subscribed) {
        updatedSearchParams.set('subscribed', details?.subscribed as string);
      }

      // update URL with new stepId
      updateURLWithStepId({
        router,
        pathname,
        searchParams: updatedSearchParams,
        stepId: to,
      });
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
    const hasTarget = !isFirstStep;

    return {
      hasTarget,
      navigate: () => {
        if (!hasTarget) {
          return;
        }
        router.back();
      },
    };
  }, [isFirstStep, router]);

  const skip: UseFunnelNavigationReturn['skip'] = useMemo(() => {
    const transition = step?.transitions?.find(
      ({ on }) => on === FunnelStepTransitionType.Skip,
    );

    if (!transition?.destination) {
      return { hasTarget: false };
    }

    const isNextStep = transition.destination === NEXT_STEP_ID;
    const isLastStep = transition.destination === COMPLETED_STEP_ID;

    if (!isNextStep || isLastStep) {
      return {
        destination: transition.destination,
        placement: transition.placement,
        hasTarget: true,
      };
    }

    const chapter = chapters[position.chapter];
    const isLastItem = chapter?.steps === position.step + 1;

    if (!isLastItem) {
      const nextStep =
        funnel.chapters[position.chapter].steps[position.step + 1];

      return {
        placement: transition.placement,
        destination: nextStep.id,
        hasTarget: true,
      };
    }

    const isLastChapter = position.chapter === chapters.length - 1;

    if (isLastChapter) {
      return {
        placement: transition.placement,
        destination: COMPLETED_STEP_ID,
        hasTarget: true,
      };
    }

    const nextChapter = funnel.chapters[position.chapter + 1];
    const nextStep = nextChapter.steps[0];

    return {
      placement: transition.placement,
      destination: nextStep.id,
      hasTarget: true,
    };
  }, [
    step?.transitions,
    chapters,
    position.chapter,
    position.step,
    funnel.chapters,
  ]);

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
    setIsReady(true);
  }, [
    initialStepId,
    pathname,
    router,
    searchParams,
    setPositionById,
    step.id,
    setIsReady,
  ]);

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
    isReady,
  };
};
