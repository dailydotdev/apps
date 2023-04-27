import React, { ReactElement } from 'react';
import { Squad } from '../../graphql/sources';
import { ChecklistCard } from './ChecklistCard';
import { InstallExtensionChecklistStep } from './InstallExtensionChecklistStep';
import { ChecklistStep } from './ChecklistStep';
import { Button } from '../buttons/Button';
import { ChecklistStepProps } from '../../lib/checklist';
import BellIcon from '../icons/Bell';
import { FlexRow } from '../utilities';

const NewSquadAndSiteMemberChecklistCard = ({
  squad,
}: {
  squad: Squad;
}): ReactElement => {
  // @Note this logic can be whatever we want, get actions from API
  // do some dynamic calculations etc.
  const steps = [
    {
      action: {
        userId: '1',
        type: 'action1',
        dateCompleted: new Date(),
      },
      title: 'Join a squad',
      description:
        'Join your first squad and start sharing posts with other members.',
    },
    {
      action: {
        userId: '1',
        type: 'action2',
        dateCompleted: null,
      },
      title: "Let people know you're here",
      description: `Welcome to the ${squad.name} squad. Start your journey by saying hi.`,
      component: (props: ChecklistStepProps) => {
        return (
          <ChecklistStep {...props}>
            <Button className="btn-primary">Say hi 👋 </Button>
          </ChecklistStep>
        );
      },
    },
    {
      action: {
        userId: '1',
        type: 'action3',
        dateCompleted: null,
      },
      title: 'Share your first post',
      description:
        'Share your first post to help other squad members discover content you found interesting.',
      component: (props: ChecklistStepProps) => {
        return (
          <ChecklistStep {...props}>
            <FlexRow className="gap-4">
              <Button className="btn-secondary">Create a post</Button>
              <Button className="btn-primary">Explore</Button>
            </FlexRow>
          </ChecklistStep>
        );
      },
    },
    {
      action: {
        userId: '1',
        type: 'action4',
        dateCompleted: null,
      },
      title: 'Download browser extension',
      description:
        'Get one personalized feed for all the knowledge you need. Make learning a daily habit or just do something useful while you’re in endless meetings.',
      component: InstallExtensionChecklistStep,
    },
    {
      action: {
        userId: '1',
        type: 'action5',
        dateCompleted: null,
      },
      title: 'Subscribe for updates',
      description: `One last thing! To get the best out of squads stay tuned about the most important activity on ${squad.name}. No spam, we promise!`,
      component: (props: ChecklistStepProps) => {
        return (
          <ChecklistStep {...props}>
            <Button icon={<BellIcon />} className="btn-primary">
              Subscribe
            </Button>
          </ChecklistStep>
        );
      },
    },
  ];

  return (
    <ChecklistCard
      className="fixed right-5 bottom-5 z-3"
      title="Squads v5"
      description="Use all of the new features"
      steps={steps}
      onRequestClose={() => {
        // hide this somehow
      }}
    />
  );
};

export { NewSquadAndSiteMemberChecklistCard };
