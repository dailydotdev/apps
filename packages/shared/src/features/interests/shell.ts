import classNames from 'classnames';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';

/**
 * The height both agent screens stand in.
 *
 * They scroll internally, so they have to stop exactly at the viewport. What
 * sits above them differs per layout: the mobile footer nav plus the global
 * header in the control variant, the floating card's own margins in v2,
 * nothing at all standalone.
 */
export const useAgentShellHeight = (isStandalone?: boolean): string => {
  const { isV2 } = useLayoutVariant();

  if (isStandalone) {
    return 'h-[100dvh]';
  }

  return classNames(
    'h-[calc(100dvh-7.5rem-var(--safe-area-top))] tablet:h-[calc(100dvh-3.5rem)]',
    isV2 ? 'laptop:h-[calc(100dvh-1.75rem)]' : 'laptop:h-[calc(100dvh-4rem)]',
  );
};
