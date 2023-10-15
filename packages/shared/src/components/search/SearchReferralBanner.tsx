import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import { KeyReferralIcon } from '../icons';
import { IconSize } from '../Icon';

export function SearchReferralBanner(): ReactElement {
  // TODO: validate whether you should render this
  return (
    <div className="flex flex-col gap-4 p-4 w-full rounded-14 bg-theme-overlay-from">
      <KeyReferralIcon size={IconSize.Large} className="mr-2" />
      <h2 className="font-bold typo-title2">
        Give your friends early access to daily.dev&apos;s search!
      </h2>
      <p className="typo-title3 text-theme-label-secondary">
        {/* TODO: update the count from the invitations table */}
        Be that cool friend who got access to yet another AI feature! You have
        COUNT invites, use them wisely.
      </p>
      <Button className="btn-primary">Give early access</Button>
    </div>
  );
}
