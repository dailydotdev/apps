import React, { useEffect, useRef } from 'react';
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
  const hasShownToast = useRef(false);
  const { user: currentUser, isAuthReady } = useAuthContext();
  const { query } = useRouter();
  const userId = (query?.userid as string) || null;
  const isSameUser = !!userId && userId === currentUser?.id;
  const { data: contentPreference, isPending } =
    useContentPreferenceStatusQuery({
      id: userId,
      entity: ContentPreferenceType.User,
    });
  const { data: user } = useUserShortByIdQuery({ id: userId });
  const { follow } = useContentPreference({ showToastOnSuccess: true });
  const { displayToast, dismissToast } = useToastNotification();
  const isDataReady = isAuthReady || (currentUser && !isPending);

  useEffect(() => {
    if (!user || isSameUser || !isDataReady || hasShownToast.current) {
      return;
    }

    const showFollow =
      !!currentUser &&
      contentPreference?.status !== ContentPreferenceStatus.Follow;

    setTimeout(() => {
      hasShownToast.current = true;
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
          {showFollow && (
            <Button
              onClick={() => {
                follow({
                  entity: ContentPreferenceType.User,
                  id: user?.id,
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
      // Set a small timeout to ensure its shown after the page is loaded and won't be cleared by updates.
    }, 1000);
  }, [
    user,
    contentPreference?.status,
    hasShownToast,
    displayToast,
    dismissToast,
    follow,
    isSameUser,
    isDataReady,
    currentUser,
  ]);
};

export default useSharedByToast;
