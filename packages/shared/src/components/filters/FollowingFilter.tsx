import React from 'react';
import { IconSize } from '../Icon';
import { OpenLinkIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import Link from '../utilities/Link';

export const FollowingFilter = (): ReactElement=> {
  const { user } = useAuthContext();
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-10 text-center text-text-secondary">
      <OpenLinkIcon
        size={IconSize.XXXLarge}
        className="text-text-disabled"
        secondary
      />
      <p className="font-bold typo-title2">
        Your following lists are on your profile
      </p>

      <p className="typo-body">
        To manage everything you follow,{' '}
        <Link href={user.permalink}>
          <a href={user.permalink} className="text-text-link">
            head to your profile
          </a>
        </Link>{' '}
        and press the following button below your profile image.
      </p>
    </div>
  );
};
