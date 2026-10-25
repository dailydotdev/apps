import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useAtom } from 'jotai/react';
import type {
  FunnelJSON,
  FunnelPosition,
  FunnelStep,
  FunnelStepTransition,
  FunnelStepType,
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

type ShouldSkipRef = Partial<Record<FunnelStepType, boolean>>;

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
    Pick<FunnelStepTransition, 'placement'> {}

export interface UseFunnelNavigationReturn {
  chapters: Chapters;
  isReady: boolean;
  navigate: NavigateFunction;
  position: FunnelPosition;
  step: FunnelStep;
  back: HeaderNavigation;
  skip: SkipNavigation;
  stepMap: StepMap;
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
  // Shallow: the step lives in client state and the URL only mirrors it, so
  // there is no reason to re-run getServerSideProps (and a funnel boot) on
  // every step. A full push resolves only after that round trip, which lets
  // two pushes in a row land out of order.
  router.push(`${pathname}?${params.toString()}`, undefined, {
    shallow: true,
    scroll: true,
  });
}

function resolveDestination(params: {
  destination: string;
  chapters: Chapters;
  position: FunnelPosition;
  funnelChapters: FunnelJSON['chapters'];
}): string {
  const { destination, chapters, position, funnelChapters } = params;

  if (destination !== NEXT_STEP_ID) {
    return destination;
  }

  const chapter = chapters[position.chapter];
  const isLastItem = chapter?.steps === position.step + 1;

  if (!isLastItem) {
    return funnelChapters[position.chapter].steps[position.step + 1].id;
  }

  const isLastChapter = position.chapter === chapters.length - 1;

  return isLastChapter
    ? COMPLETED_STEP_ID
    : funnelChapters[position.chapter + 1].steps[0].id;
}

export function getNextStep(params: {
  destination: string;
  steps: FunnelStep[];
  shouldSkipMap: ShouldSkipRef;
  chapters: Chapters;
  position: FunnelPosition;
  funnelChapters: FunnelJSON['chapters'];
  stepMap: StepMap;
}): string {
  const {
    destination,
    steps,
    shouldSkipMap,
    chapters,
    position,
    funnelChapters,
    stepMap,
  } = params;
  const resolvedDestination = resolveDestination({
    destination,
    chapters,
    position,
    funnelChapters,
  });

  if (resolvedDestination === COMPLETED_STEP_ID) {
    return COMPLETED_STEP_ID;
  }

  const next = steps.find((s) => s.id === resolvedDestination);

  if (!next) {
    return resolvedDestination;
  }

  const shouldSkip = shouldSkipMap[next.type];

  if (!shouldSkip) {
    return resolvedDestination;
  }

  // step should be automatically skipped - treat as "auto-completed"
  const completeTransition = next.transitions.find(
    (t) => t.on === FunnelStepTransitionType.Complete,
  );

  if (!completeTransition) {
    return resolvedDestination;
  }

  const updatedPosition = stepMap[next.id].position;

  return getNextStep({
    destination: completeTransition.destination,
    steps,
    shouldSkipMap,
    chapters,
    position: updatedPosition,
    funnelChapters,
    stepMap,
  });
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
  // The stepId of a URL update we requested but the router has not applied
  // yet. Router updates land asynchronously, so two pushes in a row (the
  // initial URL sync, then a step that completes itself on mount, e.g. the
  // signup wall for a logged-in user) can surface the first, stale stepId
  // after the position already moved on. Without this guard that stale
  // stepId sends the funnel back a step for a frame, the onboarding flicker.
  const pendingStepIdRef = useRef<string | null>(null);
  const pushStepId = useCallback(
    (stepId: string, params: URLSearchParams) => {
      pendingStepIdRef.current =
        stepId !== searchParams.get('stepId') ? stepId : null;
      updateURLWithStepId({ router, pathname, searchParams: params, stepId });
    },
    [pathname, router, searchParams],
  );

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

  const step: FunnelStep = useMemo(() => {
    const currentStep = getFunnelStepByPosition(funnel, position);

    if (!currentStep) {
      throw new Error(
        'Failed to resolve funnel step from the current position',
      );
    }

    return currentStep;
  }, [funnel, position]);
  const navigationStateRef = useRef({ step, stepTimerStart });
  navigationStateRef.current = { step, stepTimerStart };

  const navigate: NavigateFunction = useCallback(
    ({ to, type = FunnelStepTransitionType.Complete, details }) => {
      const { step: currentStep, stepTimerStart: currentStepTimerStart } =
        navigationStateRef.current;

      if (!currentStep) {
        return;
      }

      const from = currentStep.id;
      const timeDuration = Date.now() - currentStepTimerStart;

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
      pushStepId(to, updatedSearchParams);
    },
    [onNavigation, pushStepId, searchParams, setPositionById, stepMap],
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

    return {
      hasTarget: true,
      placement: transition.placement,
    };
  }, [step?.transitions]);

  // On load: Update the initial position in state and URL
  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    if (initialStepId) {
      setPositionById(initialStepId);
    }

    pushStepId(initialStepId || step.id, searchParams);

    isInitialized.current = true;
    setIsReady(true);
  }, [
    initialStepId,
    pushStepId,
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

    if (pendingStepIdRef.current) {
      if (pendingStepIdRef.current !== urlStepId) {
        // a stale URL from an earlier push, the latest one is still on its way
        return;
      }

      pendingStepIdRef.current = null;
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
    stepMap,
    isReady,
  };
};
