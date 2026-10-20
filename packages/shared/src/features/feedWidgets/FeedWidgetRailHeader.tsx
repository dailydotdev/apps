import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { ArrowIcon } from '../../components/icons/Arrow';
import { EditIcon } from '../../components/icons/Edit';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIsHydrated } from '../../hooks/useIsHydrated';
import { railGreeting } from './greeting';
import { railHeaderClassName } from './FeedWidgetRailFrame';

/**
 * The rail's header: a greeting earns the row the controls already need, so
 * Customize sits beside the title like Edit beside a list title and the
 * arrows take the Squad directory's tertiary buttons. In edit mode the date
 * line becomes the instructions.
 */
export const FeedWidgetRailHeader = ({
  isEditing,
  showArrows,
  edges,
  onScroll,
  onToggleEditing,
}: {
  isEditing: boolean;
  showArrows: boolean;
  edges: { start: boolean; end: boolean };
  onScroll: (direction: 1 | -1) => void;
  onToggleEditing: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  // The clock and the name are the reader's, so the row fills in after
  // hydration rather than painting the server's hour.
  const isHydrated = useIsHydrated();
  const greeting = useMemo(
    () => (isHydrated ? railGreeting(new Date(), user?.name) : null),
    [isHydrated, user?.name],
  );

  return (
    <div className={railHeaderClassName}>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold text-text-primary typo-title3">
          {greeting?.title}
        </span>
        <span className="truncate text-text-tertiary typo-footnote">
          {isEditing
            ? 'Drag to reorder, drag a corner to resize, or use each widget’s menu. The ad slot stays put. Esc when done.'
            : greeting?.subtitle}
        </span>
      </div>
      {showArrows && (
        <div className="flex items-center gap-1">
          {(['start', 'end'] as const).map((side) => (
            <Button
              key={side}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={
                <ArrowIcon
                  className={side === 'start' ? '-rotate-90' : 'rotate-90'}
                />
              }
              aria-label={
                side === 'start'
                  ? 'Scroll widgets left'
                  : 'Scroll widgets right'
              }
              disabled={!edges[side]}
              onClick={() => onScroll(side === 'start' ? -1 : 1)}
            />
          ))}
        </div>
      )}
      <Button
        variant={isEditing ? ButtonVariant.Primary : ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={isEditing ? undefined : <EditIcon />}
        aria-pressed={isEditing}
        onClick={onToggleEditing}
      >
        {isEditing ? 'Done' : 'Customize'}
      </Button>
    </div>
  );
};
