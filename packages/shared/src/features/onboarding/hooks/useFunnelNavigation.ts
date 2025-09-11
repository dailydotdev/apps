import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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
    Pick<FunnelStepTransition, 'placement'> {
  // Removed destination - navigation logic is handled by onTransition
}

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
  router.push(`${pathname}?${params.toString()}`, { scroll: true });
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

  const updatedPosition = stepMap[next.id]?.position;

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
    stepMap,
    isReady,
  };
};
