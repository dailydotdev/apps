import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ProfileLink, ProfileLinkProps } from './ProfileLink';
import { ProfilePicture } from '../ProfilePicture';

export function ProfileImageLink({
  className,
  ...props
}: ProfileLinkProps): ReactElement {
  return (
    <ProfileLink
      className={classNames(className, 'block w-10 h-10')}
      {...props}
    >
      <ProfilePicture user={props.user} size="large" />
    </ProfileLink>
  );
}
