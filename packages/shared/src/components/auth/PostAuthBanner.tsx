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
  targetId?: string;
}

export const PostAuthBanner = ({
  targetId,
}: PostAuthBannerProps = {}): ReactElement => {
  const searchParams = useSearchParams();
  const { geo } = useAuthContext();

  const userId = searchParams?.get('userid');

  if (userId) {
    return <UserPersonalizedBanner userId={userId} targetId={targetId} />;
  }

  const social = getSocialReferrer();
  if (social) {
    return <SocialPersonalizedBanner site={social} targetId={targetId} />;
  }

  if (geo?.region) {
    return <GeoPersonalizedBanner geo={geo.region} targetId={targetId} />;
  }

  return <AuthenticationBanner targetId={targetId} />;
};
