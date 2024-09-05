import classNames from 'classnames';
import React, { MouseEvent, ReactElement } from 'react';

import { useOnboardingChecklist } from '../../hooks';
import { ContextMenu as ContextMenuIds } from '../../hooks/constants';
import useContextMenu from '../../hooks/useContextMenu';
import { ChecklistViewState } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import ContextMenu from '../fields/ContextMenu';
import { EyeCancelIcon, MenuIcon } from '../icons';

export type OnboardingChecklistOptionsProps = {
  className?: string;
};

export const OnboardingChecklistOptions = ({
  className,
}: OnboardingChecklistOptionsProps): ReactElement => {
  const { setChecklistView } = useOnboardingChecklist();

  const { onMenuClick: showOptionsMenu, isOpen: isOptionsOpen } =
    useContextMenu({
      id: ContextMenuIds.SidebarOnboardingChecklistCard,
    });

  return (
    <>
      <div className={classNames(className, 'flex')}>
        <Button
          icon={<MenuIcon className="text-white" />}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={(event: MouseEvent) => {
            event.stopPropagation();

            showOptionsMenu(event);
          }}
        />
      </div>
      <ContextMenu
        id={ContextMenuIds.SidebarOnboardingChecklistCard}
        className="menu-primary typo-callout"
        animation="fade"
        options={[
          {
            icon: <EyeCancelIcon />,
            label: 'Hide forever',
            action: () => {
              setChecklistView(ChecklistViewState.Hidden);
            },
          },
        ]}
        isOpen={isOptionsOpen}
      />
    </>
  );
};
