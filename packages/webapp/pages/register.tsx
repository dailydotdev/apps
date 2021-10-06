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
import {
  logSignupFormStart,
  logSignupFormSubmit,
} from '@dailydotdev/shared/src/lib/analytics';
import MainLayout from '../components/layouts/MainLayout';

export default function Register(): ReactElement {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);

  useEffect(() => {
    logSignupFormStart();
  }, []);

  const onSuccessfulSubmit = async (optionalFields: boolean) => {
    await logSignupFormSubmit(optionalFields);
    await router?.replace((router.query.redirect_uri as string) || '/');
  };

  return (
    <MainLayout showOnlyLogo>
      <NextSeo title="Registration" nofollow noindex />
      <ResponsivePageContainer>
        {user && (
          <>
            <ProfileHeading>Set up your profile</ProfileHeading>
            <h2 className="self-start my-2 text-theme-label-tertiary typo-callout">
              Please fill in your details below
            </h2>
            <EditImageWithJoinedDate user={user} />
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
                Finish
              </Button>
              <Button
                className="ml-4 btn-tertiary"
                type="button"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </>
        )}
      </ResponsivePageContainer>
    </MainLayout>
  );
}
