import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { GoogleIcon } from '../../icons';
import {
  getPreferredSourceUrl,
  DAILY_DEV_DOMAIN,
} from '../../../lib/preferredSources';

export type PreferGoogleButtonProps = Pick<
  ButtonProps<'button'>,
  'size' | 'variant'
> & {
  label?: string;
  className?: string;
  /**
   * Falls back to the deeplink instead of Google's script. Required anywhere
   * the script cannot run or has not initialised.
   */
  useDeeplink?: boolean;
  isReady?: boolean;
  onAdd?: () => void;
};

/**
 * Adds daily.dev to the reader's Google preferred sources.
 *
 * Google's own button renders in an iframe we cannot theme, so this drives the
 * documented JS API from our own `Button` — same outcome, our design system.
 * Google sets no wording rule for a custom badge; the binding constraint is the
 * G mark itself, which must stay full-colour and unmodified.
 */
export function PreferGoogleButton({
  label = 'Add as preferred source',
  size = ButtonSize.Small,
  variant = ButtonVariant.Primary,
  className,
  useDeeplink = false,
  isReady = true,
  onAdd,
}: PreferGoogleButtonProps): ReactElement {
  const linkProps = useDeeplink
    ? ({
        tag: 'a',
        href: getPreferredSourceUrl(DAILY_DEV_DOMAIN),
        target: '_blank',
        rel: 'noopener noreferrer',
      } as const)
    : {};

  return (
    <Button
      {...linkProps}
      className={classNames('whitespace-nowrap', className)}
      disabled={!useDeeplink && !isReady}
      icon={<GoogleIcon secondary />}
      onClick={onAdd}
      size={size}
      variant={variant}
    >
      {label}
    </Button>
  );
}
