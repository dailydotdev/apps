import React, { ReactElement } from 'react';
import { ChecklistStepPropsWithSquad } from '../../lib/checklist';
import { Button, ButtonVariant } from '../buttons/Button';
import { ChecklistStep } from './ChecklistStep';
import { TourIcon } from '../icons';
import { anchorDefaultRel } from '../../lib/strings';
import { SquadPostsProgressBar } from '../squads/SquadPostsProgressBar';
import { squadsPublicGuide } from '../../lib/constants';

export const GoPublicStep = ({
  squad,
  ...props
}: ChecklistStepPropsWithSquad): ReactElement => {
  const postsCount = (squad?.flags?.totalPosts ?? 0) - 1; // -1 for the welcome post

  return (
    <ChecklistStep {...props}>
      <div className="flex flex-col items-stretch gap-4">
        <SquadPostsProgressBar
          postsCount={postsCount}
          className={{
            progressBackground: 'bg-border-subtlest-tertiary',
            progressBar: '!bg-border-subtlest-primary',
            label: 'typo-caption2',
            labelHeader: 'text-text-primary',
            labelContent: 'font-normal',
            container: 'flex-col-reverse gap-2',
          }}
        />
        <Button
          tag="a"
          href={squadsPublicGuide}
          target="_blank"
          rel={anchorDefaultRel}
          variant={ButtonVariant.Primary}
          icon={<TourIcon />}
          className="self-start"
        >
          Details
        </Button>
      </div>
    </ChecklistStep>
  );
};
