import classNames from 'classnames';
import React, { forwardRef, ReactElement, ReactNode, Ref } from 'react';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { TooltipProps } from '../tooltips/BaseTooltip';
import { TruncateText } from '../utilities';
import { ProfileTooltip } from './ProfileTooltip';
import { LoggedUser, UserShortProfile } from '../../lib/user';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { VerifiedCompanyUserBadge } from '../VerifiedCompanyUserBadge';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { FollowButton } from '../contentPreference/FollowButton';
import { Origin } from '../../lib/log';

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
  afterContent?: ReactNode;
  showDescription?: boolean;
  transformUsername?(user: UserShortProfile): ReactNode;
  onClick?: () => void;
  showFollow?: boolean;
  origin?: Origin;
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
    afterContent,
    showDescription = true,
    transformUsername,
    showFollow,
    origin,
    ...props
  }: UserShortInfoProps<Tag> & Omit<PropsOf<Tag>, 'className'>,
  ref?: Ref<Tag>,
): ReactElement => {
  const Element = (tag || 'a') as React.ElementType;
  const { name, username, bio, companies } = user;
  const tooltipProps: TooltipProps = {
    appendTo: appendTooltipTo || globalThis?.document?.body || 'parent',
    visible: disableTooltip ? false : undefined,
  };

  return (
    <Element
      ref={ref}
      {...props}
      className={classNames(
        'flex flex-row items-center',
        className.container ?? defaultClassName.container,
      )}
    >
      <ProfileTooltip
        userId={user?.id}
        tooltip={tooltipProps}
        scrollingContainer={scrollingContainer}
      >
        <ProfilePicture user={user} size={imageSize} nativeLazyLoading />
      </ProfileTooltip>
      <ProfileTooltip
        userId={user?.id}
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
            {companies?.length > 0 && (
              <VerifiedCompanyUserBadge user={{ companies }} />
            )}
            <ReputationUserBadge user={user} />
          </div>
          <div className="flex">
            <TruncateText
              className="text-text-secondary"
              title={`@${username}`}
            >
              {transformUsername ? transformUsername(user) : `@${username}`}
            </TruncateText>
          </div>
          {bio && showDescription && (
            <span className="mt-1 text-text-tertiary">{bio}</span>
          )}
        </div>
      </ProfileTooltip>
      {children}
      {!!showFollow && (
        <FollowButton
          userId={user.id}
          type={ContentPreferenceType.User}
          status={(user as LoggedUser).contentPreference?.status}
          entityName={`@${user.username}`}
          origin={origin}
        />
      )}
      {afterContent}
    </Element>
  );
};

export const UserShortInfo = forwardRef(UserShortInfoComponent);
