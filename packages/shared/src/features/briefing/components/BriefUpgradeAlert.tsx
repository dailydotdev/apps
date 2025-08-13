import React, { type ComponentProps } from 'react';
import { briefCardBg } from '../../../styles/custom';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { BriefPlusUpgradeCTA } from './BriefPlusUpgradeCTA';
import classNames from 'classnames';

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
        'mb-4 flex w-full flex-wrap items-center justify-between gap-2 rounded-12 border border-white px-4 py-3',
        className,
      )}
      {...attrs}
    >
      <Typography
        type={TypographyType.Callout}
        className="w-full tablet:w-auto flex-1"
      >
        Get unlimited access to every past and future presidential briefing with
        daily.dev Plus.
      </Typography>
      <BriefPlusUpgradeCTA />
    </div>
  );
};
