import type { ReactElement, ComponentProps } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '../icons';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/Button';
import {
  Typography,
  TypographyType,
  TypographyTag,
} from '../typography/Typography';
import { onboardingGradientClasses } from './common';
import AuthOptions from '../auth/AuthOptions';
import type { AuthOptionsProps } from '../auth/AuthOptions';

interface OnboardingSignupProps extends ComponentProps<'section'> {
  onBackClick?: () => void;
  authOptions?: AuthOptionsProps;
}

export const OnboardingSignup = ({
  authOptions,
  onBackClick,
  ...attrs
}: OnboardingSignupProps): ReactElement => {
  return (
    <section {...attrs}>
      <div className="flex gap-4">
        <Button
          className="border-border-subtlest-tertiary text-text-secondary"
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={onBackClick}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Secondary}
        />
        <Typography
          className={classNames('mt-0.5 flex-1', onboardingGradientClasses)}
          tag={TypographyTag.H2}
          type={TypographyType.Title1}
        >
          Join daily.dev
        </Typography>
      </div>
      <AuthOptions {...authOptions} />
    </section>
  );
};

export default OnboardingSignup;
