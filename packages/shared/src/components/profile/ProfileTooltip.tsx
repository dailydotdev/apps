import React, { ReactElement } from 'react';
import { TooltipProfile } from '../../lib/user';
import { LazyImage } from '../LazyImage';
import { ProfileIntro } from './ProfileIntro';

interface ProfileTooltipProps {
  user: TooltipProfile;
}

export function ProfileTooltip({ user }: ProfileTooltipProps): ReactElement {
  return (
    <div className="flex flex-column w-72 p-6 border border-theme-divider-primary rounded-2xl bg-theme-bg-primary">
      <LazyImage
        className="w-12 h-12 rounded-10"
        imgSrc={user.image}
        imgAlt={user.username}
      />
      <ProfileIntro user={user} />
    </div>
  );
}

export default ProfileTooltip;
