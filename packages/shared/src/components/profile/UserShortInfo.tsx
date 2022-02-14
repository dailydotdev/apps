import React, { HTMLAttributes, ReactElement } from 'react';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';

interface UserShortInfoProps<T extends React.ElementType = 'a'>
  extends HTMLAttributes<T> {
  image: string;
  name: string;
  username: string;
  bio?: string;
  imageSize?: ProfileImageSize;
  Tag?: T;
}

export function UserShortInfo({
  name,
  username,
  image,
  bio,
  Tag = 'a',
  imageSize = 'xlarge',
}: UserShortInfoProps): ReactElement {
  return (
    <Tag className="flex flex-row py-3 px-6 hover:bg-theme-hover">
      <ProfilePicture user={{ username, image }} size={imageSize} />
      <div className="flex flex-col flex-1 ml-4 typo-callout">
        <span className="font-bold">{name}</span>
        <span className="text-theme-label-secondary">@{username}</span>
        {bio && <span className="mt-1 text-theme-label-tertiary">{bio}</span>}
      </div>
    </Tag>
  );
}
