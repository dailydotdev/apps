import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthContext } from '../contexts/AuthContext';
import { useToastNotification } from './useToastNotification';
import { useContentPreferenceStatusQuery } from './contentPreference/useContentPreferenceStatusQuery';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../graphql/contentPreference';
import { useUserShortByIdQuery } from './user/useUserShortByIdQuery';
import { useContentPreference } from './contentPreference/useContentPreference';
import { ButtonSize } from '../components/buttons/common';
import { ProfileImageSize, ProfilePicture } from '../components/ProfilePicture';
import { Button } from '../components/buttons/Button';
import { Typography, TypographyTag } from '../components/typography/Typography';

const useSharedByToast = (): void => {
  const { user: currentUser } = useAuthContext();
  const { query } = useRouter();
  const userId = (query?.userid as string) || null;
  const [hasShownToast, setHasShownToast] = useState(false);
  const { data: contentPreference, isPending } =
    useContentPreferenceStatusQuery({
      id: userId,
      entity: ContentPreferenceType.User,
      queryOptions: {
        enabled: !!userId && userId !== currentUser?.id,
      },
    });
  const { data: user } = useUserShortByIdQuery({ id: userId });
  const { follow } = useContentPreference({ showToastOnSuccess: true });
  const { displayToast, dismissToast } = useToastNotification();
  const isFollowing =
    contentPreference?.status === ContentPreferenceStatus.Follow;

  useEffect(() => {
    if (hasShownToast || !user || isPending) {
      return;
    }

    displayToast(
      <div className="flex items-center gap-4 ">
        <Link
          onClick={() => dismissToast()}
          className="flex items-center gap-2 "
          href={`/${user.username}`}
        >
          <ProfilePicture user={user} size={ProfileImageSize.Medium} />
          <span>
            <Typography tag={TypographyTag.Span} bold>
              {user.name}
            </Typography>{' '}
            <Typography tag={TypographyTag.Span}>shared this post</Typography>
          </span>
        </Link>
        {!isFollowing && (
          <Button
            onClick={() => {
              follow({
                entity: ContentPreferenceType.User,
                id: userId,
                entityName: `@${user.username}`,
              });
            }}
            className="bg-background-default text-text-primary"
            size={ButtonSize.Small}
          >
            Follow
          </Button>
        )}
      </div>,
    );
    setHasShownToast(true);
  }, [
    user,
    hasShownToast,
    displayToast,
    follow,
    userId,
    isFollowing,
    contentPreference,
    isPending,
  ]);
};

export default useSharedByToast;
