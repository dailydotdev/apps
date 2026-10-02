import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { PublicProfile } from '../lib/user';
import { SimpleTooltip } from './tooltips';
import { PlusUser } from './PlusUser';
import { plusCta, plusUrl } from '../lib/constants';
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
import { IconSize } from './Icon';
import { useConditionalFeature } from '../hooks/useConditionalFeature';
import { featurePlusEntryPoints } from '../lib/featureManagement';
import { PlusPreview } from './plus/PlusPreview';

export type Props = {
  user: Pick<PublicProfile, 'isPlus' | 'plusMemberSince'>;
  tooltip?: boolean;
  size?: IconSize;
};

export const PlusUserBadge = ({
  user,
  tooltip = true,
  size = IconSize.Size16,
}: Props): ReactElement | null => {
  const router = useRouter();
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
      <PlusPreview side="bottom">
        <button
          type="button"
          aria-label="Plus member"
          className="focus-outline flex items-center rounded-6"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onUpgradeClick();
            router.push(plusUrl);
          }}
        >
          <PlusUser withText={false} iconSize={size} />
        </button>
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
