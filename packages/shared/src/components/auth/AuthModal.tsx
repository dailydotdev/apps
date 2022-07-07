import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { StyledModal, ModalProps } from '../modals/StyledModal';
import Circles from '../../../icons/circles_bg.svg';
import styles from './AuthModal.module.css';
import AuthModalHeading from './AuthModalHeading';
import AuthOptions from './AuthOptions';
import useAuthForms from '../../hooks/useAuthForms';
import FeaturesContext from '../../contexts/FeaturesContext';

export type AuthModalProps = ModalProps;

const DiscardActionModal = dynamic(
  () => import('../modals/DiscardActionModal'),
);

const containerMargin = {
  v1: 'ml-auto',
  v2: 'm-auto',
};

export default function AuthModal({
  className,
  onRequestClose,
  children,
  ...props
}: AuthModalProps): ReactElement {
  const { authVersion } = useContext(FeaturesContext);
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
  const isV1 = authVersion === 'v1';

  return (
    <StyledModal
      {...props}
      overlayRef={onContainerChange}
      onRequestClose={onDiscardAttempt}
      className={classNames(styles.authModal, className)}
      contentClassName={classNames('auth', authVersion)}
    >
      {isV1 && (
        <>
          <div className="flex flex-col flex-1 gap-5 p-10 h-full">
            <AuthModalHeading className="typo-giga1">
              Unlock the full power of daily.dev
            </AuthModalHeading>
            <AuthModalHeading emoji="🧙‍♀️" className="mt-4 typo-title2" tag="h2">
              400+ Sources, one feed
            </AuthModalHeading>
            <AuthModalHeading emoji="👩‍💻" className="typo-title2" tag="h2">
              Used by 150k+ Developers
            </AuthModalHeading>
            <AuthModalHeading emoji="🔮" className="typo-title2" tag="h2">
              Customize your feed!
            </AuthModalHeading>
          </div>
          <Circles
            className={classNames(
              'absolute z-0 h-96 w-[32.5rem]',
              styles.circles,
            )}
          />
        </>
      )}
      <AuthOptions
        className={classNames('h-full', containerMargin[authVersion])}
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
