import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { StyledModal, ModalProps } from '../modals/StyledModal';
import styles from './AuthModal.module.css';
import AuthModalHeading from './AuthModalHeading';
import AuthOptions, { AuthDisplay as Display } from './AuthOptions';
import useAuthForms from '../../hooks/useAuthForms';
import FeaturesContext from '../../contexts/FeaturesContext';
import { AuthVersion } from '../../lib/featureValues';
import DailyCircle from '../DailyCircle';
import AuthContext from '../../contexts/AuthContext';
import { AuthEventNames, AuthTriggersOrString } from '../../lib/auth';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { LoginTrigger } from '../../lib/analytics';

export type AuthModalProps = { trigger?: AuthTriggersOrString } & ModalProps;

const DiscardActionModal = dynamic(
  () => import('../modals/DiscardActionModal'),
);

const containerMargin = {
  v1: 'ml-auto',
  v2: 'm-auto',
};

export default function AuthModal({
  className,
  trigger,
  onRequestClose,
  children,
  ...props
}: AuthModalProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [showOptionsOnly, setShowOptionsOnly] = useState(
    trigger === LoginTrigger.CreateFeedFilters,
  );
  const [screenValue, setScreenValue] = useState<Display>(Display.Default);
  const { authVersion } = useContext(FeaturesContext);
  const { user, closeLogin, logout } = useContext(AuthContext);
  const onClose = (e) => {
    trackEvent({
      event_name: AuthEventNames.CloseSignUp,
      extra: JSON.stringify({ trigger, screenValue }),
    });
    onRequestClose(e);
  };

  const closeAndLogout = (e) => {
    if (user) {
      logout();
    }
    onClose(e);
  };

  const {
    onDiscardAttempt,
    onDiscardCanceled,
    onContainerChange,
    formRef,
    container,
    isDiscardOpen,
  } = useAuthForms({
    onDiscard: onClose,
  });
  const isLogoutFlow = trigger === 'legacy_logout';
  const isV1 = authVersion === AuthVersion.V1;

  return (
    <StyledModal
      {...props}
      overlayRef={onContainerChange}
      onRequestClose={onDiscardAttempt}
      className={classNames(styles.authModal, className)}
      contentClassName={classNames(
        'auth',
        authVersion,
        (authVersion === 'v4' || showOptionsOnly) && 'hiddenHeadings',
      )}
      style={{}}
    >
      {isV1 && !showOptionsOnly && (
        <>
          <div className="hidden laptop:flex z-1 flex-col flex-1 gap-5 p-10 h-full">
            {isLogoutFlow ? (
              <>
                <AuthModalHeading className="typo-giga1">
                  Welcome back
                </AuthModalHeading>
                <AuthModalHeading className="mb-4 typo-title2">
                  We have upgraded our authentication system so we need you to
                  log back in.
                </AuthModalHeading>
              </>
            ) : (
              <AuthModalHeading className="typo-giga1">
                Unlock the full power of daily.dev
              </AuthModalHeading>
            )}

            <AuthModalHeading emoji="🧙‍♀️" className="mt-4 typo-title2" tag="h2">
              600+ sources, one feed
            </AuthModalHeading>
            <AuthModalHeading emoji="👩‍💻" className="typo-title2" tag="h2">
              Loved by 150K+ developers
            </AuthModalHeading>
            <AuthModalHeading emoji="🔮" className="typo-title2" tag="h2">
              Personalize your feed!
            </AuthModalHeading>
          </div>
          <div className="flex absolute bottom-0 left-1/2 flex-col translate-y-1/2 -translate-x-[40%] w-[26rem] h-[26rem]">
            <div className="relative">
              <DailyCircle
                className="absolute top-0 right-1/2 translate-x-full -translate-y-full"
                size="xsmall"
              />
              <DailyCircle size="large" />
            </div>
          </div>
        </>
      )}
      <AuthOptions
        version={authVersion}
        className={classNames('h-full', containerMargin[authVersion])}
        onClose={onDiscardAttempt}
        formRef={formRef}
        onSuccessfulLogin={closeLogin}
        onShowOptionsOnly={(value: boolean) => setShowOptionsOnly(value)}
        trigger={trigger}
        isLoginFlow={isLogoutFlow}
        onDisplayChange={(display: Display) => setScreenValue(display)}
      />
      {isDiscardOpen && (
        <DiscardActionModal
          isOpen={isDiscardOpen}
          rightButtonAction={onDiscardCanceled}
          leftButtonAction={closeAndLogout}
          parentSelector={() => container}
          onRequestClose={onDiscardCanceled}
          title="Discard changes?"
          description="If you leave your changes will not be saved"
          leftButtonText="Leave"
          rightButtonText="Stay"
          rightButtonClass="btn-primary-cabbage"
        />
      )}
    </StyledModal>
  );
}
