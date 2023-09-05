import React, { ReactElement, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { Modal, ModalProps } from '../common/Modal';
import {
  checkHasMutedPreference,
  useNotificationPreference,
} from '../../../hooks/notifications';
import { SourceMemberRole, Squad } from '../../../graphql/sources';
import { Switch } from '../../fields/Switch';
import { NotificationType } from '../../notifications/utils';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';

interface SquadNotificationsModalProps extends ModalProps {
  squad: Squad;
}

export function SquadNotificationsModal({
  onRequestClose,
  squad,
  ...props
}: SquadNotificationsModalProps): ReactElement {
  const {
    preferences,
    isPreferencesReady,
    muteNotification,
    clearNotificationPreference,
    showSourceFeedPosts,
    hideSourceFeedPosts,
  } = useNotificationPreference({
    params: [
      {
        referenceId: squad?.id,
        notificationType: NotificationType.SquadPostAdded,
      },
      {
        referenceId: squad?.id,
        notificationType: NotificationType.SquadMemberJoined,
      },
    ],
    squad,
  });

  const client = useQueryClient();
  const { user } = useAuthContext();
  const squadCache: Squad = client.getQueryData(
    generateQueryKey(RequestKey.Squad, user, squad?.handle),
  );
  const { hideFeedPosts, mutedNewPosts, mutedNewMembers } = useMemo(
    () => ({
      hideFeedPosts: squadCache?.currentMember?.flags?.hideFeedPosts,
      mutedNewPosts: preferences?.some((preference) =>
        checkHasMutedPreference(
          preference,
          NotificationType.SquadPostAdded,
          squad?.id,
        ),
      ),
      mutedNewMembers: preferences?.some((preference) =>
        checkHasMutedPreference(
          preference,
          NotificationType.SquadMemberJoined,
          squad?.id,
        ),
      ),
    }),
    [preferences, squad, squadCache],
  );

  const onToggleNotifyNewPosts = () => {
    const toggleAction = mutedNewPosts
      ? clearNotificationPreference
      : muteNotification;

    return toggleAction({
      type: NotificationType.SquadPostAdded,
      referenceId: squad.id,
    });
  };

  const onToggleNotifyNewMembers = () => {
    const toggleAction = mutedNewMembers
      ? clearNotificationPreference
      : muteNotification;

    return toggleAction({
      type: NotificationType.SquadMemberJoined,
      referenceId: squad.id,
    });
  };

  if (!isPreferencesReady) {
    return null;
  }

  return (
    <Modal
      {...props}
      isOpen
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header title="Notifications" />
      <Modal.Body className="gap-3">
        <Switch
          data-testId="show_new_posts-switch"
          inputId="show_new_posts-switch"
          name="show_new_posts"
          className="w-20"
          compact={false}
          checked={!hideFeedPosts}
          onToggle={hideFeedPosts ? showSourceFeedPosts : hideSourceFeedPosts}
        >
          Show new posts on my feed
        </Switch>
        <Switch
          data-testId="notify_new_posts-switch"
          inputId="notify_new_posts-switch"
          name="notify_new_posts"
          className="w-20"
          compact={false}
          checked={!mutedNewPosts}
          onToggle={onToggleNotifyNewPosts}
        >
          Notify me about new posts
        </Switch>
        {squad.currentMember.role === SourceMemberRole.Admin && (
          <Switch
            data-testId="notify_new_members-switch"
            inputId="notify_new_members-switch"
            name="notify_new_members"
            className="w-20"
            compact={false}
            checked={!mutedNewMembers}
            onToggle={onToggleNotifyNewMembers}
          >
            Notify me about new members
          </Switch>
        )}
        <p className="typo-callout text-theme-label-tertiary">
          For more options, go to your
          <a
            className="ml-1 underline hover:no-underline text-theme-label-link"
            href="/account/notifications"
          >
            notifications settings
          </a>
        </p>
      </Modal.Body>
    </Modal>
  );
}

export default SquadNotificationsModal;
