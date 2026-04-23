import type { ReactElement } from 'react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AuthenticationBanner } from './AuthenticationBanner';
import { getSocialReferrer } from '../../lib/socialMedia';
import { useAuthContext } from '../../contexts/AuthContext';

const UserPersonalizedBanner = dynamic(
  () =>
    import(
      /* webpackChunkName: "userPersonalizedBanner" */ '../banners/personalized/UserPersonalizedBanner'
    ),
);

const SocialPersonalizedBanner = dynamic(
  /* webpackChunkName: "socialPersonalizedBanner" */ () =>
    import('../banners/personalized/SocialPersonalizedBanner'),
);

const GeoPersonalizedBanner = dynamic(
  /* webpackChunkName: "geoPersonalizedBanner" */
  () => import('../banners/personalized/GeoPersonalizedBanner'),
);

interface PostAuthBannerProps {
  compact?: boolean;
}

export const PostAuthBanner = ({
  compact,
}: PostAuthBannerProps = {}): ReactElement => {
  const searchParams = useSearchParams();
  const { geo } = useAuthContext();

  const userId = searchParams?.get('userid');

  if (userId) {
    return <UserPersonalizedBanner userId={userId} compact={compact} />;
  }

  const social = getSocialReferrer();
  if (social) {
    return <SocialPersonalizedBanner site={social} compact={compact} />;
  }

  if (geo?.region) {
    return <GeoPersonalizedBanner geo={geo.region} compact={compact} />;
  }

  return <AuthenticationBanner compact={compact} />;
};
