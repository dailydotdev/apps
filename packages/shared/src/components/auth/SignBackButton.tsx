import type { MouseEventHandler, ReactElement } from 'react';
import React from 'react';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import type {
  SignBackProvider,
  SignedInUser,
} from '../../hooks/auth/useSignBack';
import { providerMap } from './common';

interface SignBackButtonProps {
  signBack: SignedInUser;
  provider: SignBackProvider;
  onClick: MouseEventHandler;
}

export function SignBackButton({
  signBack,
  provider,
  onClick,
}: SignBackButtonProps): ReactElement {
  const item = providerMap[provider.toLowerCase()];

  return (
    <button
      className="btn-signback btn-primary"
      type="button"
      onClick={onClick}
      aria-label={`Continue as ${
        signBack.name || signBack.email
      } from ${provider}`}
    >
      <ProfilePicture user={signBack} size={ProfileImageSize.Large} />
      <div className="text-surface-invert ml-2 flex flex-col items-start">
        {!!signBack.name && (
          <span className="typo-callout font-bold">
            Continue as {signBack.name.split(' ')[0]}
          </span>
        )}
        <span className="typo-footnote">{signBack.email}</span>
      </div>
      <span className="rounded-8 border-border-subtlest-secondary text-surface-invert ml-auto border p-1">
        {item.icon}
      </span>
    </button>
  );
}
