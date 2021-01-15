import React, { ReactElement, useContext, useState } from 'react';
import { Props as ModalProps } from './StyledModal';
import ResponsiveModal from './ResponsiveModal';
import styled from 'styled-components/macro';
import {
  size1,
  size10,
  size1px,
  size4,
  size5,
  size6,
  sizeN,
} from '../../styles/sizes';
import XIcon from '../../icons/x.svg';
import { ProfileHeading } from '../utilities';
import EditImageWithJoinedDate from '../profile/EditImageWithJoinedDate';
import AuthContext from '../AuthContext';
import ProfileForm from '../profile/ProfileForm';
import { mobileL } from '../../styles/media';
import { typoFootnote } from '../../styles/typography';
import {
  cookiePolicy,
  faq,
  privacyPolicy,
  reportIssue,
  requestFeature,
  termsOfService,
} from '../../lib/constants';
import TertiaryButton from '../buttons/TertiaryButton';
import PrimaryButton from '../buttons/PrimaryButton';
import { ButtonProps } from '../buttons/BaseButton';

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
  border-bottom: ${size1px} solid var(--theme-divider-tertiary);
  z-index: 3;
`;

const SaveButton = styled(PrimaryButton)<ButtonProps<'button'>>`
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
  color: var(--theme-label-tertiary);
  text-decoration: none;
  ${typoFootnote}
`;

const LogoutButton = styled(TertiaryButton).attrs({ buttonSize: 'small' })<
  ButtonProps<'button'>
>`
  align-self: flex-start;
  margin-top: ${size5};
`;

export default function AccountDetailsModal(props: ModalProps): ReactElement {
  const { user, logout } = useContext(AuthContext);

  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);

  return (
    <MyModal {...props}>
      <Header>
        <TertiaryButton
          title="Close"
          onClick={props.onRequestClose}
          icon={<XIcon />}
        />
        <SaveButton
          buttonSize="small"
          type="submit"
          disabled={disableSubmit}
          form="profileForm"
        >
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
          mode="update"
        />
      </Container>
      <Footer>
        <FooterLink href={faq} target="_blank" rel="noopener">
          FAQ
        </FooterLink>
        <FooterLink href={requestFeature} target="_blank" rel="noopener">
          Request a feature
        </FooterLink>
        <FooterLink href={reportIssue} target="_blank" rel="noopener">
          Report an issue
        </FooterLink>
        <FooterLink href={privacyPolicy} target="_blank" rel="noopener">
          Privacy policy
        </FooterLink>
        <FooterLink href={cookiePolicy} target="_blank" rel="noopener">
          Cookie policy
        </FooterLink>
        <FooterLink href={termsOfService} target="_blank" rel="noopener">
          Terms of service
        </FooterLink>
        {user.premium && (
          <FooterLink
            href="mailto:support@daily.dev?subject=Cancel my premium subscription"
            target="_blank"
            rel="noopener"
          >
            Cancel subscription
          </FooterLink>
        )}
        <LogoutButton onClick={logout}>Logout</LogoutButton>
      </Footer>
    </MyModal>
  );
}
