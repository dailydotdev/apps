import React, { MouseEventHandler, ReactElement } from 'react';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { SignBackProvider, SignedInUser } from '../../hooks/auth/useSignBack';
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
