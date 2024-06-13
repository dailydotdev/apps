import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ChecklistCardVariant, ChecklistViewState } from '../../lib/checklist';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { useOnboardingChecklist } from '../../hooks';
import { withExperiment } from '../withExperiment';
import { feature } from '../../lib/featureManagement';
import { OnboardingChecklistOptions } from './OnboardingChecklistOptions';
import { ChecklistCard } from './ChecklistCard';
import { OnboardingChecklistDismissButton } from './OnboardingChecklistDismissButton';

const OnboardingChecklistCard = dynamic(() =>
  import(
    /* webpackChunkName: "onboardingChecklistCard" */ './OnboardingChecklistCard'
  ).then((mod) => mod.OnboardingChecklistCard),
);

export type SidebarOnboardingChecklistCardProps = {
  className?: string;
};

const SidebarOnboardingChecklistCardComponent = ({
  className,
}: SidebarOnboardingChecklistCardProps): ReactElement => {
  const { checklistView, setChecklistView, isDone } = useOnboardingChecklist();

  if (checklistView === ChecklistViewState.Hidden) {
    return null;
  }

  const isOpen = checklistView === ChecklistViewState.Open;

  if (isDone) {
    return (
      <div className="m-2">
        <ChecklistCard
          className="!h-auto w-full !border-0 text-center"
          title="Get started like a pro"
          content={
            <>
              <p
                className={classNames(
                  'mb-2 text-center font-bold text-white typo-footnote',
                )}
              >
                Perfectly done!
              </p>
              <OnboardingChecklistDismissButton />
            </>
          }
          steps={[]}
          variant={ChecklistCardVariant.Small}
          isOpen={false}
        />
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
          {isOpen && <OnboardingChecklistOptions />}
          <Button
            icon={
              <ArrowIcon
                className={classNames('text-white', isOpen && 'rotate-180')}
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

export const SidebarOnboardingChecklistCard = withExperiment(
  SidebarOnboardingChecklistCardComponent,
  {
    feature: feature.onboardingChecklist,
    value: true,
  },
);
