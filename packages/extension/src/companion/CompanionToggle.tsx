import React, { ReactElement } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import ArrowIcon from '@dailydotdev/shared/src/components/icons/Arrow';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import classNames from 'classnames';
import { BaseTooltipContainerProps } from '@dailydotdev/shared/src/components/tooltips/BaseTooltipContainer';
import AlertPointer, {
  AlertPlacement,
} from '@dailydotdev/shared/src/components/alert/AlertPointer';
import { companionAlertMessage } from './common';

interface CompanionToggleProps {
  companionState: boolean;
  isAlertDisabled: boolean;
  onToggleCompanion: () => void;
  tooltipContainerProps?: Omit<
    BaseTooltipContainerProps,
    'placement' | 'children'
  >;
}

function CompanionToggle({
  companionState,
  isAlertDisabled,
  tooltipContainerProps,
  onToggleCompanion,
}: CompanionToggleProps): ReactElement {
  return (
    <AlertPointer
      offset={[-4]}
      className={{ message: 'bg-theme-bg-primary' }}
      isAlertDisabled={isAlertDisabled}
      placement={AlertPlacement.Left}
      message={companionAlertMessage}
    >
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
    </AlertPointer>
  );
}

export default CompanionToggle;
