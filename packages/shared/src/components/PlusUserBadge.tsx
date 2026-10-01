import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../lib/user';
import { SimpleTooltip } from './tooltips';
import { PlusUser } from './PlusUser';
import { plusCta, plusUrl } from '../lib/constants';
import Link from './utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from './typography/Typography';
import ConditionalWrapper from './ConditionalWrapper';
import { DateFormat } from './utilities';
import { TimeFormatType } from '../lib/dateFormat';
import { usePlusSubscription } from '../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../lib/log';
import { IconSize } from './Icon';
import { useConditionalFeature } from '../hooks/useConditionalFeature';
import { featurePlusEntryPoints } from '../lib/featureManagement';
import { PlusPreview, PlusPreviewNote } from './plus/PlusPreview';

export type Props = {
  user: Pick<PublicProfile, 'isPlus' | 'plusMemberSince'> &
    Partial<Pick<PublicProfile, 'name'>>;
  tooltip?: boolean;
  size?: IconSize;
};

export const PlusUserBadge = ({
  user,
  tooltip = true,
  size = IconSize.Size16,
}: Props): ReactElement | null => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { value: isPlusEntryPoints } = useConditionalFeature({
    feature: featurePlusEntryPoints,
    shouldEvaluate: tooltip && !!user.isPlus,
  });

  if (!user.isPlus) {
    return null;
  }

  const onUpgradeClick = () =>
    logSubscriptionEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_id: TargetId.PlusBadge,
    });

  if (tooltip && isPlusEntryPoints) {
    return (
      <PlusPreview
        side="bottom"
        context={
          <>
            <Typography type={TypographyType.Callout} bold>
              {user.name ? `${user.name} is a Plus member` : 'Plus member'}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              <DateFormat
                prefix="Member since "
                date={user.plusMemberSince}
                type={TimeFormatType.PlusMember}
              />
            </Typography>
          </>
        }
        footer={
          isPlus ? (
            <PlusPreviewNote>You are a Plus member too</PlusPreviewNote>
          ) : (
            <Link passHref href={plusUrl}>
              <Typography
                tag={TypographyTag.Link}
                type={TypographyType.Footnote}
                color={TypographyColor.Link}
                bold
                onClick={onUpgradeClick}
              >
                See what Plus does
              </Typography>
            </Link>
          )
        }
      >
        <div className="flex items-center">
          <PlusUser withText={false} iconSize={size} />
        </div>
      </PlusPreview>
    );
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
                    onClick={onUpgradeClick}
                  >
                    {plusCta}
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
      <div className="flex items-center">
        <PlusUser withText={false} iconSize={size} />
      </div>
    </ConditionalWrapper>
  );
};
