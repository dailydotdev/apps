import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ChecklistViewState } from '../../lib/checklist';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon, EyeCancelIcon, MenuIcon } from '../icons';
import ContextMenu from '../fields/ContextMenu';
import { ContextMenu as ContextMenuIds } from '../../hooks/constants';
import useContextMenu from '../../hooks/useContextMenu';
import { useOnboardingChecklist } from '../../hooks';

const OnboardingChecklistCard = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingChecklistCard" */ './OnboardingChecklistCard'
  ).then((mod) => mod.OnboardingChecklistCard),
);

export type SidebarOnboardingChecklistCardProps = {
  className?: string;
};

export const SidebarOnboardingChecklistCard = ({
  className,
}: SidebarOnboardingChecklistCardProps): ReactElement => {
  const { checklistView, setChecklistView } = useOnboardingChecklist();
  const { onMenuClick: showOptionsMenu, isOpen: isOptionsOpen } =
    useContextMenu({
      id: ContextMenuIds.SidebarOnboardingChecklistCard,
    });

  if (checklistView === ChecklistViewState.Hidden) {
    return null;
  }

  const isOpen = checklistView === ChecklistViewState.Open;

  return (
    <div
      className={classNames(
        className,
        'bottom-0 left-0 z-popup !h-auto px-2 pb-2',
        isOpen && 'sticky',
      )}
    >
      <div className="relative">
        <OnboardingChecklistCard isOpen={isOpen} />
        <div className="absolute right-2 top-2 flex">
          {isOpen && (
            <>
              <Button
                icon={<MenuIcon className="text-text-primary" />}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                onClick={showOptionsMenu}
              />
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
          )}
          <Button
            icon={
              <ArrowIcon
                className={classNames(
                  'text-text-primary',
                  isOpen && 'rotate-180',
                )}
              />
            }
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            onClick={() => {
              setChecklistView(
                isOpen ? ChecklistViewState.Closed : ChecklistViewState.Open,
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};
