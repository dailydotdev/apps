import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import type { NotificationItemProps } from './NotificationItem';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { NotificationAvatarType } from '../../graphql/notifications';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { FollowButton } from '../contentPreference/FollowButton';
import { ButtonVariant } from '../buttons/Button';
import { CopyType } from '../sources/SourceActions/SourceActionsFollow';

export const NotificationFollowUserButton = ({
  avatars,
  referenceId,
}: NotificationItemProps): ReactElement => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  const { data: followPreference } = useContentPreferenceStatusQuery({
    id: referenceId,
    entity: ContentPreferenceType.User,
    queryOptions: {
      enabled: inView,
    },
  });

  const referenceUserName = useMemo(() => {
    return (
      avatars?.find(
        (item) =>
          item.type === NotificationAvatarType.User &&
          item.referenceId === referenceId,
      )?.name ?? 'user'
    );
  }, [avatars, referenceId]);

  return (
    <div ref={ref}>
      {inView && (
        <FollowButton
          entityId={referenceId}
          variant={ButtonVariant.Tertiary}
          type={ContentPreferenceType.User}
          status={followPreference?.status}
          entityName={referenceUserName}
          followedVariant={ButtonVariant.Primary}
          className="mt-3"
          buttonClassName={classNames(
            !followPreference?.status &&
              '-ml-3.5 flex min-w-min text-text-link',
          )}
          copyType={CopyType.NiceGuy}
        />
      )}
    </div>
  );
};
