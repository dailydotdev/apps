import classNames from 'classnames';
import React, { forwardRef, ReactElement, ReactNode, Ref } from 'react';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { TooltipProps } from '../tooltips/BaseTooltip';
import { TruncateText } from '../utilities';
import { ProfileTooltip } from './ProfileTooltip';
import { UserShortProfile } from '../../lib/user';
import { ReputationUserBadge } from '../ReputationUserBadge';

type PropsOf<Tag> = Tag extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[Tag]
  : Tag extends React.ComponentType<infer Props>
  ? Props & JSX.IntrinsicAttributes
  : never;

export interface UserInfoClassName {
  container?: string;
  textWrapper?: string;
}

export interface UserShortInfoProps<
  Tag extends React.ElementType = React.ElementType,
> {
  user: UserShortProfile;
  imageSize?: ProfileImageSize;
  className?: UserInfoClassName;
  tag?: Tag;
  disableTooltip?: boolean;
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
  children?: ReactNode;
  showDescription?: boolean;
  transformUsername?(user: UserShortProfile): ReactNode;
}

const defaultClassName = {
  container: 'py-3 px-6 hover:bg-surface-hover',
  textWrapper: 'flex-1',
};

const UserShortInfoComponent = <Tag extends React.ElementType>(
  {
    imageSize = ProfileImageSize.XLarge,
    tag,
    user,
    className = {},
    disableTooltip,
    scrollingContainer,
    appendTooltipTo,
    children,
    showDescription = true,
    transformUsername,
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
            'ml-4 flex max-w-full flex-col overflow-auto typo-callout',
            className.textWrapper ?? defaultClassName.textWrapper,
          )}
        >
          <div className="flex">
            <TruncateText className="font-bold" title={name}>
              {name}
            </TruncateText>
            <ReputationUserBadge user={user} />
          </div>
          <TruncateText className="text-text-secondary" title={`@${username}`}>
            {transformUsername ? transformUsername(user) : `@${username}`}
          </TruncateText>
          {bio && showDescription && (
            <span className="mt-1 text-text-tertiary">{bio}</span>
          )}
        </div>
      </ProfileTooltip>
      {children}
    </Element>
  );
};

export const UserShortInfo = forwardRef(UserShortInfoComponent);
