import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from '../fields/Switch';
import {
  NotificationSection,
  NotificationType,
  SQUAD_MODERATION_KEYS,
} from './utils';
import { useAuthContext } from '../../contexts/AuthContext';
import { SourcePermissions } from '../../graphql/sources';
import { verifyPermission } from '../../graphql/squads';
import type { Squad } from '../../graphql/sources';
import useNotificationSettings from '../../hooks/notifications/useNotificationSettings';

import { Checkbox } from '../fields/Checkbox';
import { ButtonVariant } from '../buttons/common';
import { ArrowIcon } from '../icons';
import { Button } from '../buttons/Button';
import { useNotificationPreference } from '../../hooks/notifications';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import { Image } from '../image/Image';
import { HorizontalSeparator } from '../utilities';

interface SquadModerationItemProps {
  squad: Squad;
  expandedSquadId: string | null;
  onToggleExpanded: (squadId: string) => void;
}

const SquadModerationItem = ({
  squad,
  expandedSquadId,
  onToggleExpanded,
}: SquadModerationItemProps): ReactElement | null => {
  const { preferences, subscribeNotification, muteNotification } =
    useNotificationPreference({
      params: SQUAD_MODERATION_KEYS.map((notificationType) => ({
        referenceId: squad.id,
        notificationType,
      })),
      squad,
    });

  const {
    SourcePostSubmitted,
    SquadMemberJoined,
    SquadFeatured,
    allowNotifications,
  } = useMemo(() => {
    const isNotificationSubscribed = (notificationType: NotificationType) => {
      const pref = preferences.find(
        (preference) =>
          preference.notificationType === notificationType &&
          preference.referenceId === squad.id,
      );

      return !pref || pref.status === NotificationPreferenceStatus.Subscribed;
    };

    return {
      SourcePostSubmitted: isNotificationSubscribed(
        NotificationType.SourcePostSubmitted,
      ),
      SquadMemberJoined: isNotificationSubscribed(
        NotificationType.SquadMemberJoined,
      ),
      SquadFeatured: isNotificationSubscribed(NotificationType.SquadFeatured),
      allowNotifications: SQUAD_MODERATION_KEYS.some(isNotificationSubscribed),
    };
  }, [preferences, squad?.id]);

  const isExpanded = expandedSquadId === squad.id;

  const onTogglePostsWaitingForReview = () => {
    const toggleAction = SourcePostSubmitted
      ? muteNotification
      : subscribeNotification;

    return toggleAction({
      type: NotificationType.SourcePostSubmitted,
      referenceId: squad.id,
    });
  };

  const onToggleNewMemberJoined = () => {
    const toggleAction = SquadMemberJoined
      ? muteNotification
      : subscribeNotification;

    return toggleAction({
      type: NotificationType.SquadMemberJoined,
      referenceId: squad.id,
    });
  };

  const onToggleMilestonesAndAchievements = () => {
    const toggleAction = SquadFeatured
      ? muteNotification
      : subscribeNotification;

    return toggleAction({
      type: NotificationType.SquadFeatured,
      referenceId: squad.id,
    });
  };

  const onToggleAllowNotifications = () => {
    const toggleAction = allowNotifications
      ? muteNotification
      : subscribeNotification;

    Promise.all(
      SQUAD_MODERATION_KEYS.map((type) =>
        toggleAction({
          type,
          referenceId: squad.id,
        }),
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-start gap-4">
        <div className="flex min-h-0 min-w-0 grow basis-0 flex-row items-center justify-start gap-2">
          <Image
            className="size-8 rounded-full object-cover"
            src={squad?.image}
            alt="Squad avatar"
          />
          <div className="flex min-h-0 min-w-0 grow basis-0 flex-row items-start justify-start gap-1 text-nowrap">
            <Typography
              type={TypographyType.Subhead}
              bold
              className="text-text-primary"
            >
              {squad.name}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="text-nowrap"
            >
              @{squad.handle}
            </Typography>
          </div>
        </div>
        <Button
          icon={
            <ArrowIcon
              className={`m-auto transition-transform ${
                isExpanded ? 'rotate-180' : 'rotate-90'
              }`}
            />
          }
          variant={ButtonVariant.Option}
          onClick={() => onToggleExpanded(squad.id)}
        />
      </div>
      {isExpanded && (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between gap-4">
              <Typography type={TypographyType.Callout} bold>
                Allow notifications
              </Typography>
              <Switch
                inputId={`allow_notifications_${squad.id}`}
                name={`allow_notifications_${squad.id}`}
                checked={allowNotifications}
                onToggle={onToggleAllowNotifications}
                compact={false}
              />
            </div>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="w-full"
            >
              Turn off to stop any mod notifications from this squad.
            </Typography>
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full flex-row items-center justify-between">
                <Typography type={TypographyType.Callout}>
                  Posts waiting for review
                </Typography>
                <Checkbox
                  className="!px-0"
                  checkmarkClassName="!mr-0"
                  name={`posts_review_${squad.id}`}
                  checked={SourcePostSubmitted}
                  onToggleCallback={onTogglePostsWaitingForReview}
                />
              </div>
              <div className="flex w-full flex-row items-center justify-between">
                <Typography type={TypographyType.Callout}>
                  New member joined
                </Typography>
                <Checkbox
                  className="!px-0"
                  checkmarkClassName="!mr-0"
                  name={`new_member_${squad.id}`}
                  checked={SquadMemberJoined}
                  onToggleCallback={onToggleNewMemberJoined}
                />
              </div>
              <div className="flex w-full flex-row items-center justify-between">
                <Typography type={TypographyType.Callout}>
                  Milestones and achievements
                </Typography>
                <Checkbox
                  className="!px-0"
                  checkmarkClassName="!mr-0"
                  name={`milestones_${squad.id}`}
                  checked={SquadFeatured}
                  onToggleCallback={onToggleMilestonesAndAchievements}
                />
              </div>
            </div>
          </div>
          <HorizontalSeparator />
        </>
      )}
    </div>
  );
};

const SquadModNotifications = (): ReactElement => {
  const { squads } = useAuthContext();
  const { getGroupStatus, toggleGroup } = useNotificationSettings();
  const [expandedSquadId, setExpandedSquadId] = useState('');
  const squadModerationEnabled = getGroupStatus('squadModeration', 'inApp');

  const moderationSquads =
    squads?.filter((squad) =>
      verifyPermission(squad, SourcePermissions.ModeratePost),
    ) || [];

  const toggleSquadExpansion = (squadId: string) => {
    setExpandedSquadId((prev) => (prev === squadId ? '' : squadId));
  };

  return (
    <NotificationSection>
      <div className="flex flex-row justify-between gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            Squad moderation
          </Typography>
          <Typography type={TypographyType.Footnote}>
            Turn this on to get moderation-related notifications for all squads
            you moderate. You can fine-tune settings per squad below.
          </Typography>
        </div>
        <Switch
          inputId="squad_moderation"
          name="squad_moderation"
          checked={squadModerationEnabled}
          onToggle={() =>
            toggleGroup('squadModeration', !squadModerationEnabled, 'inApp')
          }
          compact={false}
        />
      </div>
      {squadModerationEnabled && (
        <div className="flex flex-col gap-4">
          {moderationSquads.map((squad) => (
            <SquadModerationItem
              key={squad.id}
              squad={squad}
              expandedSquadId={expandedSquadId}
              onToggleExpanded={toggleSquadExpansion}
            />
          ))}
        </div>
      )}
    </NotificationSection>
  );
};

export default SquadModNotifications;
