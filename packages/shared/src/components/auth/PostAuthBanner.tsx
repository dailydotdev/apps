import React, { ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { feature } from '../../lib/featureManagement';
import { checkIsBrowser, checkIsExtension, UserAgent } from '../../lib/func';
import { AuthExtensionBanner } from './AuthExtensionBanner';
import { AuthenticationBanner } from './AuthenticationBanner';
import { useConditionalFeature } from '../../hooks';
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

export const PostAuthBanner = (): ReactElement => {
  const searchParams = useSearchParams();
  const { geo } = useAuthContext();
  const isCompatibleBrowser =
    (checkIsBrowser(UserAgent.Chrome) || checkIsBrowser(UserAgent.Edge)) &&
    !checkIsExtension();

  const { value: showExtensionCTA } = useConditionalFeature({
    feature: feature.postBannerExtensionPrompt,
    shouldEvaluate: isCompatibleBrowser,
  });

  // const { value: showPersonalizedBanner } = useConditionalFeature({
  //   feature: feature.postPersonalizedBanner,
  //   shouldEvaluate: isCompatibleBrowser,
  // });

  if (showExtensionCTA) {
    return <AuthExtensionBanner />;
  }

  // if (showPersonalizedBanner) {
  const userId = searchParams.get('userid');

  if (userId) {
    return <UserPersonalizedBanner userId={userId} />;
  }

  const social = getSocialReferrer();
  if (social) {
    return <SocialPersonalizedBanner site={social} />;
  }

  if (geo?.region) {
    return <GeoPersonalizedBanner geo={geo.region} />;
  }
  // }
  return <AuthenticationBanner />;
};
