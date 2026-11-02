import type { ComponentType, ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import {
  useHeroDeadZone,
  usePassedBlock,
} from '@dailydotdev/shared/src/components/shell/usePassedBlock';
import { ShellDockedRow } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import {
  expectShellScroll,
  useShellEdge,
} from '@dailydotdev/shared/src/components/shell/useShellScroll';
import {
  ProfileSegment,
  ProfileSegments,
  useProfileSegment,
} from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import { AboutMe } from '@dailydotdev/shared/src/features/profile/components/AboutMe';
import { Activity } from '@dailydotdev/shared/src/features/profile/components/Activity';
import { useProfile } from '@dailydotdev/shared/src/hooks/profile/useProfile';
import { useActions, useJoinReferral } from '@dailydotdev/shared/src/hooks';
import { NextSeo } from 'next-seo';
import ProfileHeader from '@dailydotdev/shared/src/components/profile/ProfileHeader';
import {
  LfgProfileAvatarBadge,
  LfgProfileSection,
} from '@dailydotdev/shared/src/features/lfg/components/profile/LfgProfileSection';
import { AutofillProfileBanner } from '@dailydotdev/shared/src/features/profile/components/AutofillProfileBanner';
import { ProfileUserExperiences } from '@dailydotdev/shared/src/features/profile/components/experience/ProfileUserExperiences';
import { ProfileAchievementShowcase } from '@dailydotdev/shared/src/features/profile/components/achievements/ProfileAchievementShowcase';
import { ProfileUserStack } from '@dailydotdev/shared/src/features/profile/components/stack/ProfileUserStack';
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
import { useRouter } from 'next/router';
import { useProfileCompletionIndicator } from '@dailydotdev/shared/src/hooks/profile/useProfileCompletionIndicator';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import type { ProfileLayoutProps } from './index';
import { getProfileSegmentSeo } from './index';
import {
  ProfilePostsFeed,
  ProfileRepliesFeed,
  ProfileUpvotedFeed,
} from './ProfileFeeds';

// The page is in the server HTML, where a layout effect only warns.
const useClientLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const segmentFeeds: Partial<
  Record<ProfileSegment, ComponentType<{ user: PublicProfile }>>
> = {
  [ProfileSegment.Posts]: ProfilePostsFeed,
  [ProfileSegment.Replies]: ProfileRepliesFeed,
  [ProfileSegment.Upvoted]: ProfileUpvotedFeed,
};

interface ProfilePageProps extends ProfileLayoutProps {
  // The segment this route is the address of.
  segment: ProfileSegment;
}

// The profile page. On a phone its segments are views of this one page:
// Posts, Replies and Upvoted swap in under the row of segments, and a
// direct load of any segment's address renders the page with that segment
// open.
export const ProfilePage = ({
  user: initialUser,
  noindex,
  userStats,
  sources,
  segment: routeSegment,
}: ProfilePageProps): ReactElement => {
  useJoinReferral();
  const router = useRouter();
  const { isAuthReady } = useAuthContext();
  const { status, onUpload, shouldShow } = useUploadCv();
  const { checkHasCompleted } = useActions();
  const hasClosedBanner = useMemo(
    () => checkHasCompleted(ActionType.ClosedProfileBanner),
    [checkHasCompleted],
  );
  const { showIndicator: showProfileCompletion } =
    useProfileCompletionIndicator();

  const { user, isUserSame: isUserSameBase } = useProfile(initialUser);

  useEffect(() => {
    if (
      !isAuthReady ||
      !router.isReady ||
      !isUserSameBase ||
      router.query.userId !== user.id
    ) {
      return;
    }

    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, userId: user.username },
      },
      undefined,
      { shallow: true },
    );
  }, [isAuthReady, isUserSameBase, router, user.id, user.username]);

  // Check if preview mode is enabled via query param
  const isPreviewMode = router.query.preview === 'true';

  // When in preview mode, act as a visitor (not same user)
  const isSameUser = useMemo(
    () => isUserSameBase && !isPreviewMode,
    [isUserSameBase, isPreviewMode],
  );

  const { ref: stickyRef, progress: stickyProgress } =
    useDynamicHeader<HTMLDivElement>(true);
  const hideSticky = !stickyProgress;
  const isPhone = useIsPhone();
  const coverRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  // The owner's completion card sits above the cover, so the cover is not
  // at the top of the page for them until it is dismissed.
  const coversBlock = !(isSameUser && showProfileCompletion);
  const hasCoverPassed = usePassedBlock(coverRef, isPhone && coversBlock);
  const hasNamePassed = usePassedBlock(nameRef, isPhone);
  const segmentsRef = useRef<HTMLDivElement>(null);
  const haveSegmentsPassed = usePassedBlock(segmentsRef, isPhone);
  useHeroDeadZone(segmentsRef, isPhone);
  const blockBottom = useShellEdge();

  const { segment: addressedSegment, setSegment } =
    useProfileSegment(routeSegment);
  const segment = isPhone ? addressedSegment : ProfileSegment.About;
  const SegmentFeed = segmentFeeds[segment];

  // A switch while the row is docked in the block keeps it there and
  // starts the new view right under it, instead of somewhere down the
  // previous view's length; it lands with the view, before the paint.
  const docksOnSwitch = useRef(false);
  const onSelectSegment = (next: ProfileSegment) => {
    docksOnSwitch.current = haveSegmentsPassed;
    setSegment(next);
  };
  useClientLayoutEffect(() => {
    const row = segmentsRef.current;
    if (!docksOnSwitch.current || !row) {
      return;
    }
    docksOnSwitch.current = false;
    const top = row.getBoundingClientRect().bottom + window.scrollY;
    const y = Math.max(0, top - blockBottom + 1);
    if (y < window.scrollY) {
      window.scrollTo(0, y);
      expectShellScroll(y);
    }
  }, [segment, blockBottom]);

  const shouldShowBanner = isSameUser && shouldShow && !hasClosedBanner;
  const segments = (
    <ProfileSegments active={segment} onSelect={onSelectSegment} />
  );

  return (
    <div className="tablet:rounded-16 tablet:border tablet:border-t-0 tablet:border-border-subtlest-tertiary laptop:border-t">
      <NextSeo {...getProfileSegmentSeo(user, segment, noindex)} />
      <Header
        user={user}
        isSameUser={isSameUser}
        sticky={!hideSticky}
        blockTitle={hasNamePassed ? user.name : undefined}
        isOverCover={coversBlock && !hasCoverPassed}
        showsFollowInBlock={haveSegmentsPassed}
        className={classNames(
          'left-0 top-0 z-3 w-full bg-background-default transition-all duration-75 laptop:hidden',
          !hideSticky ? 'fixed tablet:pl-20' : 'relative',
        )}
      />
      {isSameUser && showProfileCompletion && (
        <ProfileCompletion className="laptop:hidden" />
      )}
      <div ref={stickyRef} />
      <ProfileHeader
        user={user}
        userStats={userStats}
        isSameUser={isSameUser}
        avatarBadge={<LfgProfileAvatarBadge userId={user.id} />}
        isPreviewMode={isPreviewMode}
        coversBlock={coversBlock}
        coverRef={coverRef}
        nameRef={nameRef}
      />
      <div className="flex flex-col divide-y divide-border-subtlest-tertiary px-4 py-6 tablet:px-6">
        {shouldShowBanner && (
          <AutofillProfileBanner
            onUpload={onUpload}
            isLoading={status === 'pending'}
          />
        )}
        {!shouldShowBanner && <div />}
        {isPhone && (
          <div ref={segmentsRef} className="-mx-4 [&+*]:!border-t-0">
            {segments}
            {haveSegmentsPassed && <ShellDockedRow>{segments}</ShellDockedRow>}
          </div>
        )}
        {SegmentFeed ? (
          // At least a screen tall, so a short view cannot pull the hero
          // back down while the row is docked.
          <div className="-mx-4 -mb-6 min-h-[calc(100dvh-var(--shell-top,0px))]">
            <SegmentFeed user={user} />
          </div>
        ) : (
          <>
            <AboutMe user={user} />
            <LfgProfileSection userId={user.id} name={user.name} />
            <ProfileAchievementShowcase user={user} />
            <ProfileUserStack user={user} />
            {!isPhone && (
              <div className="hidden tablet:block">
                <Activity user={user} />
              </div>
            )}
            {isSameUser && (
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
          </>
        )}
      </div>
    </div>
  );
};
