import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { AboutMe } from '@dailydotdev/shared/src/features/profile/components/AboutMe';
import { Activity } from '@dailydotdev/shared/src/features/profile/components/Activity';
import { useProfile } from '@dailydotdev/shared/src/hooks/profile/useProfile';
import { useActions, useJoinReferral } from '@dailydotdev/shared/src/hooks';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { AutofillProfileBanner } from '@dailydotdev/shared/src/features/profile/components/AutofillProfileBanner';
import { ProfileUserExperiences } from '@dailydotdev/shared/src/features/profile/components/experience/ProfileUserExperiences';
import { ProfileUserStack } from '@dailydotdev/shared/src/features/profile/components/stack/ProfileUserStack';
import { ProfileUserTools } from '@dailydotdev/shared/src/features/profile/components/tools/ProfileUserTools';
import { ProfileUserHotTakes } from '@dailydotdev/shared/src/features/profile/components/hotTakes/ProfileUserHotTakes';
import { ProfileUserWorkspacePhotos } from '@dailydotdev/shared/src/features/profile/components/workspacePhotos/ProfileUserWorkspacePhotos';
import { useUploadCv } from '@dailydotdev/shared/src/features/profile/hooks/useUploadCv';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { ProfileWidgets } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/ProfileWidgets';
import {
  TypographyType,
  TypographyTag,
  TypographyColor,
  Typography,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useDynamicHeader } from '@dailydotdev/shared/src/useDynamicHeader';
import { Header } from '@dailydotdev/shared/src/components/profile/Header';
import classNames from 'classnames';
import { ProfileCompletion } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/ProfileCompletion';
import { Share } from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/Share';
import { ProfilePreviewToggle } from '@dailydotdev/shared/src/components/profile/ProfilePreviewToggle';
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { ref: stickyRef, progress: stickyProgress } =
    useDynamicHeader<HTMLDivElement>(true);
  const hideSticky = !stickyProgress;

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(user, {}, noindex),
  };

  const shouldShowBanner = isUserSame && shouldShow && !hasClosedBanner;

  // When in preview mode, hide owner-only elements
  const showAsVisitor = isUserSame && isPreviewMode;

  return (
    <div className="rounded-16 border border-t-0 border-border-subtlest-tertiary laptop:border-t">
      <NextSeo {...seo} />
      <Header
        user={user}
        isSameUser={isUserSame && !showAsVisitor}
        sticky={!hideSticky}
        className={classNames(
          'left-0 top-0 z-3 w-full bg-background-default transition-all duration-75 laptop:hidden',
          !hideSticky ? 'fixed tablet:pl-20' : 'relative',
        )}
      />
      {isUserSame && !showAsVisitor && (
        <ProfileCompletion className="laptop:hidden" />
      )}
      <div ref={stickyRef} />
      <ProfileHeader
        user={user}
        userStats={userStats}
        isSameUser={isUserSame && !showAsVisitor}
      />
      <div className="flex flex-col divide-y divide-border-subtlest-tertiary p-6">
        {isUserSame && !showAsVisitor && (
          <ProfilePreviewToggle
            isPreviewMode={isPreviewMode}
            onToggle={() => setIsPreviewMode(!isPreviewMode)}
            className="mb-4"
          />
        )}
        {shouldShowBanner && !showAsVisitor && (
          <AutofillProfileBanner
            onUpload={onUpload}
            isLoading={status === 'pending'}
          />
        )}
        {!shouldShowBanner && <div />}
        <AboutMe user={user} />
        <ProfileUserStack user={user} />
        <ProfileUserTools user={user} />
        <ProfileUserHotTakes user={user} />
        <ProfileUserWorkspacePhotos user={user} />
        <Activity user={user} />
        {isUserSame && !showAsVisitor && (
          <Share permalink={user?.permalink} className="laptop:hidden" />
        )}
        <div className="py-4 laptop:hidden">
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
        <ProfileUserExperiences user={user} />
      </div>
    </div>
  );
};

ProfilePage.getLayout = getProfileLayout;
export default ProfilePage;

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;
