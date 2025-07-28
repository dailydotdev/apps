import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from '../fields/Switch';
import { Checkbox } from '../fields/Checkbox';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { Image } from '../image/Image';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';
import { NotificationType } from '../notifications/utils';
import { NotificationPreferenceStatus } from '../../graphql/notifications';

const SubscriptionCheckbox = ({
  squadId,
  disabled,
}: {
  squadId: string;
  disabled: boolean;
}) => {
  const { data } = useContentPreferenceStatusQuery({
    entity: ContentPreferenceType.Source,
    id: squadId,
  });
  const { subscribe, unsubscribe } = useContentPreference();
  const subscribed = data?.status === ContentPreferenceStatus.Subscribed;

  return (
    <Checkbox
      className="!p-0"
      name={squadId}
      checked={subscribed}
      disabled={disabled}
      onToggleCallback={() => {
        if (subscribed) {
          unsubscribe({
            id: squadId,
            entity: ContentPreferenceType.Source,
            entityName: squadId,
          });
        } else {
          subscribe({
            id: squadId,
            entity: ContentPreferenceType.Source,
            entityName: squadId,
          });
        }
      }}
    />
  );
};

const SquadNotificationSettingsModal = ({
  ...props
}: ModalProps): ReactElement => {
  const { squads } = useAuthContext();
  const { notificationSettings: ns, toggleSetting } = useNotificationSettings();
  const disabled =
    ns?.[NotificationType.SquadPostAdded]?.inApp !==
    NotificationPreferenceStatus.Subscribed;

  return (
    <Modal {...props} isDrawerOnMobile>
      <Modal.Header>
        <Modal.Title>Squad notifications</Modal.Title>
      </Modal.Header>
      <Modal.Body className="gap-5">
        <div className="flex flex-row justify-between gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <Typography type={TypographyType.Body} bold>
              Notify me about new posts
            </Typography>
            <Typography type={TypographyType.Footnote}>
              Get notified when someone shares a new post in a squad you’ve
              joined. You can control this per squad.
            </Typography>
          </div>
          <Switch
            inputId={NotificationType.SquadPostAdded}
            name={NotificationType.SquadPostAdded}
            checked={
              ns?.[NotificationType.SquadPostAdded]?.inApp ===
              NotificationPreferenceStatus.Subscribed
            }
            onToggle={() => {
              toggleSetting(NotificationType.SquadPostAdded);
            }}
            compact={false}
          />
        </div>
        <ul className="flex flex-col gap-5">
          {squads.map((squad) => (
            <li className="flex flex-row justify-between" key={squad.id}>
              <div className="flex items-center gap-3">
                <Image
                  className="size-10 rounded-full object-cover"
                  src={squad?.image}
                  alt="Squad avatar"
                />
                <div className="flex items-center gap-1">
                  <Typography type={TypographyType.Callout} bold>
                    {squad.name}{' '}
                  </Typography>
                  <Typography
                    color={TypographyColor.Tertiary}
                    type={TypographyType.Footnote}
                  >
                    @{squad.handle}
                  </Typography>
                </div>
              </div>
              <SubscriptionCheckbox squadId={squad.id} disabled={disabled} />
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
};

export default SquadNotificationSettingsModal;
