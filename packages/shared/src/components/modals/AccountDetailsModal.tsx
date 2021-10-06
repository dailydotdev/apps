import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import XIcon from '../../../icons/x.svg';
import EditImageWithJoinedDate from '../profile/EditImageWithJoinedDate';
import AuthContext from '../../contexts/AuthContext';
import ProfileForm from '../profile/ProfileForm';
import {
  cookiePolicy,
  faq,
  privacyPolicy,
  reportIssue,
  requestFeature,
  termsOfService,
} from '../../lib/constants';
import { Button } from '../buttons/Button';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { ProfileHeading } from '../utilities';
import styles from './AccountDetailsModal.module.css';
import classed from '../../lib/classed';

const FooterLink = classed(
  'a',
  'my-1 text-theme-label-tertiary no-underline typo-footnote',
);

export default function AccountDetailsModal({
  className,
  ...props
}: ModalProps): ReactElement {
  const { user, logout } = useContext(AuthContext);

  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);

  return (
    <ResponsiveModal
      className={classNames(className, styles.accountDetailsModal)}
      {...props}
    >
      <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 justify-between items-center px-4 w-full h-12 border-b bg-theme-bg-secondary border-theme-divider-tertiary">
        <Button
          title="Close"
          onClick={props.onRequestClose}
          icon={<XIcon />}
          className="btn-tertiary"
        />
        <Button
          buttonSize="small"
          type="submit"
          disabled={disableSubmit}
          form="profileForm"
          className="btn-primary"
        >
          Save changes
        </Button>
      </header>
      <div className="px-4 pt-6 pb-4">
        <ProfileHeading>Account Details</ProfileHeading>
        <EditImageWithJoinedDate user={user} />
        <ProfileForm
          id="profileForm"
          setDisableSubmit={setDisableSubmit}
          onSuccessfulSubmit={() => props.onRequestClose(null)}
          mode="update"
        />
      </div>
      <footer className="flex flex-col px-4 pb-10 -my-1">
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
        <Button
          onClick={logout}
          buttonSize="small"
          className="self-start mt-5 btn-tertiary"
        >
          Logout
        </Button>
      </footer>
    </ResponsiveModal>
  );
}
