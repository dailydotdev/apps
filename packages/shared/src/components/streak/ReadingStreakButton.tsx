import React, { ReactElement, useCallback, useState } from 'react';
import classnames from 'classnames';
import { ReadingStreakPopup } from './popup';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { ReadingStreakIcon } from '../icons';
import { SimpleTooltip } from '../tooltips';
import { UserStreak } from '../../graphql/users';
import { useViewSize, ViewSize } from '../../hooks';
import { isTesting } from '../../lib/constants';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';
import { RootPortal } from '../tooltips/Portal';
import { Drawer } from '../drawers';
import ConditionalWrapper from '../ConditionalWrapper';

interface ReadingStreakButtonProps {
  streak: UserStreak;
  isLoading: boolean;
  compact?: boolean;
  iconPosition?: ButtonIconPosition;
}

interface CustomStreaksTooltipProps {
  streak: UserStreak;
  children?: ReactElement;
  shouldShowStreaks?: boolean;
  setShouldShowStreaks?: (value: boolean) => void;
}

function CustomStreaksTooltip({
  streak,
  children,
  shouldShowStreaks,
  setShouldShowStreaks,
}: CustomStreaksTooltipProps): ReactElement {
  return (
    <SimpleTooltip
      interactive
      showArrow={false}
      visible={shouldShowStreaks}
      forceLoad={!isTesting}
      container={{
        paddingClassName: 'p-4',
        bgClassName: 'bg-accent-pepper-subtlest',
        textClassName: 'text-text-primary typo-callout',
        className: 'border border-border-subtlest-tertiary',
      }}
      content={<ReadingStreakPopup streak={streak} />}
      onClickOutside={() => setShouldShowStreaks(false)}
    >
      {children}
    </SimpleTooltip>
  );
}

export function ReadingStreakButton({
  streak,
  isLoading,
  compact,
  iconPosition,
}: ReadingStreakButtonProps): ReactElement {
  const { trackEvent } = useAnalyticsContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [shouldShowStreaks, setShouldShowStreaks] = useState(false);
  const hasReadToday =
    new Date(streak?.lastViewAt).getDate() === new Date().getDate();

  const handleToggle = useCallback(() => {
    setShouldShowStreaks((state) => !state);

    if (!shouldShowStreaks) {
      trackEvent({
        event_name: AnalyticsEvent.OpenStreaks,
      });
    }
  }, [shouldShowStreaks, trackEvent]);

  const Tooltip = shouldShowStreaks ? CustomStreaksTooltip : SimpleTooltip;

  if (isLoading) {
    return (
      <div className="h-8 w-14 rounded-12 bg-surface-float laptop:h-10 laptop:w-20" />
    );
  }

  if (!streak) {
    return null;
  }

  return (
    <>
      <ConditionalWrapper
        condition={!isMobile}
        wrapper={(children: ReactElement) => (
          <Tooltip
            content="Current streak"
            streak={streak}
            shouldShowStreaks={shouldShowStreaks}
            setShouldShowStreaks={setShouldShowStreaks}
          >
            {children}
          </Tooltip>
        )}
      >
        <Button
          type="button"
          iconPosition={iconPosition}
          icon={<ReadingStreakIcon secondary={hasReadToday} />}
          variant={isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float}
          onClick={handleToggle}
          className={classnames(
            'gap-1',
            compact && 'text-accent-bacon-default',
          )}
          size={
            (isLaptop || !compact) && !isMobile
              ? ButtonSize.Medium
              : ButtonSize.Small
          }
        >
          {streak?.current}
          {!compact && ' reading days'}
        </Button>
      </ConditionalWrapper>

      {isMobile && (
        <RootPortal>
          <Drawer
            displayCloseButton
            isOpen={shouldShowStreaks}
            onClose={handleToggle}
          >
            <ReadingStreakPopup streak={streak} fullWidth />
          </Drawer>
        </RootPortal>
      )}
    </>
  );
}
