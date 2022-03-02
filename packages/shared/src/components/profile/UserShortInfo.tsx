import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';

// reference: https://stackoverflow.com/a/54049872/5532217
type AnyTag =
  | string
  | React.FunctionComponent<never>
  | (new (props: never) => React.Component);

type PropsOf<Tag> = Tag extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[Tag]
  : Tag extends React.ComponentType<infer Props>
  ? Props & JSX.IntrinsicAttributes
  : never;

interface UserShortInfoProps<Tag extends AnyTag> {
  image: string;
  name: string;
  username: string;
  bio?: string;
  imageSize?: ProfileImageSize;
  className?: string;
  tag?: Tag;
}

export function UserShortInfo<Tag extends AnyTag>({
  name,
  username,
  image,
  bio,
  imageSize = 'xlarge',
  tag,
  ...props
}: UserShortInfoProps<Tag> & PropsOf<Tag>): ReactElement {
  const Element = (tag || 'a') as React.ElementType;

  return (
    <Element
      {...props}
      className={classNames('flex flex-row py-3 px-6 hover:bg-theme-hover')}
    >
      <ProfilePicture user={{ username, image }} size={imageSize} />
      <div className="flex flex-col flex-1 ml-4 typo-callout">
        <span className="font-bold">{name}</span>
        <span className="text-theme-label-secondary">@{username}</span>
        {bio && <span className="mt-1 text-theme-label-tertiary">{bio}</span>}
      </div>
    </Element>
  );
}
