import React from 'react';
import type { ReactElement } from 'react';
import { CoinIcon, PlusIcon } from '../icons';

import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

export const BuyCreditsButton = (): ReactElement => {
  return (
    <div className="flex items-center rounded-10 bg-surface-float">
      <Link href={`${webappUrl}/earnings`} passHref>
        <Button
          tag="a"
          target="_blank"
          rel={anchorDefaultRel}
          variant={ButtonVariant.Tertiary}
          icon={<CoinIcon />}
          size={ButtonSize.Small}
        >
          20
        </Button>
      </Link>
      <div className="h-[1.375rem] w-px bg-border-subtlest-tertiary" />
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<PlusIcon />}
        size={ButtonSize.Small}
      />
    </div>
  );
};
