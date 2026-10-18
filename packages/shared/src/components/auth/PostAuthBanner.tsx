import type { ReactElement } from 'react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { AuthBannerLayout } from './AuthenticationBanner';
import { AuthenticationBanner } from './AuthenticationBanner';
import { getSocialReferrer } from '../../lib/socialMedia';
import { useAuthContext } from '../../contexts/AuthContext';

const UserPersonalizedBanner = dynamic(
  () =>
    import(
      /* webpackChunkName: "userPersonalizedBanner" */ '../marketing/banners/personalized/UserPersonalizedBanner'
    ),
);

const SocialPersonalizedBanner = dynamic(
  /* webpackChunkName: "socialPersonalizedBanner" */ () =>
    import('../marketing/banners/personalized/SocialPersonalizedBanner'),
);

const GeoPersonalizedBanner = dynamic(
  /* webpackChunkName: "geoPersonalizedBanner" */
  () => import('../marketing/banners/personalized/GeoPersonalizedBanner'),
);

interface PostAuthBannerProps {
  compact?: boolean;
  targetId?: string;
  layout?: AuthBannerLayout;
}

export const PostAuthBanner = ({
  compact,
  targetId,
  layout,
}: PostAuthBannerProps = {}): ReactElement => {
  const searchParams = useSearchParams();
  const { geo } = useAuthContext();

  const userId = searchParams?.get('userid');

  if (userId) {
    return (
      <UserPersonalizedBanner
        userId={userId}
        compact={compact}
        targetId={targetId}
        layout={layout}
      />
    );
  }

  const social = getSocialReferrer();
  if (social) {
    return (
      <SocialPersonalizedBanner
        site={social}
        compact={compact}
        targetId={targetId}
        layout={layout}
      />
    );
  }

  if (geo?.region) {
    return (
      <GeoPersonalizedBanner
        geo={geo.region}
        compact={compact}
        targetId={targetId}
        layout={layout}
      />
    );
  }

  return (
    <AuthenticationBanner
      compact={compact}
      targetId={targetId}
      layout={layout}
    />
  );
};
