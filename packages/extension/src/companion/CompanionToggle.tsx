import React, { ReactElement } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import ArrowIcon from '@dailydotdev/shared/src/components/icons/Arrow';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import classNames from 'classnames';
import { BaseTooltipContainerProps } from '@dailydotdev/shared/src/components/tooltips/BaseTooltipContainer';

interface CompanionToggleProps {
  companionState: boolean;
  onToggleCompanion: () => void;
  tooltipContainerProps?: Omit<
    BaseTooltipContainerProps,
    'placement' | 'children'
  >;
}

function CompanionToggle({
  companionState,
  tooltipContainerProps,
  onToggleCompanion,
}: CompanionToggleProps): ReactElement {
  return (
    <SimpleTooltip
      placement="left"
      content={companionState ? 'Close summary' : 'Open summary'}
      appendTo="parent"
      container={tooltipContainerProps}
    >
      <Button
        buttonSize="medium"
        className={classNames(
          companionState
            ? 'btn-secondary'
            : 'btn-tertiary group-hover:btn-secondary',
        )}
        icon={
          <>
            <LogoIcon
              className={classNames(
                'w-6',
                companionState ? 'hidden' : 'group-hover:hidden',
              )}
            />
            <ArrowIcon
              className={classNames(
                'icon ',
                companionState
                  ? 'block rotate-90'
                  : 'hidden group-hover:block -rotate-90',
              )}
            />
          </>
        }
        onClick={onToggleCompanion}
      />
    </SimpleTooltip>
  );
}

export default CompanionToggle;
