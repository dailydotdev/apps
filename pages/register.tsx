import React, { ReactElement, useContext, useState } from 'react';
import styled from 'styled-components';
import { NextSeo } from 'next-seo';
import Index from '../components/layouts/MainLayout';
import { typoLil2, typoMicro2 } from '../styles/typography';
import { size10, size2, size4 } from '../styles/sizes';
import { PageContainer, ProfileHeading } from '../components/utilities';
import { HollowButton, InvertButton } from '../components/Buttons';
import AuthContext from '../components/AuthContext';
import { useRouter } from 'next/router';
import EditImageWithJoinedDate from '../components/profile/EditImageWithJoinedDate';
import ProfileForm, {
  RegistrationMode,
} from '../components/profile/ProfileForm';

const Subheading = styled.h2`
  margin: ${size2} 0;
  align-self: flex-start;
  color: var(--theme-secondary);
  ${typoMicro2}
`;

const LogoutButton = styled(HollowButton)`
  margin-right: ${size4};
  padding: ${size2} ${size4};
  border-radius: ${size2};
  ${typoLil2}
`;

const FormButtons = styled.div`
  display: flex;
  margin-top: ${size10};
  align-items: center;
  align-self: stretch;

  /* stylelint-disable-next-line no-descending-specificity */
  ${InvertButton} {
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
              <LogoutButton type="button" onClick={logout}>
                Logout
              </LogoutButton>
              <InvertButton
                type="submit"
                disabled={disableSubmit}
                form="profileForm"
              >
                Finish
              </InvertButton>
            </FormButtons>
          </>
        )}
      </PageContainer>
    </Index>
  );
}
