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
import { Origin } from '../../lib/log';

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
    // Reserve the button's height (Small button = h-8) up front so the row
    // keeps a constant height whether or not the button has mounted/resolved.
    // Without this the button pops in as each row scrolls into view and jerks
    // the rows below it.
    <div ref={ref} className="flex min-h-8 items-center">
      {inView && (
        <FollowButton
          entityId={referenceId}
          variant={ButtonVariant.Tertiary}
          type={ContentPreferenceType.User}
          status={followPreference?.status}
          entityName={referenceUserName}
          followedVariant={ButtonVariant.Primary}
          buttonClassName={classNames(
            // Not-following "Follow back": render as a plain text link — drop
            // the button's horizontal padding so the label sits on the row's
            // content edge, and swap the ghost hover fill for an underline so
            // there's no offset highlight box.
            !followPreference?.status &&
              '!px-0 text-text-link hover:!bg-transparent hover:underline',
          )}
          copyType={CopyType.NiceGuy}
          origin={Origin.Notification}
        />
      )}
    </div>
  );
};
