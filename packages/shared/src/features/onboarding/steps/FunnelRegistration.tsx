import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import {
  Typography,
  TypographyTag,
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
import { AuthEventNames, isNativeAuthSupported } from '../../../lib/auth';
import { useLogContext } from '../../../contexts/LogContext';
import { broadcastChannel } from '../../../lib/constants';
import Logo, { LogoPosition } from '../../../components/Logo';
import type { LoggedUser } from '../../../lib/user';

interface FunnelRegistrationProps {
  onSuccess: (isPlus?: boolean) => void;
}

const supportedEvents = [AuthEvent.SocialRegistration, AuthEvent.Login];

const useRegistrationListeners = (
  onSuccess: FunnelRegistrationProps['onSuccess'],
) => {
  const { displayToast } = useToastNotification();
  const { refetchBoot } = useAuthContext();
  const { logEvent } = useLogContext();

  const onProviderMessage = async (e: MessageEvent) => {
    const isEventSupported = supportedEvents.includes(e.data?.eventKey);

    if (!isEventSupported) {
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
    const user = bootResponse?.data?.user;

    if (!user || !('providers' in user)) {
      return displayToast(labels.auth.error.generic);
    }

    const isPlus = (bootResponse?.data?.user as LoggedUser)?.isPlus;

    return onSuccess(isPlus);
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
  const windowPopup = useRef<Window>(null);
  const { onSocialRegistration } = useRegistration({
    key: ['registration_funnel'],
    onRedirectFail: () => {
      windowPopup.current.close();
      windowPopup.current = null;
    },
    onRedirect: (redirect) => {
      windowPopup.current.location.href = redirect;
    },
  });

  const onRegister = (provider: SocialProvider) => {
    if (!isNativeAuthSupported(provider)) {
      windowPopup.current = window.open();
    }
    onSocialRegistration(provider);
  };

  useRegistrationListeners(onSuccess);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 h-3/5 w-full bg-gradient-to-t from-surface-invert via-surface-invert via-70% to-transparent to-90%" />
        <img
          className="pointer-events-none -z-1 w-full"
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
          <Typography tag={TypographyTag.Span} bold>
            Let&apos;s get things set up
          </Typography>
        </Typography>
        <MobileSocialRegistration onClick={onRegister} />
      </div>
    </div>
  );
}
