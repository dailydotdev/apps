import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from '../../../components/buttons/Button';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import { isIOSNative } from '../../../lib/func';
import { SocialProvider } from '../../../components/auth/common';
import { useLogContext } from '../../../contexts/LogContext';
import { AuthEventNames } from '../../../lib/auth';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { cookiePolicy, termsOfService } from '../../../lib/constants';
import { anchorDefaultRel, capitalize } from '../../../lib/strings';

interface MobileSocialRegistrationProps {
  onClick: (provider: SocialProvider) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function MobileSocialRegistration({
  onClick,
  isLoading,
  isDisabled,
}: MobileSocialRegistrationProps): ReactElement {
  const { logEvent } = useLogContext();
  const isIosNative = isIOSNative();
  const firstProvider = isIosNative
    ? SocialProvider.Apple
    : SocialProvider.Google;

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
    variant: ButtonVariant.Primary,
    loading: isLoading,
    disabled: isDisabled,
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        {...props}
        onClick={() => handleClick(firstProvider)}
        data-testid={`social-button-${firstProvider.toLowerCase()}`}
      >
        Sign up with {capitalize(firstProvider)}
      </Button>
      <Button
        {...props}
        onClick={() => handleClick(SocialProvider.GitHub)}
        data-testid="social-button-github"
      >
        Sign up with {capitalize(SocialProvider.GitHub)}
      </Button>
      <Typography
        className="mt-1 text-center"
        type={TypographyType.Body}
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
