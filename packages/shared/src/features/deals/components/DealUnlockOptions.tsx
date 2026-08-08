import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { CoreIcon, InviteIcon, LockIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { Deal } from '../types';
import {
  DEAL_INVITE_CTA_LABEL,
  getDealCoresCtaLabel,
  getDealUnlockSummary,
} from '../dealsFormat';
import { DealInviteCount, DealInviteProgress } from './DealInviteProgress';

interface DealUnlockOptionsProps {
  deal: Deal;
  onUnlock?: (deal: Deal) => void;
  className?: string;
}

export const DealUnlockOptions = ({
  deal,
  onUnlock,
  className,
}: DealUnlockOptionsProps): ReactElement => {
  const { unlock } = deal;

  if (!unlock) {
    throw new Error('DealUnlockOptions needs a deal with an unlock');
  }

  const { cores, invites } = unlock;

  return (
    <div className={classNames('flex flex-col gap-3', className)}>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="flex items-center gap-2"
      >
        <LockIcon size={IconSize.XSmall} secondary />
        {getDealUnlockSummary(unlock)}
      </Typography>

      {invites && (
        <div className="flex items-center gap-2">
          <DealInviteProgress invites={invites} />
          <DealInviteCount invites={invites} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {cores && (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            icon={<CoreIcon />}
            onClick={() => onUnlock?.(deal)}
          >
            {getDealCoresCtaLabel(cores)}
          </Button>
        )}
        {invites && (
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Large}
            icon={<InviteIcon />}
            onClick={() => onUnlock?.(deal)}
          >
            {DEAL_INVITE_CTA_LABEL}
          </Button>
        )}
      </div>
    </div>
  );
};
