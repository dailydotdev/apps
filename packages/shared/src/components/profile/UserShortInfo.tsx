import classNames from 'classnames';
import React, { forwardRef, ReactElement, ReactNode, Ref } from 'react';
import { Author } from '../../graphql/comments';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { TooltipProps } from '../tooltips/BaseTooltip';
import { getTextEllipsis } from '../utilities';
import { ProfileTooltip } from './ProfileTooltip';

type PropsOf<Tag> = Tag extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[Tag]
  : Tag extends React.ComponentType<infer Props>
  ? Props & JSX.IntrinsicAttributes
  : never;

interface UserShortInfoProps<Tag extends React.ElementType> {
  user: Author;
  imageSize?: ProfileImageSize;
  className?: {
    container?: string;
    textWrapper?: string;
  };
  tag?: Tag;
  disableTooltip?: boolean;
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
  children?: ReactNode;
  showDescription?: boolean;
}

const TextEllipsis = getTextEllipsis();

const defaultClassName = {
  container: 'py-3 px-6 hover:bg-theme-hover',
  textWrapper: 'flex-1',
};

const UserShortInfoComponent = <Tag extends React.ElementType>(
  {
    imageSize = 'xlarge',
    tag,
    user,
    className = {},
    disableTooltip,
    scrollingContainer,
    appendTooltipTo,
    children,
    showDescription = true,
    ...props
  }: UserShortInfoProps<Tag> & Omit<PropsOf<Tag>, 'className'>,
  ref?: Ref<Tag>,
): ReactElement => {
  const Element = (tag || 'a') as React.ElementType;
  const { name, username, bio } = user;
  const tooltipProps: TooltipProps = {
    appendTo: appendTooltipTo || globalThis?.document?.body || 'parent',
    visible: disableTooltip ? false : undefined,
  };

  return (
    <Element
      ref={ref}
      {...props}
      className={classNames(
        'flex flex-row',
        className.container ?? defaultClassName.container,
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
        <div
          className={classNames(
            'flex overflow-hidden flex-col ml-4 typo-callout',
            className.textWrapper ?? defaultClassName.textWrapper,
          )}
        >
          <TextEllipsis className="font-bold">{name}</TextEllipsis>
          <TextEllipsis className="text-theme-label-secondary">
            @{username}
          </TextEllipsis>
          {bio && showDescription && (
            <span className="mt-1 text-theme-label-tertiary">{bio}</span>
          )}
        </div>
      </ProfileTooltip>
      {children}
    </Element>
  );
};

export const UserShortInfo = forwardRef(UserShortInfoComponent);
