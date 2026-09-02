import type { ReactElement } from 'react';
import React from 'react';
import type { Source } from '../../../graphql/sources';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import { UserHighlight, UserType } from '../../widgets/PostUsersHighlights';
import { CopyLinkButton } from '../../share/CopyLinkButton';
import { ButtonVariant } from '../../buttons/Button';
import { ReferralCampaignKey } from '../../../lib/referral';
import { LogEvent } from '../../../lib/log';

export function SourceTopList({
  items,
  ...props
}: CommonLeaderboardProps<Source[]>): ReactElement {
  return (
    <LeaderboardList {...props}>
      {items?.map((item, i) => (
        <LeaderboardListItem
          key={item.id}
          index={i + 1}
          className="group/source flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler"
        >
          <UserHighlight
            {...item}
            userType={UserType.Source}
            className={{
              wrapper: 'min-w-0 flex-shrink !p-2',
              image: '!h-8 !w-8',
              textWrapper: '!ml-2',
              name: '!typo-caption1',
              handle: '!typo-caption2',
            }}
            allowSubscribe={false}
          />
          {/* Hover-revealed only where hover exists; always there on touch. */}
          <CopyLinkButton
            variant={ButtonVariant.Tertiary}
            className="ml-auto shrink-0 laptop:opacity-0 laptop:group-focus-within/source:opacity-100 laptop:group-hover/source:opacity-100"
            shareProps={{
              text: `Check out ${item.handle} on daily.dev`,
              link: item.permalink,
              cid: ReferralCampaignKey.ShareSource,
              logObject: () => ({
                event_name: LogEvent.ShareSource,
                target_id: item.id,
              }),
            }}
          />
        </LeaderboardListItem>
      ))}
    </LeaderboardList>
  );
}
