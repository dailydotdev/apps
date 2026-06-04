import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

// Reassurance row mirroring daily.dev's marketing trust microcopy (refund /
// cancel-anytime style). Reused in the hero and the closing CTA.
const perks = ['You never pay', '100% funded by daily.dev'];

export const GivebackTrustPerks = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <FlexRow
    className={classNames('flex-wrap items-center gap-x-5 gap-y-2', className)}
  >
    {perks.map((perk) => (
      <FlexRow key={perk} className="items-center gap-1.5">
        <span className="bg-accent-avocado-default/20 flex size-4 shrink-0 items-center justify-center rounded-full text-accent-avocado-default">
          <VIcon secondary size={IconSize.XXSmall} />
        </span>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          {perk}
        </Typography>
      </FlexRow>
    ))}
  </FlexRow>
);
