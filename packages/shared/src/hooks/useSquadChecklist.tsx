import React, { useContext, useMemo } from 'react';
import { InstallExtensionChecklistStep } from '../components/checklist/InstallExtensionChecklistStep';
import { NotificationChecklistStep } from '../components/checklist/NotificationChecklistStep';
import { SharePostChecklistStep } from '../components/checklist/SharePostChecklistStep';
import { SquadFirstCommentChecklistStep } from '../components/checklist/SquadFirstCommentChecklistStep';
import { ActionType } from '../graphql/actions';
import { SourceMemberRole, SourcePermissions, Squad } from '../graphql/sources';
import {
  ChecklistStepType,
  createChecklistStep,
  actionsPerRoleMap,
  SQUAD_CHECKLIST_VISIBLE_KEY,
} from '../lib/checklist';
import { useActions } from './useActions';
import { UseChecklist, useChecklist } from './useChecklist';
import usePersistentContext from './usePersistentContext';
import { InviteMemberChecklistStep } from '../components/checklist/InviteMemberChecklistStep';
import { verifyPermission } from '../graphql/squads';
import OnboardingContext from '../contexts/OnboardingContext';
import { SquadEditWelcomePostChecklistStep } from '../components/checklist/SquadEditWelcomePostChecklistStep';
import { useNotificationContext } from '../contexts/NotificationsContext';

type UseSquadChecklistProps = {
  squad: Squad;
};

type UseSquadChecklist = UseChecklist & {
  isChecklistVisible: boolean;
  setChecklistVisible: (value: boolean) => void;
  isChecklistReady: boolean;
};

const useSquadChecklist = ({
  squad,
}: UseSquadChecklistProps): UseSquadChecklist => {
  const { actions, isActionsFetched: isChecklistReady } = useActions();
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const {
    push: { isInitialized, isPushSupported },
  } = useNotificationContext();

  const stepsMap = useMemo<
    Partial<Record<ActionType, ChecklistStepType>>
  >(() => {
    if (!isChecklistReady || !isInitialized) {
      return {};
    }

    const step = {
      [ActionType.CreateSquad]: createChecklistStep({
        type: ActionType.CreateSquad,
        step: {
          title: 'Create a Squad',
          description:
            'Create your first Squad and start sharing posts with other members.',
        },
        actions,
      }),
      [ActionType.JoinSquad]: createChecklistStep({
        type: ActionType.JoinSquad,
        step: {
          title: 'Join a Squad',
          description:
            'Join your first Squad and start sharing posts with other members.',
        },
        actions,
      }),
      [ActionType.EditWelcomePost]: createChecklistStep({
        type: ActionType.EditWelcomePost,
        step: {
          title: 'Customize the welcome post',
          description: `The welcome post is where your new Squad members will start their journey. You can welcome them and explain the behavior and rules that are expected.`,
          component: (props) => (
            <SquadEditWelcomePostChecklistStep {...props} squad={squad} />
          ),
        },
        actions,
      }),
      [ActionType.SquadFirstComment]: createChecklistStep({
        type: ActionType.SquadFirstComment,
        step: {
          title: "Let people know you're here",
          description: `Welcome to the ${squad.name} Squad. Start your journey by saying hi.`,
          component: (props) => (
            <SquadFirstCommentChecklistStep {...props} squad={squad} />
          ),
        },
        actions,
      }),
      [ActionType.SquadFirstPost]:
        verifyPermission(squad, SourcePermissions.Post) &&
        createChecklistStep({
          type: ActionType.SquadFirstPost,
          step: {
            title: 'Share your first post',
            description: showArticleOnboarding
              ? 'Share your first post to help other Squad members discover content you found interesting. New here? Click explore.'
              : 'Share your first post to help other Squad members discover content you found interesting.',
            component: (props) => (
              <SharePostChecklistStep {...props} squad={squad} />
            ),
          },
          actions,
        }),
      [ActionType.SquadInvite]: createChecklistStep({
        type: ActionType.SquadInvite,
        step: {
          title: 'Send invitations',
          description:
            'To unleash the power of Squads invite developers you know and appreciate to join you.',
          component: (props) => (
            <InviteMemberChecklistStep {...props} squad={squad} />
          ),
        },
        actions,
      }),
      [ActionType.BrowserExtension]: createChecklistStep({
        type: ActionType.BrowserExtension,
        step: {
          title: 'Download browser extension',
          description:
            'Get one personalized feed for all the knowledge you need. Make learning a daily habit or just do something useful while you’re in endless meetings.',
          component: InstallExtensionChecklistStep,
        },
        actions,
      }),
    };

    if (isPushSupported) {
      step[ActionType.EnableNotification] = createChecklistStep({
        type: ActionType.EnableNotification,
        step: {
          title: 'Subscribe for updates',
          description: `One last thing! To get the best out of Squads stay tuned about the most important activity on ${squad.name}. No spam, we promise!`,
          component: NotificationChecklistStep,
        },
        actions,
      });
    }

    return step;
  }, [
    squad,
    actions,
    showArticleOnboarding,
    isChecklistReady,
    isInitialized,
    isPushSupported,
  ]);

  const steps = useMemo(() => {
    const actionsForRole =
      actionsPerRoleMap[squad.currentMember?.role] ||
      actionsPerRoleMap[SourceMemberRole.Member];

    return actionsForRole
      .map((actionType) => {
        return stepsMap[actionType];
      })
      .filter(Boolean);
  }, [squad.currentMember, stepsMap]);

  const checklist = useChecklist({ steps });

  const [isChecklistVisible, setChecklistVisible] = usePersistentContext(
    SQUAD_CHECKLIST_VISIBLE_KEY,
    true,
  );

  return {
    ...checklist,
    isChecklistVisible,
    setChecklistVisible,
    isChecklistReady,
  };
};

export { useSquadChecklist };
