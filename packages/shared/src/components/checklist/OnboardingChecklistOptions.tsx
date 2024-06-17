import React, { MouseEvent, ReactElement } from 'react';
import classNames from 'classnames';
import { ChecklistViewState } from '../../lib/checklist';
import { Button } from '../buttons/Button';
import { ButtonVariant, ButtonSize } from '../buttons/common';
import ContextMenu from '../fields/ContextMenu';
import { MenuIcon, EyeCancelIcon } from '../icons';
import useContextMenu from '../../hooks/useContextMenu';
import { ContextMenu as ContextMenuIds } from '../../hooks/constants';
import { useOnboardingChecklist } from '../../hooks';

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
