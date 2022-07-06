import React, { ReactElement } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { StyledModal, ModalProps } from '../modals/StyledModal';
import Circles from '../../../icons/circles_bg.svg';
import styles from './AuthModal.module.css';
import AuthModalHeading from './AuthModalHeading';
import AuthOptions from './AuthOptions';
import useAuthForms from '../../hooks/useAuthForms';

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
  const {
    onDiscardAttempt,
    onDiscardCancelled,
    onContainerChange,
    onSocialProviderChange,
    formRef,
    socialAccount,
    container,
    isDiscardOpen,
  } = useAuthForms({
    onDiscard: onRequestClose,
  });

  return (
    <StyledModal
      {...props}
      overlayRef={onContainerChange}
      onRequestClose={onDiscardAttempt}
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
        onClose={onDiscardAttempt}
        onSelectedProvider={onSocialProviderChange}
        formRef={formRef}
        socialAccount={socialAccount}
      />
      {isDiscardOpen && (
        <DiscardActionModal
          isOpen={isDiscardOpen}
          onDiscard={onRequestClose}
          parentSelector={() => container}
          onRequestClose={onDiscardCancelled}
          title="Discard changes?"
          description="If you leave your changes will not be saved"
          leftButtonText="Stay"
          rightButtonText="Leave"
        />
      )}
    </StyledModal>
  );
}
