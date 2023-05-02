import React, { ReactElement, useMemo } from 'react';
import { SourceMemberRole, Squad } from '../../graphql/sources';
import { ChecklistCard } from './ChecklistCard';
import { InstallExtensionChecklistStep } from './InstallExtensionChecklistStep';
import {
  ChecklistStepType,
  actionsPerRoleMap,
  createChecklistStep,
} from '../../lib/checklist';
import { SquadWelcomeChecklistStep } from './SquadWelcomeChecklistStep';
import { SharePostChecklistStep } from './SharePostChecklistStep';
import { NotificationChecklistStep } from './NotificationChecklistStep';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks/useActions';

const SquadChecklistCard = ({ squad }: { squad: Squad }): ReactElement => {
  const { actions } = useActions();

  const stepsMap = useMemo<
    Partial<Record<ActionType, ChecklistStepType>>
  >(() => {
    return {
      [ActionType.CreateSquad]: createChecklistStep({
        type: ActionType.CreateSquad,
        step: {
          title: 'Create a squad',
          description:
            'Create your first squad and start sharing posts with other members.',
        },
        actions,
      }),
      [ActionType.JoinSquad]: createChecklistStep({
        type: ActionType.JoinSquad,
        step: {
          title: 'Join a squad',
          description:
            'Join your first squad and start sharing posts with other members.',
        },
        actions,
      }),
      [ActionType.EditWelcomePost]: createChecklistStep({
        type: ActionType.EditWelcomePost,
        step: {
          title: 'Customize the welcome post',
          description: `The welcome post is where your new squad members will start their journey. You can welcome them and explain the behavior and rules that are expected.`,
        },
        actions,
      }),
      [ActionType.CommentOnWelcomePost]: createChecklistStep({
        type: ActionType.CommentOnWelcomePost,
        step: {
          title: "Let people know you're here",
          description: `Welcome to the ${squad.name} squad. Start your journey by saying hi.`,
          component: SquadWelcomeChecklistStep,
        },
        actions,
      }),
      [ActionType.SharePost]: createChecklistStep({
        type: ActionType.SharePost,
        step: {
          title: 'Share your first post',
          description:
            'Share your first post to help other squad members discover content you found interesting.',
          component: SharePostChecklistStep,
        },
        actions,
      }),
      [ActionType.InviteMember]: createChecklistStep({
        type: ActionType.InviteMember,
        step: {
          title: 'Invite a member',
          description:
            'Invite a member to your squad and start sharing posts with them.',
        },
        actions,
      }),
      [ActionType.InstallExtension]: createChecklistStep({
        type: ActionType.InstallExtension,
        step: {
          title: 'Download browser extension',
          description:
            'Get one personalized feed for all the knowledge you need. Make learning a daily habit or just do something useful while you’re in endless meetings.',
          component: InstallExtensionChecklistStep,
        },
        actions,
      }),
      [ActionType.Notification]: createChecklistStep({
        type: ActionType.Notification,
        step: {
          title: 'Subscribe for updates',
          description: `One last thing! To get the best out of squads stay tuned about the most important activity on ${squad.name}. No spam, we promise!`,
          component: NotificationChecklistStep,
        },
        actions,
      }),
    };
  }, [squad]);

  const steps = useMemo(() => {
    const actionsForRole =
      actionsPerRoleMap[squad.currentMember.role] ||
      actionsPerRoleMap[SourceMemberRole.Member];

    return actionsForRole
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
