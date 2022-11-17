import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { Author } from '../../graphql/comments';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { TooltipProps } from '../tooltips/BaseTooltip';
import { getTextEllipsis } from '../utilities';
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

const TextEllipsis = getTextEllipsis();

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
        <div className="flex overflow-hidden flex-col flex-1 ml-4 typo-callout">
          <TextEllipsis className="font-bold">{name}</TextEllipsis>
          <TextEllipsis className="text-theme-label-secondary">
            @{username}
          </TextEllipsis>
          {bio && <span className="mt-1 text-theme-label-tertiary">{bio}</span>}
        </div>
      </ProfileTooltip>
    </Element>
  );
}
