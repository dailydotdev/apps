import classNames from 'classnames';
import React, { ReactElement, ReactNode, useCallback } from 'react';
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
  children?: ReactNode;
  unclickable?: boolean;
}

interface ElementChildren {
  children: ReactElement;
}

const TextEllipsis = getTextEllipsis();

export function UserShortInfo<Tag extends AnyTag>({
  imageSize = 'xlarge',
  tag,
  user,
  className = 'py-3 px-6 hover:bg-theme-hover',
  disableTooltip,
  scrollingContainer,
  appendTooltipTo,
  children,
  unclickable,
  ...props
}: UserShortInfoProps<Tag> & PropsOf<Tag>): ReactElement {
  const Element = (tag || 'a') as React.ElementType;
  const { name, username, bio } = user;
  const tooltipProps: TooltipProps = {
    appendTo: appendTooltipTo || document?.body || 'parent',
    visible: disableTooltip ? false : undefined,
  };
  const TooltipComponent = ({ children: child }: ElementChildren) => (
    <ProfileTooltip
      user={user}
      tooltip={tooltipProps}
      scrollingContainer={scrollingContainer}
    >
      {child}
    </ProfileTooltip>
  );
  const Tooltip = useCallback(() => TooltipComponent, [user, tooltipProps])();

  const content = (
    <>
      <Tooltip>
        <ProfilePicture user={user} size={imageSize} nativeLazyLoading />
      </Tooltip>
      <Tooltip>
        <div className="flex overflow-hidden flex-col flex-1 ml-4 typo-callout w-fit">
          <TextEllipsis className="font-bold">{name}</TextEllipsis>
          <TextEllipsis className="text-theme-label-secondary">
            @{username}
          </TextEllipsis>
          {bio && <span className="mt-1 text-theme-label-tertiary">{bio}</span>}
        </div>
      </Tooltip>
    </>
  );

  const containerClasses = classNames('flex flex-row', className);

  if (unclickable) return <span className={containerClasses}>{content}</span>;

  return (
    <Element {...props} className={containerClasses}>
      {content}
      {children}
    </Element>
  );
}
