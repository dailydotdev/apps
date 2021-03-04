import React, { ReactElement, useContext, useState } from 'react';
import { Props as ModalProps } from './StyledModal';
import ResponsiveModal, { responsiveModalBreakpoint } from './ResponsiveModal';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
import XIcon from '../../icons/x.svg';
import { ProfileHeading } from '../utilities';
import EditImageWithJoinedDate from '../profile/EditImageWithJoinedDate';
import AuthContext from '../../contexts/AuthContext';
import ProfileForm from '../profile/ProfileForm';
import { typoFootnote } from '../../styles/typography';
import {
  cookiePolicy,
  faq,
  privacyPolicy,
  reportIssue,
  requestFeature,
  termsOfService,
} from '../../lib/constants';
import Button, { ButtonProps } from '../buttons/Button';

const headerHeight = sizeN(12);

const MyModal = styled(ResponsiveModal)`
  .Modal {
    padding: ${headerHeight} 0 0;

    ${responsiveModalBreakpoint} {
      max-height: 40rem;
      padding-top: 0;
    }
  }
`;

const Header = styled.header`
  position: fixed;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  height: ${headerHeight};
  align-items: center;
  justify-content: space-between;
  padding: 0 ${sizeN(4)};
  background: var(--theme-background-secondary);
  border-bottom: ${rem(1)} solid var(--theme-divider-tertiary);
  z-index: 3;

  ${responsiveModalBreakpoint} {
    position: sticky;
  }
`;

const SaveButton = styled(Button)<ButtonProps<'button'>>`
  height: unset;
  padding-top: ${sizeN(1)};
  padding-bottom: ${sizeN(1)};
`;

const Container = styled.div`
  padding: ${sizeN(6)} ${sizeN(4)} ${sizeN(4)};
`;

const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  margin: -${sizeN(1)} 0;
  padding: 0 ${sizeN(4)} ${sizeN(10)};
`;

const FooterLink = styled.a`
  margin: ${sizeN(1)} 0;
  color: var(--theme-label-tertiary);
  text-decoration: none;
  ${typoFootnote}
`;

const LogoutButton = styled(Button)`
  align-self: flex-start;
  margin-top: ${sizeN(5)};
`;

export default function AccountDetailsModal(props: ModalProps): ReactElement {
  const { user, logout } = useContext(AuthContext);

  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);

  return (
    <MyModal {...props}>
      <Header>
        <Button
          title="Close"
          onClick={props.onRequestClose}
          icon={<XIcon />}
          className="btn-tertiary"
        />
        <SaveButton
          buttonSize="small"
          type="submit"
          disabled={disableSubmit}
          form="profileForm"
          className="btn-primary"
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
        <LogoutButton
          onClick={logout}
          buttonSize="small"
          className="btn-tertiary"
        >
          Logout
        </LogoutButton>
      </Footer>
    </MyModal>
  );
}
