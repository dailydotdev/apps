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
  const isMobile = useViewSize(ViewSize.MobileL);
  const { onSocialRegistration } = useRegistration({
    key: ['registration_funnel'],
  });

  const onRegister = (provider: SocialProvider) => {
    onSocialRegistration(provider);
  };

  useRegistrationListeners(onSuccess);

  return (
    <div className="relative flex w-full max-w-70 flex-col items-center">
      <img alt="background" src={isMobile ? mobileBg : desktopBg} />
      <div className="mt-auto flex flex-col items-center gap-6 p-6">
        <Logo position={LogoPosition.Relative} />

        <Typography
          type={TypographyType.Title2}
          className="text-center"
          data-testid="registration-title"
        >
          Yes, this is the signup screen
          <br />
          Let&apos;s get things set up
        </Typography>
        <MobileSocialRegistration onClick={onRegister} />
      </div>
    </div>
  );
}
