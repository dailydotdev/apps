import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { MobileSocialRegistration } from '../../common/components/MobileSocialRegistration';
import type { SocialProvider } from '../../../components/auth/common';
import useRegistration from '../../../hooks/useRegistration';
import {
  useEventListener,
  useToastNotification,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import {
  AuthEvent,
  AuthFlow,
  getKratosFlow,
  KRATOS_ERROR,
} from '../../../lib/kratos';
import { useAuthContext } from '../../../contexts/AuthContext';
import { labels } from '../../../lib';
import { AuthEventNames } from '../../../lib/auth';
import { useLogContext } from '../../../contexts/LogContext';
import { broadcastChannel } from '../../../lib/constants';
import Logo, { LogoPosition } from '../../../components/Logo';

interface FunnelRegistrationProps {
  onSuccess: () => void;
}

const useRegistrationListeners = (onSuccess: () => void) => {
  const { displayToast } = useToastNotification();
  const { refetchBoot } = useAuthContext();
  const { logEvent } = useLogContext();

  const onProviderMessage = async (e: MessageEvent) => {
    if (e.data?.eventKey !== AuthEvent.SocialRegistration) {
      return undefined;
    }

    if (e.data?.flow) {
      const connected = await getKratosFlow(AuthFlow.Registration, e.data.flow);

      logEvent({
        event_name: AuthEventNames.RegistrationError,
        extra: JSON.stringify({
          error: {
            flowId: connected?.id,
            messages: connected?.ui?.messages,
          },
          origin: 'window registration flow error',
        }),
      });

      if (
        [
          KRATOS_ERROR.NO_STRATEGY_TO_LOGIN,
          KRATOS_ERROR.NO_STRATEGY_TO_SIGNUP,
          KRATOS_ERROR.EXISTING_USER,
        ].includes(connected?.ui?.messages?.[0]?.id)
      ) {
        return displayToast(labels.auth.error.existingEmail);
      }

      return displayToast(labels.auth.error.generic);
    }

    const bootResponse = await refetchBoot();

    if (!bootResponse.data.user || !('email' in bootResponse.data.user)) {
      logEvent({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({
          error: 'Could not find email on social registration',
        }),
      });
      return displayToast(labels.auth.error.generic);
    }

    return onSuccess();
  };

  useEventListener(broadcastChannel, 'message', onProviderMessage);

  useEventListener(globalThis, 'message', onProviderMessage);
};

const mobileBg =
  'https://media.daily.dev/image/upload/s--r4MiKjLD--/f_auto/v1743601527/public/login%20background';
const desktopBg =
  'https://media.daily.dev/image/upload/s--HeOu0PE_--/f_auto/v1743602053/public/login%20background%20web';

export function FunnelRegistration({
  onSuccess,
}: FunnelRegistrationProps): ReactElement {
  const isTablet = useViewSize(ViewSize.Tablet);
  const { onSocialRegistration } = useRegistration({
    key: ['registration_funnel'],
  });

  const onRegister = (provider: SocialProvider) => {
    onSocialRegistration(provider);
  };

  useRegistrationListeners(onSuccess);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 h-3/5 w-full bg-gradient-to-t from-surface-invert via-surface-invert via-70% to-transparent to-90%" />
        <img
          className="pointer-events-none -z-1"
          alt="background"
          src={isTablet ? desktopBg : mobileBg}
        />
      </div>
      <div className="z-1 mt-auto flex w-full flex-col items-center gap-6 p-6 pt-10 tablet:max-w-96">
        <Logo position={LogoPosition.Relative} />

        <Typography
          type={TypographyType.Title3}
          className="text-center"
          data-testid="registration-title"
        >
          Yes, this is the signup screen
          <br />
          <Typography bold>Let&apos;s get things set up</Typography>
        </Typography>
        <MobileSocialRegistration onClick={onRegister} />
      </div>
    </div>
  );
}
