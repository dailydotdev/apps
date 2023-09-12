import React, { MouseEventHandler, ReactElement } from 'react';
import { ProfilePicture } from '../ProfilePicture';
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
      <ProfilePicture user={signBack} size="large" />
      <div className="flex flex-col items-start ml-2 text-theme-label-invert">
        <span className="font-bold typo-callout">
          Continue as {signBack.name.split(' ')[0]}
        </span>
        <span className="typo-footnote">{signBack.email}</span>
      </div>
      <span className="p-1 ml-auto rounded-8 border border-theme-divider-secondary">
        {item.icon}
      </span>
    </button>
  );
}
