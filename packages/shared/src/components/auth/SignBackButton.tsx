import classNames from 'classnames';
import type { MouseEventHandler, ReactElement } from 'react';
import React from 'react';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import type { SignedInUser } from '../../hooks/auth/useSignBack';
import type { SocialProvider } from './common';
import { providerMap } from './common';

interface SignBackButtonProps {
  signBack: SignedInUser;
  provider: SocialProvider;
  disabled?: boolean;
  onClick: MouseEventHandler;
}

export function SignBackButton({
  signBack,
  provider,
  disabled = false,
  onClick,
}: SignBackButtonProps): ReactElement {
  const item = providerMap[provider.toLowerCase() as keyof typeof providerMap];

  return (
    <button
      aria-busy={disabled}
      className={classNames(
        'flex h-[3.25rem] w-full flex-row items-center rounded-12 bg-text-primary px-3 py-2 transition-colors hover:bg-text-secondary',
        disabled && 'opacity-60 pointer-events-none',
      )}
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={`Continue as ${
        signBack.name || signBack.email
      } from ${provider}`}
    >
      <ProfilePicture user={signBack} size={ProfileImageSize.Large} />
      <div className="ml-2 flex flex-col items-start text-surface-invert">
        {!!signBack.name && (
          <span className="font-bold typo-callout">
            Continue as {signBack.name.split(' ')[0]}
          </span>
        )}
        <span className="typo-footnote">{signBack.email}</span>
      </div>
      <span className="ml-auto rounded-8 border border-border-subtlest-secondary p-1 text-surface-invert">
        {item.icon}
      </span>
    </button>
  );
}
