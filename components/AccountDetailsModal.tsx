import React, { ReactElement, useContext, useState } from 'react';
import { Props as ModalProps } from './StyledModal';
import ResponsiveModal from './ResponsiveModal';
import styled from 'styled-components';
import {
  size1,
  size10,
  size2,
  size4,
  size5,
  size6,
  sizeN,
} from '../styles/sizes';
import XIcon from '../icons/x.svg';
import { HollowButton, IconButton, InvertButton } from './Buttons';
import { ProfileHeading } from './utilities';
import EditImageWithJoinedDate from './EditImageWithJoinedDate';
import AuthContext from './AuthContext';
import ProfileForm from './ProfileForm';
import { mobileL } from '../styles/media';
import { typoMicro1, typoNuggets } from '../styles/typography';
import {
  cookiePolicy,
  faq,
  privacyPolicy,
  reportIssue,
  requestFeature,
  termsOfService,
} from '../lib/constants';

const MyModal = styled(ResponsiveModal)`
  .Modal {
    padding: 0;

    ${mobileL} {
      max-height: 40rem;
    }
  }
`;

const Header = styled.header`
  position: sticky;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  height: ${sizeN(12)};
  align-items: center;
  justify-content: space-between;
  padding: 0 ${size4};
  background: var(--theme-background-secondary);
  border-bottom: 0.063rem solid var(--theme-separator);
  z-index: 3;
`;

const SaveButton = styled(InvertButton)`
  height: unset;
  padding-top: ${size1};
  padding-bottom: ${size1};
`;

const Container = styled.div`
  padding: ${size6} ${size4} ${size4};
`;

const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  margin: -${size1} 0;
  padding: 0 ${size4} ${size10};
`;

const FooterLink = styled.a`
  margin: ${size1} 0;
  color: var(--theme-secondary);
  text-decoration: none;
  ${typoMicro1}
`;

const LogoutButton = styled(HollowButton)`
  align-self: flex-start;
  margin-top: ${size5};
  padding: ${size2} ${size4};
  border-radius: ${size2};
  ${typoNuggets}
`;

export default function AccountDetailsModal(props: ModalProps): ReactElement {
  const { user, logout } = useContext(AuthContext);

  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);

  return (
    <MyModal {...props}>
      <Header>
        <IconButton title="Close" onClick={props.onRequestClose}>
          <XIcon />
        </IconButton>
        <SaveButton type="submit" disabled={disableSubmit} form="profileForm">
          Save changes
        </SaveButton>
      </Header>
      <Container>
        <ProfileHeading>Account Details</ProfileHeading>
        <EditImageWithJoinedDate user={user} />
        <ProfileForm
          id="profileForm"
          setDisableSubmit={setDisableSubmit}
          onSuccessfulSubmit={() => props.onRequestClose(null)}
          updateMode={true}
        />
      </Container>
      <Footer>
        <FooterLink href={faq} target="_blank" rel="noopener noreferrer">
          FAQ
        </FooterLink>
        <FooterLink
          href={requestFeature}
          target="_blank"
          rel="noopener noreferrer"
        >
          Request a feature
        </FooterLink>
        <FooterLink
          href={reportIssue}
          target="_blank"
          rel="noopener noreferrer"
        >
          Report an issue
        </FooterLink>
        <FooterLink
          href={privacyPolicy}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy policy
        </FooterLink>
        <FooterLink
          href={cookiePolicy}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cookie policy
        </FooterLink>
        <FooterLink
          href={termsOfService}
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of service
        </FooterLink>
        <LogoutButton onClick={logout}>Logout</LogoutButton>
      </Footer>
    </MyModal>
  );
}
