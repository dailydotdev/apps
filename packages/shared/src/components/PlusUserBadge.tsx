import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../lib/user';
import { SimpleTooltip } from './tooltips';
import { PlusUser } from './PlusUser';
import { plusUrl } from '../lib/constants';
import Link from './utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
} from './typography/Typography';
import ConditionalWrapper from './ConditionalWrapper';
import { DateFormat } from './utilities';
import { TimeFormatType } from '../lib/dateFormat';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../lib/log';

export type Props = {
  user: Pick<PublicProfile, 'isPlus' | 'plusMemberSince'>;
  tooltip?: boolean;
};

export const PlusUserBadge = ({
  user,
  tooltip = true,
}: Props): ReactElement => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();

  if (!user.isPlus) {
    return null;
  }

  return (
    <ConditionalWrapper
      condition={tooltip}
      wrapper={(child) => (
        <SimpleTooltip
          interactive
          content={
            <>
              <DateFormat
                prefix="Plus member since "
                date={user.plusMemberSince}
                type={TimeFormatType.PlusMember}
              />
              {!isPlus && (
                <Link passHref href={plusUrl}>
                  <Typography
                    tag={TypographyTag.Link}
                    color={TypographyColor.Link}
                    onClick={() => {
                      logSubscriptionEvent({
                        event_name: LogEvent.UpgradeSubscription,
                        target_id: TargetId.PlusBadge,
                      });
                    }}
                  >
                    Upgrade to Plus!
                  </Typography>
                </Link>
              )}
            </>
          }
          placement="top"
          container={{
            className: 'text-center flex-col',
          }}
        >
          {child as ReactElement}
        </SimpleTooltip>
      )}
    >
      <div className="ml-1 flex items-center">
        <PlusUser withText={false} />
      </div>
    </ConditionalWrapper>
  );
};
