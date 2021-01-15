import React, { ReactElement, useContext, useState } from 'react';
import styled from 'styled-components';
import { NextSeo } from 'next-seo';
import Index from '../components/layouts/MainLayout';
import { typoCallout } from '../styles/typography';
import { size10, size2, size4 } from '../styles/sizes';
import { PageContainer, ProfileHeading } from '../components/utilities';
import AuthContext from '../components/AuthContext';
import { useRouter } from 'next/router';
import EditImageWithJoinedDate from '../components/profile/EditImageWithJoinedDate';
import ProfileForm, {
  RegistrationMode,
} from '../components/profile/ProfileForm';
import TertiaryButton from '../components/buttons/TertiaryButton';
import { ButtonProps } from '../components/buttons/BaseButton';
import PrimaryButton from '../components/buttons/PrimaryButton';

const Subheading = styled.h2`
  margin: ${size2} 0;
  align-self: flex-start;
  color: var(--theme-label-tertiary);
  ${typoCallout}
`;

const LogoutButton = styled(TertiaryButton)<ButtonProps<'button'>>`
  margin-left: ${size4};
`;

const FormButtons = styled.div`
  display: flex;
  margin-top: ${size10};
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
    <Index showOnlyLogo={true}>
      <NextSeo title="Registration" />
      <PageContainer>
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
              <PrimaryButton
                type="submit"
                disabled={disableSubmit}
                form="profileForm"
              >
                Finish
              </PrimaryButton>
              <LogoutButton type="button" onClick={logout}>
                Logout
              </LogoutButton>
            </FormButtons>
          </>
        )}
      </PageContainer>
    </Index>
  );
}
