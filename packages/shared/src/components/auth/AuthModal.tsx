import React, { ReactElement, useRef, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { StyledModal, ModalProps } from '../modals/StyledModal';
import Circles from '../../../icons/circles_bg.svg';
import styles from './AuthModal.module.css';
import {
  RegistrationFormValues,
  SocialProviderAccount,
} from './RegistrationForm';
import { formToJson } from '../../lib/form';
import AuthModalHeading from './AuthModalHeading';
import AuthOptions from './AuthOptions';
import { CloseModalFunc } from '../modals/common';

export type AuthModalProps = ModalProps;

const DiscardActionModal = dynamic(
  () => import('../modals/DiscardActionModal'),
);

export default function AuthModal({
  className,
  onRequestClose,
  children,
  ...props
}: AuthModalProps): ReactElement {
  const [container, setContainer] = useState<HTMLDivElement>();
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [socialAccount, setSocialAccount] = useState<SocialProviderAccount>();
  const formRef = useRef<HTMLFormElement>();

  const onClose: CloseModalFunc = (e) => {
    if (!formRef?.current) {
      return onRequestClose(e);
    }

    if (socialAccount) {
      return onRequestClose(e);
    }

    const { email: emailAd, ...rest } = formToJson<RegistrationFormValues>(
      formRef.current,
      {},
    );
    const values = Object.values(rest);

    if (values.some((value) => !!value)) {
      return setIsDiscardOpen(true);
    }

    return onRequestClose(e);
  };

  return (
    <StyledModal
      {...props}
      overlayRef={setContainer}
      onRequestClose={onClose}
      className={classNames(styles.authModal, className)}
      contentClassName="auth"
    >
      <div className="flex flex-col flex-1 gap-5 p-10 h-full">
        <AuthModalHeading
          className="typo-giga1"
          title="Unlock the full power of daily.dev"
        />
        <AuthModalHeading
          emoji="🧙‍♀️"
          className="mt-4 typo-title2"
          title="400+ Sources, one feed"
          tag="h2"
        />
        <AuthModalHeading
          emoji="👩‍💻"
          className="typo-title2"
          title="Used by 150k+ Developers"
          tag="h2"
        />
        <AuthModalHeading
          emoji="🔮"
          className="typo-title2"
          title="Customize your feed!"
          tag="h2"
        />
      </div>
      <Circles
        className={classNames('absolute z-0 h-96 w-[32.5rem]', styles.circles)}
      />
      <AuthOptions
        onClose={onClose}
        onSelectedProvider={setSocialAccount}
        formRef={formRef}
        socialAccount={socialAccount}
      />
      {isDiscardOpen && (
        <DiscardActionModal
          isOpen={isDiscardOpen}
          onDiscard={onRequestClose}
          parentSelector={() => container}
          onRequestClose={(e) => {
            e.stopPropagation();
            setIsDiscardOpen(false);
          }}
          title="Discard changes?"
          description="If you leave your changes will not be saved"
          leftButtonText="Stay"
          rightButtonText="Leave"
        />
      )}
    </StyledModal>
  );
}
