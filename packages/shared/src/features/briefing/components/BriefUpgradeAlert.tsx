import type { ComponentProps } from 'react';
import React from 'react';
import classNames from 'classnames';
import { briefCardBg } from '../../../styles/custom';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { BriefPlusUpgradeCTA } from './BriefPlusUpgradeCTA';

export const BriefUpgradeAlert = ({
  className,
  ...attrs
}: ComponentProps<'div'>) => {
  return (
    <div
      style={{
        background: briefCardBg,
      }}
      className={classNames(
        'rounded-12 mb-4 flex w-full flex-wrap items-center justify-between gap-2 border border-white px-4 py-3',
        className,
      )}
      {...attrs}
    >
      <Typography
        type={TypographyType.Callout}
        className="tablet:w-auto w-full flex-1"
      >
        Get unlimited access to every past and future presidential briefing with
        daily.dev Plus.
      </Typography>
      <BriefPlusUpgradeCTA />
    </div>
  );
};
