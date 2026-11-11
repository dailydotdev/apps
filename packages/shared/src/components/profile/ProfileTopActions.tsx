import type { ReactElement } from 'react';
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import type { LoggedUser, PublicProfile } from '../../lib/user';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCanAwardUser } from '../../hooks/useCoresFeature';
import { AwardButton } from '../award/AwardButton';
import SourceActionsNotify from '../sources/SourceActions/SourceActionsNotify';

interface ProfileTopActionsProps {
  user: PublicProfile;
}

// On a phone, a visitor's notify bell and award sit beside Copy link, as
// icon buttons of the same size, so the row under the stats holds only
// Follow and Message.
const ProfileTopActions = ({
  user,
}: ProfileTopActionsProps): ReactElement | null => {
  const { user: loggedUser } = useAuthContext();
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user?.id,
    entity: ContentPreferenceType.User,
  });
  const { subscribe, unsubscribe } = useContentPreference();
  const canAward = useCanAwardUser({
    sendingUser: loggedUser,
    receivingUser: user as LoggedUser,
  });
  const status = contentPreference?.status;
  const isSubscribed = status === ContentPreferenceStatus.Subscribed;
  const isFollowing = isSubscribed || status === ContentPreferenceStatus.Follow;

  const { mutate: onNotifyClick, isPending } = useMutation({
    mutationFn: async () => {
      const params = {
        id: user.id,
        entity: ContentPreferenceType.User,
        entityName: `@${user.username}`,
      };

      if (isSubscribed) {
        await unsubscribe(params);
      } else {
        await subscribe(params);
      }
    },
  });

  if (!isFollowing && !canAward) {
    return null;
  }

  return (
    <>
      {isFollowing && (
        <SourceActionsNotify
          haveNotificationsOn={isSubscribed}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNotifyClick();
          }}
          disabled={isPending}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Float}
        />
      )}
      {canAward && (
        <AwardButton
          type="USER"
          entity={{
            id: user.id,
            receiver: user,
          }}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Float}
        />
      )}
    </>
  );
};

export default ProfileTopActions;
