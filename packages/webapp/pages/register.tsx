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
      <NextSeo title="Registration" />
      <ResponsivePageContainer>
        {user && (
          <>
            <ProfileHeading>Set up your profile</ProfileHeading>
            <h2 className="my-2 self-start text-theme-label-tertiary typo-callout">
              Please fill in your details below
            </h2>
            <EditImageWithJoinedDate user={user} />
            <ProfileForm
              id="profileForm"
              setDisableSubmit={setDisableSubmit}
              onSuccessfulSubmit={onSuccessfulSubmit}
              mode={(router?.query.mode as RegistrationMode) || 'default'}
            />
            <div className="flex mt-10 items-center self-stretch">
              <Button
                className="btn-primary flex-1"
                type="submit"
                disabled={disableSubmit}
                form="profileForm"
              >
                Finish
              </Button>
              <Button
                className="btn-tertiary ml-4"
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
