import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { Readme } from '@dailydotdev/shared/src/components/profile/Readme';
import { useProfile } from '@dailydotdev/shared/src/hooks/profile/useProfile';
import { useActions, useJoinReferral } from '@dailydotdev/shared/src/hooks';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { AutofillProfileBanner } from '@dailydotdev/shared/src/features/profile/components/AutofillProfileBanner';
import { useUploadCv } from '@dailydotdev/shared/src/features/profile/hooks/useUploadCv';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { ProfileWidgets } from '@dailydotdev/shared/src/components/profile/ProfileWidgets';
import {
  TypographyType,
  TypographyTag,
  TypographyColor,
  Typography,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useDynamicHeader } from '@dailydotdev/shared/src/useDynamicHeader';
import { Header } from '@dailydotdev/shared/src/components/profile/Header';
import classNames from 'classnames';
import {
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePage = ({
  user: initialUser,
  noindex,
  userStats,
  sources,
}: ProfileLayoutProps): ReactElement => {
  useJoinReferral();
  const { status, onUpload, shouldShow } = useUploadCv();
  const { checkHasCompleted } = useActions();
  const hasClosedBanner = useMemo(
    () => checkHasCompleted(ActionType.ClosedProfileBanner),
    [checkHasCompleted],
  );

  const { user, isUserSame } = useProfile(initialUser);
  const { ref: stickyRef, progress: stickyProgress } =
    useDynamicHeader<HTMLDivElement>(true);
  const hideSticky = !stickyProgress;

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(user, {}, noindex),
  };

  const shouldShowBanner = isUserSame && shouldShow && !hasClosedBanner;

  return (
    <div className="rounded-16 border border-border-subtlest-tertiary">
      <NextSeo {...seo} />
      <Header
        user={user}
        isSameUser={isUserSame}
        sticky={!hideSticky}
        className={classNames(
          'left-0 top-0 z-3 w-full bg-background-default transition-all duration-75',
          !hideSticky ? 'fixed tablet:pl-20' : 'relative',
        )}
      />
      <div ref={stickyRef} />
      <ProfileHeader user={user} userStats={userStats} />
      <div className="flex flex-col gap-6 p-6">
        {shouldShowBanner && (
          <AutofillProfileBanner
            onUpload={onUpload}
            isLoading={status === 'pending'}
          />
        )}
        <Readme user={user} />
        <div>
          <Typography
            type={TypographyType.Body}
            tag={TypographyTag.H1}
            color={TypographyColor.Primary}
            bold
            className="laptop:hidden"
          >
            Highlights
          </Typography>
          <ProfileWidgets
            user={user}
            userStats={userStats}
            sources={sources}
            className="no-scrollbar overflow-auto laptop:hidden"
          />
        </div>
      </div>
    </div>
  );
};

ProfilePage.getLayout = getProfileLayout;
export default ProfilePage;

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;
