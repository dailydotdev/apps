import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { useFeature } from '../../../GrowthBookProvider';
import { useLogContext } from '../../../../contexts/LogContext';
import { combinedClicks } from '../../../../lib/click';
import { featureAdReferralCta } from '../../../../lib/featureManagement';
import { businessWebsiteUrl } from '../../../../lib/constants';
import { LogEvent, TargetId, TargetType } from '../../../../lib/log';
import { anchorDefaultRel } from '../../../../lib/strings';

type AdvertiseLinkProps = {
  targetId: TargetId;
  className?: string;
  buttonStyle?: boolean;
  size?: ButtonSize;
};

export const AdvertiseLink = ({
  targetId,
  className,
  buttonStyle = false,
  size = ButtonSize.Medium,
}: AdvertiseLinkProps): ReactElement | null => {
  const isEnabled = useFeature(featureAdReferralCta);
  const { logEvent } = useLogContext();

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.AdvertiseHereCta,
      target_id: targetId,
    });
  }, [isEnabled, logEvent, targetId]);

  const onClick = () =>
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.AdvertiseHereCta,
      target_id: targetId,
    });

  if (!isEnabled) {
    return null;
  }

  if (buttonStyle) {
    return (
      <Button
        tag="a"
        href={businessWebsiteUrl}
        target="_blank"
        rel={anchorDefaultRel}
        variant={ButtonVariant.Float}
        size={size}
        className={classNames(
          'whitespace-nowrap !border-transparent !bg-transparent !font-normal typo-footnote hover:!bg-surface-hover focus:!bg-surface-hover',
          className,
        )}
        onClick={onClick}
      >
        Advertise here
      </Button>
    );
  }

  return (
    <a
      href={businessWebsiteUrl}
      target="_blank"
      rel={anchorDefaultRel}
      className={classNames(
        'whitespace-nowrap text-text-quaternary no-underline typo-footnote',
        className,
      )}
      {...combinedClicks(onClick)}
    >
      Advertise here
    </a>
  );
};
