import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { Separator } from '../../cards/common';
import { postDateFormat } from '../../../lib/dateFormat';
import { Divider } from '../../utilities';
import { TagLinks } from '../../TagLinks';
import { UserRank } from '../../../lib/rank';
import classed from '../../../lib/classed';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useRequestProtocol } from '../../../hooks/useRequestProtocol';
import { graphqlUrl } from '../../../lib/config';
import { FAVORITE_SOURCES_QUERY, Source } from '../../../graphql/sources';
import SourceButton from '../../cards/SourceButton';
import Logo from '../../Logo';
import { ButtonVariant } from '../../buttons/common';
import { cloudinary } from '../../../lib/image';
import { EyeIcon, ReputationIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { largeNumberFormat } from '../../../lib/numberFormat';
import ConditionalWrapper from '../../ConditionalWrapper';
import { Author } from '../../../graphql/comments';

export enum DevCardType {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  Compact = 'compact',
}

interface DevCardProps {
  type?: DevCardType;
  user: Author;
  tags?: string[];
  theme?: UserRank;
}

const rankToThemeClass: Record<UserRank, string> = {
  Iron: '',
  Bronze: '',
  Silver: '',
  Gold: '',
  Platinum: '',
  Diamond: '',
  Legendary: '',
};

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
        <h2 className="typo-title3">{largeNumberFormat(amount)}</h2>
      </strong>
      <Icon size={IconSize.XSmall} secondary className={iconClassName} />
      <span className="text-salt-90 typo-caption2">{label}</span>
    </span>
  );
};

export function DevCard({
  type = DevCardType.Vertical,
  user,
  tags,
  theme,
}: DevCardProps): ReactElement {
  const { requestMethod } = useRequestProtocol();
  const { data: sources } = useQuery<Source[]>(
    generateQueryKey(RequestKey.Source, user, 'favorite'),
    async () => {
      const res = await requestMethod(graphqlUrl, FAVORITE_SOURCES_QUERY, {
        userId: user.id,
      });

      return res.favoriteSources;
    },
  );
  const bg = rankToThemeClass[theme] ?? 'bg-white';
  const favorites = (
    <>
      <TagLinks
        buttonProps={{ variant: ButtonVariant.Secondary }}
        className={{
          container: type === DevCardType.Horizontal && 'pb-3',
          tag: classNames(
            'border-pepper-90 text-pepper-90',
            type === DevCardType.Vertical &&
              '!block max-w-[5rem] overflow-hidden text-ellipsis',
          ),
        }}
        tags={
          tags ?? ['javascript', 'career', 'typescript', 'devtools', 'react']
        }
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
        bg,
        type === DevCardType.Horizontal
          ? 'w-[37.75rem] flex-row-reverse'
          : 'w-[20.25rem] flex-col',
      )}
    >
      <ConditionalWrapper
        condition={type === DevCardType.Horizontal}
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
            type === DevCardType.Horizontal
              ? 'rounded-[32px] border-8 border-salt-90'
              : 'rounded-12',
          )}
          style={{
            backgroundImage: `url(${cloudinary.devcard.defaultCoverImage})`,
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
              type === DevCardType.Horizontal ? 'border-8' : 'border-4',
              {
                'size-40 rounded-[48px]': type === DevCardType.Vertical,
                'size-24 rounded-[32px]': type === DevCardType.Horizontal,
                'size-20 rounded-24': type === DevCardType.Compact,
              },
            )}
          />
          <span className="absolute bottom-0 left-0 flex w-full translate-y-1/2 flex-row gap-3 rounded-16 bg-pepper-90 p-4 text-white shadow-2">
            <StatsSection
              amount={user.reputation}
              label="Reputation"
              iconClassName="text-onion-40"
              Icon={ReputationIcon}
            />
            <StatsSection
              amount={8800}
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
          type !== DevCardType.Horizontal && 'rounded-24 pt-8',
        )}
        style={{
          boxShadow: type !== DevCardType.Horizontal ? boxShadow : undefined,
        }}
      >
        <h2
          className={classNames(
            'text-pepper-90',
            type === DevCardType.Horizontal ? 'typo-mega2' : 'typo-title2',
          )}
        >
          <strong>{user.name}</strong>
        </h2>
        <span
          className={classNames(
            'text-pepper-10',
            type === DevCardType.Horizontal ? 'typo-callout' : 'typo-footnote',
          )}
        >
          @{user.username}
          <Separator />
          <time className="text-pepper-90 text-opacity-64 typo-caption1">
            {postDateFormat(user.createdAt)}
          </time>
        </span>
        {type === DevCardType.Horizontal && <Divider />}
        <p
          className={classNames(
            'text-pepper-10',
            type === DevCardType.Horizontal ? 'typo-callout' : 'typo-caption1',
          )}
        >
          {user.bio}
        </p>
        {type !== DevCardType.Horizontal && <Divider />}
        {type !== DevCardType.Horizontal && favorites}
      </div>
    </RoundedContainer>
  );
}
