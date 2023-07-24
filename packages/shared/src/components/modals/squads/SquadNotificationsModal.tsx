import React, { ReactElement, useMemo } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import {
  checkHasMutedPreference,
  useNotificationPreference,
} from '../../../hooks/notifications';
import { SourceMemberRole, Squad } from '../../../graphql/sources';
import { Switch } from '../../fields/Switch';
import { NotificationType } from '../../notifications/utils';
import { ClickableText } from '../../buttons/ClickableText';

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
  } = useNotificationPreference({
    params: [
      { type: NotificationType.SquadPostAdded, referenceId: squad?.id },
      { type: NotificationType.SquadMemberJoined, referenceId: squad?.id },
    ],
  });

  const { mutedNewPosts, mutedNewMembers } = useMemo(
    () => ({
      showNewPosts: squad?.currentMember?.flags?.showPostsOnFeed,
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
    [preferences, squad],
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

  if (!isPreferencesReady) return null;

  return (
    <Modal
      {...props}
      isOpen
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header title={`Notifications from ${squad.name}`} />
      <Modal.Body className="gap-3">
        {/* <Switch */}
        {/*  data-testId="notify_new_posts-switch" */}
        {/*  inputId="notify_new_posts-switch" */}
        {/*  name="notify_new_posts" */}
        {/*  className="w-20" */}
        {/*  compact={false} */}
        {/*  checked={mutedNewPosts} */}
        {/*  onToggle={() => console.log()} */}
        {/* > */}
        {/*  Show new posts on my feed */}
        {/* </Switch> */}
        <Switch
          data-testId="notify_new_posts-switch"
          inputId="notify_new_posts-switch"
          name="notify_new_posts"
          className="w-20"
          checked={mutedNewPosts}
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
            checked={mutedNewMembers}
            onToggle={onToggleNotifyNewMembers}
          >
            Notify me about new members
          </Switch>
        )}
        <p className="flex flex-row typo-callout text-theme-label-tertiary">
          For more options, go to your
          <ClickableText
            className="ml-1"
            href="/account/notifications"
            inverseUnderline
          >
            notifications settings
          </ClickableText>
        </p>
      </Modal.Body>
    </Modal>
  );
}

export default SquadNotificationsModal;
