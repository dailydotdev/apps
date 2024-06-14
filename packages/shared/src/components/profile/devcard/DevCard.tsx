import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Separator } from '../../cards/common';
import { TimeFormatType } from '../../../lib/dateFormat';
import { DateFormat, Divider } from '../../utilities';
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
import { checkLowercaseEquality } from '../../../lib/strings';
import { devcardBorder } from '../../../styles/custom';

interface DevCardProps {
  type?: DevCardType;
  userId: string;
  isInteractive?: boolean;
}

export function DevCard({
  type = DevCardType.Vertical,
  userId,
  isInteractive = true,
}: DevCardProps): ReactElement {
  const data = useDevCard(userId);
  const { devcard, isLoading, coverImage } = data ?? {};

  if (isLoading || !devcard) {
    return null;
  }

  if (type.toLowerCase() === DevCardType.Twitter.toLowerCase()) {
    return <DevCardTwitterCover {...data} />;
  }

  const { theme, user, articlesRead, tags, sources, showBorder, streak } =
    devcard;
  const isHorizontal = type === DevCardType.Horizontal;
  const isVertical = type === DevCardType.Vertical;
  const isIron = checkLowercaseEquality(theme, DevCardTheme.Iron);
  const isDefault = checkLowercaseEquality(theme, DevCardTheme.Default);

  const footer = (
    <DevCardFooter
      tags={tags}
      sources={sources}
      type={type}
      theme={theme}
      elementsClickable={isInteractive}
    />
  );

  return (
    <DevCardContainer
      theme={theme}
      className={classNames(!isHorizontal && 'w-[20.25rem] flex-col')}
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
              'relative flex flex-col rounded-24 bg-cover p-2 pb-10',
              isHorizontal && 'm-2 ',
            )}
            style={{
              backgroundImage: `url(${coverImage})`,
            }}
          >
            <RoundedContainer
              className="absolute -inset-2 border-8"
              style={{ borderColor: devcardBorder }}
            />
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
              maxStreak={streak?.max}
              user={user}
            />
          </div>
        </ConditionalWrapper>
        <div
          className={classNames(
            'relative flex flex-1 flex-col justify-center gap-3 p-4',
            type !== DevCardType.Horizontal && 'mt-4 rounded-b-24 pt-8',
          )}
          style={{
            boxShadow:
              type !== DevCardType.Horizontal ? devCardBoxShadow : undefined,
          }}
        >
          <div className="flex flex-col gap-0.5">
            <h2
              className={classNames(
                'font-bold',
                isIron ? 'text-white' : 'text-raw-pepper-90',
                isHorizontal
                  ? 'line-clamp-2 typo-mega2'
                  : 'line-clamp-1 typo-title2',
              )}
            >
              {user.name}
            </h2>
            <div
              className={classNames(
                'line-clamp-1 flex items-center',
                isIron && 'text-white',
                isDefault && 'text-raw-pepper-10',
                !isIron && !isDefault && 'text-raw-pepper-90',
                isHorizontal ? 'typo-callout' : 'typo-footnote',
              )}
            >
              <span
                className={classNames(
                  'overflow-hidden text-ellipsis',
                  isVertical ? 'shrink' : 'max-w-36',
                )}
              >
                @{user.username}
              </span>
              <Separator />
              <DateFormat
                date={user.createdAt}
                type={TimeFormatType.Post}
                className={classNames(
                  'typo-caption1',
                  isIron && 'text-white',
                  isDefault && 'text-raw-pepper-10/[.64]',
                  !isIron && !isDefault && 'text-raw-pepper-90',
                )}
              />
            </div>
            {isHorizontal && (
              <Divider
                className={classNames(
                  'my-2',
                  (isDefault || isIron) && 'opacity-32',
                  isIron ? '!bg-raw-salt-90' : '!bg-raw-pepper-90',
                )}
              />
            )}
            <p
              className={classNames(
                isIron ? 'text-white' : 'text-raw-pepper-90',
                isHorizontal
                  ? 'line-clamp-6 typo-callout'
                  : 'line-clamp-2 typo-caption1',
              )}
            >
              {user.bio}
            </p>
          </div>
          {type !== DevCardType.Horizontal && (
            <Divider
              className={classNames(
                (isDefault || isIron) && 'opacity-32',
                isIron ? '!bg-raw-salt-90' : '!bg-raw-pepper-90',
              )}
            />
          )}
          {type !== DevCardType.Horizontal && footer}
        </div>
      </ConditionalWrapper>
    </DevCardContainer>
  );
}
