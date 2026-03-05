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
  text = 'Let your AI agent do the reading for you. Upgrade to Plus for unlimited presidential briefings.',
  ...attrs
}: ComponentProps<'div'> & {
  text?: string;
}) => {
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
        className="w-full flex-1 tablet:w-auto"
      >
        {text}
      </Typography>
      <BriefPlusUpgradeCTA />
    </div>
  );
};
