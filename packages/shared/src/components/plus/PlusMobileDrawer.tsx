import type { ReactElement } from 'react';
import React from 'react';
import { plusFeaturesImage } from '../../lib/image';
import { Drawer } from '../drawers';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import { useLogContext } from '../../contexts/LogContext';
import { TargetType, Origin, LogEvent } from '../../lib/log';
import { MarketingCtaVariant } from '../marketingCta/common';
import { useBoot } from '../../hooks';

type PlusMobileDrawerProps = {
  onClose: () => void;
};

const PlusMobileDrawer = ({ onClose }: PlusMobileDrawerProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { flags } = marketingCta;

  const handleClick = () => {
    logEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_type: TargetType.MarketingCtaPlus,
      target_id: marketingCta.campaignId,
      extra: JSON.stringify({
        origin: Origin.InAppPromotion,
      }),
    });
  };

  return (
    <Drawer
      displayCloseButton
      className={{
        wrapper: '!px-0 !pt-0',
        close: '!mx-4',
      }}
      isOpen
      onClose={onClose}
    >
      <Image src={flags?.image || plusFeaturesImage} />
      <div className="flex flex-col gap-5 px-4 pt-6">
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.LargeTitle}>
            {flags.title}
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            {flags.description}
          </Typography>
        </div>
        <Button
          onClick={handleClick}
          tag="a"
          href={`${webappUrl}plus`}
          variant={ButtonVariant.Primary}
        >
          {flags.ctaText}
        </Button>
      </div>
    </Drawer>
  );
};

export default PlusMobileDrawer;
