import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { NextSeo } from 'next-seo';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import type { ProfileSegment } from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import {
  useIsPhone,
  useIsPhoneSettled,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import type { ProfileLayoutProps } from './index';
import { getProfileSegmentSeo } from './index';
import { ProfilePage } from './ProfilePage';

interface ProfileSegmentPageProps extends ProfileLayoutProps {
  segment: ProfileSegment;
  title: string;
  feed: ComponentType<{ user: PublicProfile }>;
}

// A profile segment's own address. A phone gets the profile page with the
// segment open, tablet and up the segment's feed on its own. Until the
// viewport is known (the server HTML and the first client render) both
// render and CSS shows the one that fits.
export const ProfileSegmentPage = ({
  segment,
  title,
  feed: Feed,
  ...props
}: ProfileSegmentPageProps): ReactElement | null => {
  const { user, noindex } = props;
  const isPhone = useIsPhone();
  const isPhoneSettled = useIsPhoneSettled();

  if (!user) {
    return null;
  }

  return (
    <>
      {(isPhone || !isPhoneSettled) && (
        <div className={classNames(!isPhoneSettled && 'tablet:hidden')}>
          <ProfilePage {...props} segment={segment} />
        </div>
      )}
      {!isPhone && (
        <div className={classNames(!isPhoneSettled && 'hidden tablet:block')}>
          <NextSeo {...getProfileSegmentSeo(user, segment, noindex)} />
          <GoBackHeaderMobile title={title} />
          <Feed user={user} />
        </div>
      )}
    </>
  );
};
