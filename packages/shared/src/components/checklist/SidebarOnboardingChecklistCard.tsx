import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ChecklistCardVariant, ChecklistViewState } from '../../lib/checklist';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon, EyeCancelIcon, MenuIcon } from '../icons';
import ContextMenu from '../fields/ContextMenu';
import { ContextMenu as ContextMenuIds } from '../../hooks/constants';
import useContextMenu from '../../hooks/useContextMenu';
import { useOnboardingChecklist } from '../../hooks';
import { RankConfetti } from '../../svg/RankConfetti';

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
  const { checklistView, setChecklistView, isDone } = useOnboardingChecklist();
  const { onMenuClick: showOptionsMenu, isOpen: isOptionsOpen } =
    useContextMenu({
      id: ContextMenuIds.SidebarOnboardingChecklistCard,
    });

  if (checklistView === ChecklistViewState.Hidden) {
    return null;
  }

  const isOpen = checklistView === ChecklistViewState.Open;

  if (isDone) {
    return (
      <div
        className={classNames(
          'relative m-2 mt-0 flex flex-col items-center gap-2 overflow-hidden rounded-8 bg-gradient-to-t from-raw-cabbage-90 to-raw-cabbage-50 p-2',
        )}
      >
        <RankConfetti className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 opacity-40" />
        <p
          className={classNames(
            'mb-1 text-center font-bold text-white typo-footnote',
          )}
        >
          Get started like a pro
          <br />
          Perfectly done!
        </p>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.XSmall}
          onClick={() => {
            setChecklistView(ChecklistViewState.Hidden);
          }}
        >
          Dismiss
        </Button>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        className,
        'bottom-0 left-0 z-popup !h-auto px-2 pb-2',
        isOpen && 'sticky',
      )}
    >
      <div className="relative">
        <OnboardingChecklistCard
          isOpen={isOpen}
          variant={ChecklistCardVariant.Small}
        />
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
