import React from 'react';
import { briefCardBg } from '../../../styles/custom';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { BriefPlusUpgradeCTA } from './BriefPlusUpgradeCTA';

export const BriefUpgradeAlert = () => {
  return (
    <div
      style={{
        background: briefCardBg,
      }}
      className="mb-4 flex w-full flex-wrap items-center justify-between gap-2 rounded-12 border border-white px-4 py-3"
    >
      <Typography
        type={TypographyType.Callout}
        className="w-full tablet:w-auto"
      >
        Get unlimited access to every past and future presidential briefing with
        daily.dev Plus.
      </Typography>
      <BriefPlusUpgradeCTA />
    </div>
  );
};
