import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { FollowButton } from '@dailydotdev/shared/src/components/contentPreference/FollowButton';
import { ContentPreferenceType } from '@dailydotdev/shared/src/graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '@dailydotdev/shared/src/hooks/contentPreference/useContentPreferenceStatusQuery';
import { AwardButton } from '@dailydotdev/shared/src/components/award/AwardButton';
import { useCanAwardUser } from '@dailydotdev/shared/src/hooks/useCoresFeature';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import type {
  LoggedUser,
  PublicProfile,
} from '@dailydotdev/shared/src/lib/user';

interface WorldViewerActionProps {
  user: PublicProfile;
  className?: string;
  /** Fills its row, for the phone bar where it is a row of its own. */
  block?: boolean;
}

/**
 * What a signed-in visitor can do with somebody else's world: follow them, and
 * award them. Both are the profile's own buttons, so doing either from here and
 * doing it from the profile are the same act.
 *
 * Nothing on your own world, and nothing signed out: a reader with no account
 * is offered one instead, further down the rail.
 */
export function WorldViewerAction({
  user,
  className,
  block,
}: WorldViewerActionProps): ReactElement | null {
  const { user: viewer } = useAuthContext();
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: user.id,
    entity: ContentPreferenceType.User,
  });
  const canAward = useCanAwardUser({
    sendingUser: viewer,
    receivingUser: user as LoggedUser,
  });

  if (!viewer || viewer.id === user.id) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex items-center gap-2',
        block && 'w-full',
        className,
      )}
    >
      <FollowButton
        entityId={user.id}
        type={ContentPreferenceType.User}
        status={contentPreference?.status}
        entityName={`@${user.username}`}
        origin={Origin.Profile}
        variant={ButtonVariant.Primary}
        className={block ? 'flex-1' : undefined}
        buttonClassName={block ? 'flex-1' : undefined}
        // The bell is a preferences control, and nobody came to this page to
        // set preferences. It also has no room for a second button.
        showSubscribe={false}
        alwaysShow
      />
      {canAward && (
        <AwardButton
          type="USER"
          copy="Award"
          entity={{ id: user.id, receiver: user }}
          variant={ButtonVariant.Secondary}
          className="flex-none"
        />
      )}
    </div>
  );
}
