import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from '../../../components/buttons/Button';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { isIOS } from '../../../lib/func';
import { providerMap, SocialProvider } from '../../../components/auth/common';
import { useLogContext } from '../../../contexts/LogContext';
import { AuthEventNames } from '../../../lib/auth';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { cookiePolicy, termsOfService } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { isWebView } from '../../../components/auth/OnboardingRegistrationForm';
import { FunnelTargetId } from '../types/funnelEvents';

interface MobileSocialRegistrationProps {
  onClick: (provider: SocialProvider) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function SocialRegistration({
  onClick,
  isLoading,
  isDisabled,
}: MobileSocialRegistrationProps): ReactElement {
  const { logEvent } = useLogContext();
  const confirmedIOS = isIOS();
  const firstProvider = (() => {
    const inAppBrowser = isWebView();

    if (!inAppBrowser) {
      return SocialProvider.Google;
    }

    if (confirmedIOS) {
      return SocialProvider.Apple;
    }

    return SocialProvider.Facebook;
  })();

  const handleClick = (provider: SocialProvider) => {
    logEvent({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: provider,
      extra: JSON.stringify({ trigger: 'funnel registration' }),
    });
    onClick(provider);
  };

  const props: ButtonProps<'button'> = {
    className: 'w-full',
    disabled: isDisabled,
    loading: isLoading,
    size: ButtonSize.XLarge,
    variant: ButtonVariant.Primary,
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        {...props}
        onClick={() => handleClick(firstProvider)}
        data-testid={`social-button-${firstProvider.toLowerCase()}`}
        icon={providerMap[firstProvider].icon}
        data-funnel-track={FunnelTargetId.SignupProvider}
      >
        Sign up with {providerMap[firstProvider].label}
      </Button>
      <Button
        {...props}
        onClick={() => handleClick(SocialProvider.GitHub)}
        data-testid="social-button-github"
        icon={providerMap[SocialProvider.GitHub].icon}
        data-funnel-track={FunnelTargetId.SignupProvider}
      >
        Sign up with {providerMap[SocialProvider.GitHub].label}
      </Button>
      <Typography
        className="mt-1 text-center"
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
      >
        By continuing, you agree to the{' '}
        <Typography
          tag={TypographyTag.Link}
          href={termsOfService}
          rel={anchorDefaultRel}
          target="_blank"
        >
          Terms of Service
        </Typography>{' '}
        and{' '}
        <Typography
          tag={TypographyTag.Link}
          href={cookiePolicy}
          rel={anchorDefaultRel}
          target="_blank"
        >
          Privacy Policy
        </Typography>
        .
      </Typography>
    </div>
  );
}
