import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import EditImageWithJoinedDate from '@dailydotdev/shared/src/components/profile/EditImageWithJoinedDate';
import ProfileForm, {
  RegistrationMode,
} from '@dailydotdev/shared/src/components/profile/ProfileForm';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ResponsivePageContainer,
  ProfileHeading,
} from '@dailydotdev/shared/src/components/utilities';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';
import { LOCAL_FEED_SETTINGS_KEY } from '@dailydotdev/shared/src/hooks/useFeedSettings';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import {
  Features,
  getFeatureValue,
  isFeaturedEnabled,
} from '@dailydotdev/shared/src/lib/featureManagement';
import MainLayout from '../components/layouts/MainLayout';

export default function Register(): ReactElement {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const { trackEvent } = useContext(AnalyticsContext);
  const { flags } = useContext(FeaturesContext);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);

  const getSignupModalFeatureValue = (featureFlag: Features) => {
    return getFeatureValue(featureFlag, flags);
  };

  useEffect(() => {
    trackEvent({
      event_name: 'start signup form',
    });
  }, []);

  const onSuccessfulSubmit = async (optionalFields: boolean) => {
    trackEvent({
      event_name: 'submit signup form',
      extra: JSON.stringify({ optional_fields: optionalFields }),
    });
    await router?.replace((router.query.redirect_uri as string) || '/');
  };

  const onCancel = () => {
    storage.removeItem(LOCAL_FEED_SETTINGS_KEY);

    logout();
  };

  return (
    <MainLayout showOnlyLogo>
      <NextSeo title="Registration" nofollow noindex />
      <ResponsivePageContainer>
        {user && (
          <>
            <ProfileHeading>
              {getSignupModalFeatureValue(Features.SignupTitleCopy)}
            </ProfileHeading>
            <h2 className="self-start my-2 text-theme-label-tertiary typo-callout">
              Please fill in your details below
            </h2>
            {!isFeaturedEnabled(Features.HideSignupProfileImage, flags) && (
              <EditImageWithJoinedDate user={user} />
            )}
            <ProfileForm
              id="profileForm"
              setDisableSubmit={setDisableSubmit}
              onSuccessfulSubmit={onSuccessfulSubmit}
              mode={(router?.query.mode as RegistrationMode) || 'default'}
            />
            <div className="flex items-center self-stretch mt-10">
              <Button
                className="flex-1 btn-primary"
                type="submit"
                disabled={disableSubmit}
                form="profileForm"
              >
                {getSignupModalFeatureValue(Features.SignupSubmitButtonCopy)}
              </Button>
              <Button
                className="ml-4 btn-tertiary"
                type="button"
                onClick={onCancel}
              >
                {getSignupModalFeatureValue(Features.SignupLogoutButtonCopy)}
              </Button>
            </div>
          </>
        )}
      </ResponsivePageContainer>
    </MainLayout>
  );
}
