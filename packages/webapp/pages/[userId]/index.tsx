import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { AboutMe } from '@dailydotdev/shared/src/features/profile/components/AboutMe';
import { Activity } from '@dailydotdev/shared/src/features/profile/components/Activity';
import { useProfile } from '@dailydotdev/shared/src/hooks/profile/useProfile';
import { useActions, useJoinReferral } from '@dailydotdev/shared/src/hooks';
import { NextSeo } from 'next-seo';
import type { NextSeoProps } from 'next-seo/lib/types';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import { AutofillProfileBanner } from '@dailydotdev/shared/src/features/profile/components/AutofillProfileBanner';
import { ProfileUserExperiences } from '@dailydotdev/shared/src/features/profile/components/experience/ProfileUserExperiences';
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
import dynamic from 'next/dynamic';
import {
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
} from '../../components/layouts/ProfileLayout';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';

// Dynamically import mock components to avoid SSR issues
const CurrentlySection = dynamic(
  () =>
    import(
      '@dailydotdev/shared/src/features/profile/components/mocks/CurrentlySection'
    ).then((mod) => mod.CurrentlySection),
  { ssr: false },
);
const StackDNA = dynamic(
  () =>
    import(
      '@dailydotdev/shared/src/features/profile/components/mocks/StackDNA'
    ).then((mod) => mod.StackDNA),
  { ssr: false },
);
const OpenSourceImpact = dynamic(
  () =>
    import(
      '@dailydotdev/shared/src/features/profile/components/mocks/OpenSourceImpact'
    ).then((mod) => mod.OpenSourceImpact),
  { ssr: false },
);
const LearningJourney = dynamic(
  () =>
    import(
      '@dailydotdev/shared/src/features/profile/components/mocks/LearningJourney'
    ).then((mod) => mod.LearningJourney),
  { ssr: false },
);
const SetupShowcase = dynamic(
  () =>
    import(
      '@dailydotdev/shared/src/features/profile/components/mocks/SetupShowcase'
    ).then((mod) => mod.SetupShowcase),
  { ssr: false },
);

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
    <div className="rounded-16 border border-t-0 border-border-subtlest-tertiary laptop:border-t">
      <NextSeo {...seo} />
      <Header
        user={user}
        isSameUser={isUserSame}
        sticky={!hideSticky}
        className={classNames(
          'left-0 top-0 z-3 w-full bg-background-default transition-all duration-75 laptop:hidden',
          !hideSticky ? 'fixed tablet:pl-20' : 'relative',
        )}
      />
      {isUserSame && <ProfileCompletion className="laptop:hidden" />}
      <div ref={stickyRef} />
      <ProfileHeader user={user} userStats={userStats} />
      <div className="flex flex-col divide-y divide-border-subtlest-tertiary p-6">
        {shouldShowBanner && (
          <AutofillProfileBanner
            onUpload={onUpload}
            isLoading={status === 'pending'}
          />
        )}
        {!shouldShowBanner && <div />}
        <AboutMe user={user} />
        {/* Mock Profile Sections - for preview/demo purposes */}
        <CurrentlySection />
        <StackDNA />
        <OpenSourceImpact />
        <LearningJourney />
        <SetupShowcase />
        {/* End Mock Profile Sections */}
        <Activity user={user} />
        {isUserSame && (
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
