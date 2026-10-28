import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { ArrowIcon } from '../../components/icons/Arrow';
import { PlusIcon } from '../../components/icons/Plus';
import { SettingsIcon } from '../../components/icons/Settings';
import { IntroQuestButton } from '../../components/filters/IntroQuestButton';
import { UpgradeToPlus } from '../../components/UpgradeToPlus';
import { CreatePostButton } from '../../components/post/write/CreatePostButton';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIsHydrated } from '../../hooks/useIsHydrated';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { TargetId } from '../../lib/log';
import { railGreeting } from './greeting';
import { railHeaderClassName } from './FeedWidgetRailFrame';

const Divider = (): ReactElement => (
  <span aria-hidden className="mx-1 h-6 w-px bg-border-subtlest-tertiary" />
);

/**
 * The page's own actions, which the rail's header gives a place on the home
 * page. New post is the one filled button; the rest are Tertiary Small.
 */
const RailPageActions = (): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isLaptopXL = useViewSize(ViewSize.LaptopXL);
  const isTablet = !isLaptop;

  return (
    <span className="flex items-center gap-2">
      <IntroQuestButton
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        showLabel={isLaptopXL}
        attentionDot
      />
      <UpgradeToPlus
        target={TargetId.FeedWidgets}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        iconClassName="text-accent-bacon-default"
        label="Get Plus"
        iconOnly={isTablet}
        className="!flex-none"
      />
      <CreatePostButton compact={isTablet} showIcon size={ButtonSize.Small} />
      <Divider />
    </span>
  );
};

/**
 * The rail's header: a greeting earns the row, the page's actions sit on its
 * right, then the rail's own controls: the Customize gear and the arrows at
 * the far right, the Squad directory's tertiary buttons. Edit mode is a
 * mode: the page's actions step aside, the date line becomes the
 * instructions, and Hide widgets, New widget and Done take the gear's place.
 * It renders inside the rail, so a press on Done is never a press outside it.
 */
export const FeedWidgetRailHeader = ({
  isEditing,
  isPhone = false,
  showArrows,
  edges,
  onScroll,
  onToggleEditing,
  onAdd,
  onHide,
  canCustomize = true,
}: {
  isEditing: boolean;
  isPhone?: boolean;
  showArrows: boolean;
  edges: { start: boolean; end: boolean };
  onScroll: (direction: 1 | -1) => void;
  onToggleEditing: () => void;
  /** Absent on a rail this build cannot write. */
  onAdd?: () => void;
  onHide: () => void;
  canCustomize?: boolean;
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
        <span
          className={classNames(
            'truncate font-bold text-text-primary',
            isPhone ? 'typo-body' : 'typo-title3',
          )}
        >
          {greeting?.title}
        </span>
        <span className="truncate text-text-tertiary typo-footnote">
          {isEditing
            ? 'Drag to move, or drag a corner to resize'
            : greeting?.subtitle}
        </span>
      </div>
      {/* Phones have these in the shell's top row. */}
      {!isPhone && !isEditing && <RailPageActions />}
      {canCustomize && isEditing && (
        <>
          {!isPhone && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              onClick={onHide}
            >
              Hide widgets
            </Button>
          )}
          {onAdd && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={onAdd}
            >
              New widget
            </Button>
          )}
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            aria-pressed
            onClick={onToggleEditing}
          >
            Done
          </Button>
          {showArrows && <Divider />}
        </>
      )}
      {canCustomize && !isEditing && (
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<SettingsIcon />}
          aria-label="Customize widgets"
          title="Customize widgets"
          aria-pressed={false}
          onClick={onToggleEditing}
        />
      )}
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
    </div>
  );
};
