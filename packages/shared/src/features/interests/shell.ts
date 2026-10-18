import classNames from 'classnames';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
import { useBanner } from '../../hooks/useBanner';

// The agent screens scroll internally, so they must stop exactly at the
// viewport. The subtractions are what sits above them in each layout.
// A phone page without the bottom bar only clears the home indicator. On
// laptop the promotional banner is fixed at 2rem and the layout pads the page
// by as much, so the screen gives that back too.
export const useAgentShellHeight = (
  isStandalone?: boolean,
  hasBottomBar = true,
): string => {
  const { isV2 } = useLayoutVariant();
  const { isAvailable: hasBanner } = useBanner();

  if (isStandalone) {
    return 'h-[100dvh]';
  }

  return classNames(
    hasBottomBar
      ? 'h-[calc(100dvh-var(--shell-top,3.5rem)-var(--shell-bottom,4rem)-var(--safe-area-top,0px))]'
      : 'h-[calc(100dvh-var(--shell-top,3.5rem)-env(safe-area-inset-bottom,0px)-var(--safe-area-top,0px))]',
    'tablet:h-[calc(100dvh-3.5rem)]',
    isV2 && !hasBanner && 'laptop:h-[calc(100dvh-1.75rem-2px)]',
    isV2 && hasBanner && 'laptop:h-[calc(100dvh-3.75rem-2px)]',
    !isV2 && !hasBanner && 'laptop:h-[calc(100dvh-4rem)]',
    !isV2 && hasBanner && 'laptop:h-[calc(100dvh-6rem)]',
  );
};
