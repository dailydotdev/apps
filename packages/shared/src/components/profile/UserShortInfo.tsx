import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Author } from '../../graphql/comments';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { TooltipProps } from '../tooltips/BaseTooltip';
import { ProfileTooltip } from './ProfileTooltip';

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
  user: Author;
  imageSize?: ProfileImageSize;
  className?: string;
  tag?: Tag;
  disableTooltip?: boolean;
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
}

export function UserShortInfo<Tag extends AnyTag>({
  imageSize = 'xlarge',
  tag,
  user,
  className,
  disableTooltip,
  scrollingContainer,
  appendTooltipTo,
  ...props
}: UserShortInfoProps<Tag> & PropsOf<Tag>): ReactElement {
  const Element = (tag || 'a') as React.ElementType;
  const { name, username, bio } = user;
  const tooltipProps: TooltipProps = {
    appendTo: appendTooltipTo || document?.body || 'parent',
    visible: disableTooltip ? false : undefined,
  };

  return (
    <Element
      {...props}
      className={classNames(
        'flex flex-row py-3 px-6 hover:bg-theme-hover',
        className,
      )}
    >
      <ProfileTooltip
        user={user}
        tooltip={tooltipProps}
        scrollingContainer={scrollingContainer}
      >
        <ProfilePicture user={user} size={imageSize} nativeLazyLoading />
      </ProfileTooltip>
      <ProfileTooltip
        user={user}
        tooltip={tooltipProps}
        scrollingContainer={scrollingContainer}
      >
        <div className="flex flex-col flex-1 ml-4 typo-callout">
          <span className="font-bold">{name}</span>
          <span className="text-theme-label-secondary">@{username}</span>
          {bio && <span className="mt-1 text-theme-label-tertiary">{bio}</span>}
        </div>
      </ProfileTooltip>
    </Element>
  );
}
