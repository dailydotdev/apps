import React, { ReactElement } from 'react';
import { UserIntroduction } from '../../lib/user';

interface ProfileIntroProps {
  user: UserIntroduction;
}

export function ProfileIntro({
  user: { name, username, bio },
}: ProfileIntroProps): ReactElement {
  return (
    <div className="flex flex-col flex-1 ml-4 typo-callout">
      <span className="font-bold">{name}</span>
      <span className="text-theme-label-secondary">@{username}</span>
      {bio && <span className="mt-1 text-theme-label-tertiary">{bio}</span>}
    </div>
  );
}
