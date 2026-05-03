import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { ButtonV2, ButtonSize, ButtonVariant } from '../../../buttons/ButtonV2';
import { useLogContext } from '../../../../contexts/LogContext';
import { combinedClicks } from '../../../../lib/click';
import { businessWebsiteUrl } from '../../../../lib/constants';
import type { TargetId } from '../../../../lib/log';
import { LogEvent, TargetType } from '../../../../lib/log';
import { anchorDefaultRel } from '../../../../lib/strings';

type AdvertiseLinkProps = {
  targetId: TargetId;
  className?: string;
  buttonStyle?: boolean;
  size?: ButtonSize;
};

const advertiseHereLabel = 'Advertise here';

export const AdvertiseLink = ({
  targetId,
  className,
  buttonStyle = false,
  size = ButtonSize.Medium,
}: AdvertiseLinkProps): ReactElement => {
  const { logEvent } = useLogContext();

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.AdvertiseHereCta,
      target_id: targetId,
    });
  }, [logEvent, targetId]);

  const onClick = () =>
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.AdvertiseHereCta,
      target_id: targetId,
    });

  const linkProps = {
    href: businessWebsiteUrl,
    target: '_blank',
    rel: anchorDefaultRel,
  };

  if (buttonStyle) {
    return (
      <ButtonV2
        tag="a"
        {...linkProps}
        variant={ButtonVariant.Float}
        size={size}
        className={classNames(
          'whitespace-nowrap !border-transparent !bg-transparent !font-normal typo-footnote hover:!bg-surface-hover focus:!bg-surface-hover',
          className,
        )}
        onClick={onClick}
      >
        {advertiseHereLabel}
      </ButtonV2>
    );
  }

  return (
    <a
      {...linkProps}
      className={classNames(
        'whitespace-nowrap text-text-quaternary no-underline typo-footnote',
        className,
      )}
      {...combinedClicks(onClick)}
    >
      {advertiseHereLabel}
    </a>
  );
};
