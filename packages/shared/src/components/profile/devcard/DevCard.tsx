import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { Separator } from '../../cards/common';
import { postDateFormat } from '../../../lib/dateFormat';
import { Divider } from '../../utilities';
import { TagLinks } from '../../TagLinks';
import classed from '../../../lib/classed';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useRequestProtocol } from '../../../hooks/useRequestProtocol';
import { graphqlUrl } from '../../../lib/config';
import SourceButton from '../../cards/SourceButton';
import Logo from '../../Logo';
import { ButtonVariant } from '../../buttons/common';
import { cloudinary } from '../../../lib/image';
import { EyeIcon, ReputationIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { largeNumberFormat } from '../../../lib/numberFormat';
import ConditionalWrapper from '../../ConditionalWrapper';
import colors from '../../../styles/colors';
import { DEV_CARD_QUERY, DevCardData } from '../../../graphql/users';

export enum DevCardType {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  Compact = 'compact',
}

interface DevCardProps {
  type?: DevCardType;
  userId: string;
}

const RoundedContainer = classed('div', 'rounded-[32px]');

interface StatsSectionProps {
  Icon: typeof ReputationIcon;
  iconClassName?: string;
  amount: number;
  label: string;
}

const boxShadow = '1px 1px 1px rgb(0 0 0 /30%)';

const StatsSection = ({
  amount,
  Icon,
  label,
  iconClassName,
}: StatsSectionProps) => {
  return (
    <span className="flex flex-row items-center gap-1">
      <strong>
        <h2 className="text-white typo-title3">{largeNumberFormat(amount)}</h2>
      </strong>
      <Icon size={IconSize.XSmall} secondary className={iconClassName} />
      <span className="text-salt-90 typo-caption2">{label}</span>
    </span>
  );
};

enum DevCardTheme {
  Default = 'default',
  Iron = 'iron',
  Bronze = 'bronze',
  Silver = 'silver',
  Gold = 'gold',
  Platinum = 'platinum',
  Diamond = 'diamond',
  Legendary = 'legendary',
}

const themeToLinearGradient = {
  [DevCardTheme.Default]: `linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(152.83deg, #FFFFFF 51.92%, ${colors.salt['20']} 85.8%)`,
  [DevCardTheme.Iron]:
    `linear-gradient(135.48deg, ${colors.pepper['10']} 0%, ${colors.pepper['90']} 20%, ${colors.pepper['10']} 47.5%, #2C303A 67%, ${colors.pepper['90']} 83%, ${colors.pepper['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Bronze]:
    `linear-gradient(135.48deg, #C98463 0%, ${colors.burger['40']} 20%, #FFB760 47.5%, #C98463 67%, ${colors.burger['40']} 83%, #C98463 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Silver]:
    'linear-gradient(135.11deg, #A8B3CE 0%, #F6F8FC 18%, #CFD6E5 31.5%, #FFFFFF 49.19%, #CFD6E5 61.5%, #A8B3CE 78.5%, #CFD6E5 95.5%),\n' +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Gold]:
    `linear-gradient(135deg, ${colors.bun['10']} 0%, #FFF86E 27.5%, ${colors.bun['10']} 50%, #FFF86E 75%, ${colors.bun['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Platinum]:
    'linear-gradient(135.18deg, #75F3BB 0%, #95EEF4 24.16%, #77A6F5 40%, #75F3BB 71.33%, #77A6F5 100%),\n' +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Diamond]:
    'linear-gradient(135.18deg, #E769FB 0%, #9E70F8 24.16%, #68A6FD 40%, #9E70F8 71.33%, #D473F4 100%),\n' +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Legendary]:
    `linear-gradient(135.18deg, ${colors.ketchup['10']} 0%, ${colors.bacon['10']} 24.16%, ${colors.bun['10']} 40%, ${colors.bacon['10']} 71.33%, ${colors.ketchup['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
};

export function DevCard({
  type = DevCardType.Vertical,
  userId,
}: DevCardProps): ReactElement {
  const { requestMethod } = useRequestProtocol();
  const { data: devcard, isLoading } = useQuery<DevCardData>(
    generateQueryKey(RequestKey.DevCard, { id: userId }),
    async () => {
      const res = await requestMethod(graphqlUrl, DEV_CARD_QUERY, {
        id: userId,
      });

      return res.devCard;
    },
    { staleTime: StaleTime.Default },
  );

  if (isLoading || !devcard) {
    return null;
  }

  const { theme, user, articlesRead, tags, isProfileCover, sources } = devcard;
  const bg = themeToLinearGradient[theme] ?? themeToLinearGradient.default;
  const isHorizontal = type === DevCardType.Horizontal;
  const isVertical = type === DevCardType.Vertical;
  const isIron = theme === DevCardTheme.Iron;
  const coverImage =
    (isProfileCover ? user.cover : undefined) ??
    cloudinary.devcard.defaultCoverImage;

  const favorites = (
    <>
      <TagLinks
        buttonProps={{ variant: ButtonVariant.Secondary }}
        className={{
          container: isHorizontal && 'pb-3',
          tag: classNames(
            'pt-0.5 !typo-caption1',
            isIron
              ? 'border-white text-white'
              : 'border-pepper-90 text-pepper-90',
            isVertical && '!block max-w-[5rem] overflow-hidden text-ellipsis',
          ),
        }}
        tags={tags}
      />
      <div className="flex flex-row gap-1">
        {sources?.map((source) => (
          <SourceButton key={source.id} source={source} size="small" />
        ))}
      </div>
      <span className="absolute bottom-0 right-0 rounded-br-24 rounded-tl-24 bg-pepper-90 px-4 py-3">
        <Logo showGreeting={false} />
      </span>
    </>
  );

  return (
    <RoundedContainer
      className={classNames(
        'm-4 flex h-fit p-2',
        !isHorizontal && 'w-[20.25rem] flex-col',
      )}
      style={{ background: bg }}
    >
      <ConditionalWrapper
        condition={isHorizontal}
        wrapper={(component) => (
          <div
            className="flex w-[37.75rem] flex-row-reverse rounded-[32px] pl-2"
            style={{ boxShadow }}
          >
            {component}
          </div>
        )}
      >
        <ConditionalWrapper
          condition={isHorizontal}
          wrapper={(component) => (
            <div className="flex w-full max-w-[20.25rem] flex-col gap-4 rounded-[32px]">
              {component}
              <div className="relative mt-4 flex flex-col gap-4 p-2">
                {favorites}
              </div>
            </div>
          )}
        >
          <div
            className={classNames(
              'relative flex flex-col bg-cover p-2 pb-10',
              isHorizontal
                ? 'rounded-[32px] border-8 border-salt-90'
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
                '-rotate-3 border-white',
                isHorizontal ? 'border-8' : 'border-4',
                {
                  'size-40 rounded-[48px]': isVertical,
                  'size-24 rounded-[32px]': isHorizontal,
                  'size-20 rounded-24': type === DevCardType.Compact,
                },
              )}
            />
            <span className="absolute bottom-0 left-0 flex w-full translate-y-1/2 flex-row gap-3 rounded-16 bg-pepper-90 p-4 shadow-2">
              <StatsSection
                amount={user.reputation}
                label="Reputation"
                iconClassName="text-onion-40"
                Icon={ReputationIcon}
              />
              <StatsSection
                amount={articlesRead}
                label="Posts read"
                iconClassName="text-cabbage-40"
                Icon={EyeIcon}
              />
            </span>
          </div>
        </ConditionalWrapper>
        <div
          className={classNames(
            'relative mt-4 flex flex-1 flex-col gap-3 p-4',
            type !== DevCardType.Horizontal && 'rounded-b-24 pt-8',
          )}
          style={{
            boxShadow: type !== DevCardType.Horizontal ? boxShadow : undefined,
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
          {type !== DevCardType.Horizontal && favorites}
        </div>
      </ConditionalWrapper>
    </RoundedContainer>
  );
}
