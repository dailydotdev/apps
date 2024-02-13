import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Separator } from '../../cards/common';
import { postDateFormat } from '../../../lib/dateFormat';
import { Divider } from '../../utilities';
import ConditionalWrapper from '../../ConditionalWrapper';
import { DevCardStats } from './DevCardStats';
import {
  devCardBoxShadow,
  DevCardTheme,
  DevCardType,
  RoundedContainer,
} from './common';
import { DevCardFooter } from './DevCardFooter';
import { DevCardContainer } from './DevCardContainer';
import { useDevCard } from '../../../hooks/profile/useDevCard';
import { DevCardTwitterCover } from './DevCardTwitterCover';

interface DevCardProps {
  type?: DevCardType;
  userId: string;
}

export function DevCard({
  type = DevCardType.Vertical,
  userId,
}: DevCardProps): ReactElement {
  const data = useDevCard(userId);
  const { devcard, isLoading, coverImage } = data ?? {};

  if (isLoading || !devcard) {
    return null;
  }

  if (type.toLowerCase() === DevCardType.Twitter.toLowerCase()) {
    return <DevCardTwitterCover {...data} />;
  }

  const { theme, user, articlesRead, tags, sources, showBorder } = devcard;
  const isHorizontal = type === DevCardType.Horizontal;
  const isVertical = type === DevCardType.Vertical;
  const isIron = theme === DevCardTheme.Iron;

  const footer = (
    <DevCardFooter tags={tags} sources={sources} type={type} theme={theme} />
  );

  return (
    <DevCardContainer
      theme={theme}
      className={classNames(
        'm-4',
        !isHorizontal && 'w-[20.25rem] flex-col',
        isHorizontal &&
          'mobileL:scale-60 mobileXXL:scale-80 scale-50 mobileXL:scale-75 tablet:scale-100',
      )}
    >
      <ConditionalWrapper
        condition={isHorizontal}
        wrapper={(component) => (
          <RoundedContainer
            className="flex w-[37.75rem] flex-row-reverse pl-2"
            style={{ boxShadow: devCardBoxShadow }}
          >
            {component}
          </RoundedContainer>
        )}
      >
        <ConditionalWrapper
          condition={isHorizontal}
          wrapper={(component) => (
            <RoundedContainer className="flex w-full max-w-[20.25rem] flex-col gap-4">
              {component}
              <div className="relative mt-4 flex flex-col gap-4 p-2">
                {footer}
              </div>
            </RoundedContainer>
          )}
        >
          <div
            className={classNames(
              'relative flex flex-col bg-cover p-2 pb-10',
              isHorizontal
                ? 'rounded-32 border-8 border-salt-90'
                : 'rounded-12',
            )}
            style={{
              backgroundImage: `url(${coverImage})`,
            }}
          >
            {type !== DevCardType.Horizontal && (
              <RoundedContainer className="absolute -inset-2 border-8 border-salt-90" />
            )}
            <img
              src={user.image}
              alt={`avatar of ${user.name}`}
              className={classNames(
                '-rotate-3 border-white object-cover',
                showBorder && (isHorizontal ? 'border-4' : 'border-8'),
                {
                  'size-40 rounded-48': isVertical,
                  'size-24 rounded-32': isHorizontal,
                  'size-20 rounded-24': type === DevCardType.Compact,
                },
              )}
            />
            <DevCardStats
              className="absolute bottom-0 left-0 translate-y-1/2"
              articlesRead={articlesRead}
              user={user}
            />
          </div>
        </ConditionalWrapper>
        <div
          className={classNames(
            'relative mt-4 flex flex-1 flex-col gap-3 p-4',
            type !== DevCardType.Horizontal && 'rounded-b-24 pt-8',
          )}
          style={{
            boxShadow:
              type !== DevCardType.Horizontal ? devCardBoxShadow : undefined,
          }}
        >
          <div className="flex flex-col gap-0.5">
            <h2
              className={classNames(
                isIron ? 'text-white' : 'text-pepper-90',
                isHorizontal ? 'typo-mega2' : 'typo-title2',
              )}
            >
              <strong>{user.name}</strong>
            </h2>
            <span
              className={classNames(
                isIron ? 'text-white' : 'text-pepper-10',
                isHorizontal ? 'typo-callout' : 'typo-footnote',
              )}
            >
              @{user.username}
              <Separator />
              <time
                className={classNames(
                  'text-opacity-64 typo-caption1',
                  isIron ? 'text-white' : 'text-pepper-90',
                )}
              >
                {postDateFormat(user.createdAt)}
              </time>
            </span>
            {isHorizontal && <Divider className="my-2 opacity-32" />}
            <p
              className={classNames(
                isIron ? 'text-white' : 'text-pepper-10',
                isHorizontal ? 'typo-callout' : 'typo-caption1',
              )}
            >
              {user.bio}
            </p>
          </div>
          {type !== DevCardType.Horizontal && (
            <Divider className={isIron && 'bg-salt-90 opacity-32'} />
          )}
          {type !== DevCardType.Horizontal && footer}
        </div>
      </ConditionalWrapper>
    </DevCardContainer>
  );
}
