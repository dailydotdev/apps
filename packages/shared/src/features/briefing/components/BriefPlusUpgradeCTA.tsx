import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { plusUrl } from '../../../lib/constants';
import type { ButtonV2Props } from '../../../components/buttons/ButtonV2';
import { ButtonV2 } from '../../../components/buttons/ButtonV2';
import { briefButtonBg } from '../../../styles/custom';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { LogEvent, TargetId } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import { useConditionalFeature, usePlusSubscription } from '../../../hooks';
import { featurePlusCtaCopy } from '../../../lib/featureManagement';
import { useAuthContext } from '../../../contexts/AuthContext';

export const BriefPlusUpgradeCTA = ({
  className,
  ...attrs
}: ButtonV2Props<'a'>): ReactElement => {
  const { isAuthReady } = useAuthContext();
  const { logSubscriptionEvent, isPlus } = usePlusSubscription();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus && isAuthReady,
  });

  return (
    <Link href={plusUrl} passHref>
      <ButtonV2
        style={{
          background: briefButtonBg,
        }}
        className={classNames(className, 'ml-auto w-fit text-black')}
        tag="a"
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        onClick={() => {
          logSubscriptionEvent({
            event_name: LogEvent.UpgradeSubscription,
            target_id: TargetId.Brief,
          });
        }}
        {...attrs}
      >
        {plusCta}
      </ButtonV2>
    </Link>
  );
};
