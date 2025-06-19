import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import classNames from 'classnames';
import AlertPointer, {
  AlertPlacement,
} from '@dailydotdev/shared/src/components/alert/AlertPointer';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { companionAlertMessage } from './common';

interface CompanionToggleProps {
  companionState: boolean;
  isAlertDisabled: boolean;
  onToggleCompanion: () => void;
  tooltipContainerClassName?: string;
}

function CompanionToggle({
  companionState,
  isAlertDisabled,
  tooltipContainerClassName,
  onToggleCompanion,
}: CompanionToggleProps): ReactElement {
  return (
    <AlertPointer
      offset={[-4]}
      className={{ message: 'bg-background-default' }}
      isAlertDisabled={isAlertDisabled}
      placement={AlertPlacement.Left}
      message={companionAlertMessage}
    >
      <Tooltip
        side="left"
        content={companionState ? 'Close summary' : 'Open summary'}
        className={tooltipContainerClassName}
      >
        <Button
          variant={
            companionState ? ButtonVariant.Secondary : ButtonVariant.Tertiary
          }
          className={classNames({
            'group-hover:btn-secondary': !companionState,
          })}
          icon={
            <>
              <LogoIcon
                className={{
                  container: classNames(
                    'w-6',
                    companionState ? 'hidden' : 'group-hover:hidden',
                  ),
                }}
              />
              <ArrowIcon
                className={classNames(
                  'icon ',
                  companionState
                    ? 'block rotate-90'
                    : 'hidden -rotate-90 group-hover:block',
                )}
              />
            </>
          }
          onClick={onToggleCompanion}
        />
      </Tooltip>
    </AlertPointer>
  );
}

export default CompanionToggle;
