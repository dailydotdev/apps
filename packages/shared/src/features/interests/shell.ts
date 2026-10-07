import classNames from 'classnames';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';

// The agent screens scroll internally, so they must stop exactly at the
// viewport. The subtractions are what sits above them in each layout.
export const useAgentShellHeight = (isStandalone?: boolean): string => {
  const { isV2 } = useLayoutVariant();

  if (isStandalone) {
    return 'h-[100dvh]';
  }

  return classNames(
    'h-[calc(100dvh-var(--shell-top,3.5rem)-var(--shell-bottom,4rem)-var(--safe-area-top,0px))] tablet:h-[calc(100dvh-3.5rem)]',
    isV2
      ? 'laptop:h-[calc(100dvh-1.75rem-2px)]'
      : 'laptop:h-[calc(100dvh-4rem)]',
  );
};
