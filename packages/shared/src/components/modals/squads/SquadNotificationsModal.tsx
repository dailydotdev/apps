import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  checkHasStatusPreference,
  useNotificationPreference,
} from '../../../hooks/notifications';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole } from '../../../graphql/sources';
import { Switch } from '../../fields/Switch';
import { NotificationType } from '../../notifications/utils';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { NotificationPreferenceStatus } from '../../../graphql/notifications';
import { Anchor } from '../../text';
import { webappUrl } from '../../../lib/constants';

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
    subscribeNotification,
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
  const { hideFeedPosts, subscribedNewPosts, mutedNewMembers } = useMemo(
    () => ({
      hideFeedPosts: squadCache?.currentMember?.flags?.hideFeedPosts,
      subscribedNewPosts: preferences?.some((preference) =>
        checkHasStatusPreference(
          preference,
          NotificationType.SquadPostAdded,
          squad?.id,
          [NotificationPreferenceStatus.Subscribed],
        ),
      ),
      mutedNewMembers: preferences?.some((preference) =>
        checkHasStatusPreference(
          preference,
          NotificationType.SquadMemberJoined,
          squad?.id,
          [NotificationPreferenceStatus.Muted],
        ),
      ),
    }),
    [preferences, squad, squadCache],
  );

  const onToggleNotifyNewPosts = () => {
    const toggleAction = subscribedNewPosts
      ? clearNotificationPreference
      : subscribeNotification;

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
          data-testid="show_new_posts-switch"
          inputId="show_new_posts-switch"
          name="show_new_posts"
          className="w-20"
          compact={false}
          checked={!hideFeedPosts}
          onToggle={hideFeedPosts ? showSourceFeedPosts : hideSourceFeedPosts}
        >
          Show new posts on For You
        </Switch>
        <Switch
          data-testid="notify_new_posts-switch"
          inputId="notify_new_posts-switch"
          name="notify_new_posts"
          className="w-20"
          compact={false}
          checked={subscribedNewPosts}
          onToggle={onToggleNotifyNewPosts}
        >
          Notify me about new posts
        </Switch>
        {squad.currentMember.role === SourceMemberRole.Admin && (
          <Switch
            data-testid="notify_new_members-switch"
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
        <p className="text-text-tertiary typo-callout">
          For more options, go to your
          <Anchor className="ml-1" href={`${webappUrl}account/notifications`}>
            notifications settings
          </Anchor>
        </p>
      </Modal.Body>
    </Modal>
  );
}

export default SquadNotificationsModal;
