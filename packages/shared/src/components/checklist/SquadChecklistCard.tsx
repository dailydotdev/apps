import React, { ReactElement, useMemo } from 'react';
import { SourceMemberRole, Squad } from '../../graphql/sources';
import { ChecklistCard } from './ChecklistCard';
import { InstallExtensionChecklistStep } from './InstallExtensionChecklistStep';
import {
  ActionType,
  ChecklistStepType,
  actionsPerRoleMap,
} from '../../lib/checklist';
import { SquadWelcomeChecklistStep } from './SquadWelcomeChecklistStep';
import { SharePostChecklistStep } from './SharePostChecklistStep';
import { NotificationChecklistStep } from './NotificationChecklistStep';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const stepsMap = useMemo<
    Partial<Record<ActionType, ChecklistStepType>>
  >(() => {
    return {
      [ActionType.CreateSquad]: {
        action: {
          userId: '1',
          type: ActionType.CreateSquad,
          dateCompleted: new Date(),
        },
        title: 'Create a squad',
        description:
          'Create your first squad and start sharing posts with other members.',
      },
      [ActionType.JoinSquad]: {
        action: {
          userId: '1',
          type: ActionType.JoinSquad,
          dateCompleted: new Date(),
        },
        title: 'Join a squad',
        description:
          'Join your first squad and start sharing posts with other members.',
      },
      [ActionType.EditWelcomePost]: {
        action: {
          userId: '1',
          type: ActionType.EditWelcomePost,
          dateCompleted: null,
        },
        title: 'Customize the welcome post',
        description: `The welcome post is where your new squad members will start their journey. You can welcome them and explain the behavior and rules that are expected.`,
      },
      [ActionType.CommentOnWelcomePost]: {
        action: {
          userId: '1',
          type: ActionType.CommentOnWelcomePost,
          dateCompleted: null,
        },
        title: "Let people know you're here",
        description: `Welcome to the ${squad.name} squad. Start your journey by saying hi.`,
        component: SquadWelcomeChecklistStep,
      },
      [ActionType.SharePost]: {
        action: {
          userId: '1',
          type: ActionType.SharePost,
          dateCompleted: null,
        },
        title: 'Share your first post',
        description:
          'Share your first post to help other squad members discover content you found interesting.',
        component: SharePostChecklistStep,
      },
      [ActionType.InviteMember]: {
        action: {
          userId: '1',
          type: ActionType.InviteMember,
          dateCompleted: null,
        },
        title: 'Invite a member',
        description:
          'Invite a member to your squad and start sharing posts with them.',
      },
      [ActionType.InstallExtension]: {
        action: {
          userId: '1',
          type: ActionType.InstallExtension,
          dateCompleted: null,
        },
        title: 'Download browser extension',
        description:
          'Get one personalized feed for all the knowledge you need. Make learning a daily habit or just do something useful while you’re in endless meetings.',
        component: InstallExtensionChecklistStep,
      },
      [ActionType.Notification]: {
        action: {
          userId: '1',
          type: ActionType.Notification,
          dateCompleted: null,
        },
        title: 'Subscribe for updates',
        description: `One last thing! To get the best out of squads stay tuned about the most important activity on ${squad.name}. No spam, we promise!`,
        component: NotificationChecklistStep,
      },
    };
  }, [squad]);

  const steps = useMemo(() => {
    const actions =
      actionsPerRoleMap[squad.currentMember.role] ||
      actionsPerRoleMap[SourceMemberRole.Member];

    return actions
      .map((actionType) => {
        return stepsMap[actionType];
      })
      .filter(Boolean);
  }, [squad.currentMember]);

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

export { SquadChecklistCard };
