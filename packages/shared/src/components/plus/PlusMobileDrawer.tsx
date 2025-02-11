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
import { useLazyModal } from '../../hooks/useLazyModal';
import { webappUrl } from '../../lib/constants';

const PlusMobileDrawer = (): ReactElement => {
  const { closeModal } = useLazyModal();
  return (
    <Drawer
      displayCloseButton
      className={{
        wrapper: '!px-0 !pt-0',
        close: '!mx-4',
      }}
      isOpen
      onClose={closeModal}
    >
      <Image className="" src={plusFeaturesImage} />
      <div className="flex flex-col gap-5 px-4 pt-6">
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.LargeTitle}>
            Fast-track your growth
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            Work smarter, learn faster, and stay ahead with AI tools, custom
            feeds, and pro features. Because copy-pasting code isn&apos;t a
            long-term strategy.
          </Typography>
        </div>
        <Button
          tag="a"
          href={`${webappUrl}plus`}
          variant={ButtonVariant.Primary}
        >
          Upgrade to Plus
        </Button>
      </div>
    </Drawer>
  );
};

export default PlusMobileDrawer;
