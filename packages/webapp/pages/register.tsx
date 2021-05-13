import React, { ReactElement, useContext, useState } from 'react';
import styled from '@emotion/styled';
import { NextSeo } from 'next-seo';
import MainLayout from '../components/layouts/MainLayout';
import { typoCallout } from '../styles/typography';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import EditImageWithJoinedDate from '@dailydotdev/shared/src/components/profile/EditImageWithJoinedDate';
import ProfileForm, {
  RegistrationMode,
} from '@dailydotdev/shared/src/components/profile/ProfileForm';
import {
  Button,
  ButtonProps,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ResponsivePageContainer,
  ProfileHeading,
} from '@dailydotdev/shared/src/components/utilities';

const Subheading = styled.h2`
  margin: ${sizeN(2)} 0;
  align-self: flex-start;
  color: var(--theme-label-tertiary);
  ${typoCallout}
`;

const LogoutButton = styled(Button)<ButtonProps<'button'>>`
  margin-left: ${sizeN(4)};
`;

const FormButtons = styled.div`
  display: flex;
  margin-top: ${sizeN(10)};
  align-items: center;
  align-self: stretch;

  [type='submit'] {
    flex: 1;
  }
`;

export default function Register(): ReactElement {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [disableSubmit, setDisableSubmit] = useState<boolean>(true);

  const onSuccessfulSubmit = async () => {
    await router?.replace((router.query.redirect_uri as string) || '/');
  };

  return (
    <MainLayout showOnlyLogo={true}>
      <NextSeo title="Registration" />
      <ResponsivePageContainer>
        {user && (
          <>
            <ProfileHeading>Set up your profile</ProfileHeading>
            <Subheading>Please fill in your details below</Subheading>
            <EditImageWithJoinedDate user={user} />
            <ProfileForm
              id="profileForm"
              setDisableSubmit={setDisableSubmit}
              onSuccessfulSubmit={onSuccessfulSubmit}
              mode={(router?.query.mode as RegistrationMode) || 'default'}
            />
            <FormButtons>
              <Button
                className="btn-primary"
                type="submit"
                disabled={disableSubmit}
                form="profileForm"
              >
                Finish
              </Button>
              <LogoutButton
                className="btn-tertiary"
                type="button"
                onClick={logout}
              >
                Logout
              </LogoutButton>
            </FormButtons>
          </>
        )}
      </ResponsivePageContainer>
    </MainLayout>
  );
}
