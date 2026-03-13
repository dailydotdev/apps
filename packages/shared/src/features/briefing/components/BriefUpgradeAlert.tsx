import type { ComponentProps } from 'react';
import React from 'react';
import classNames from 'classnames';
import { briefCardBg } from '../../../styles/custom';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { BriefPlusUpgradeCTA } from './BriefPlusUpgradeCTA';
import { usePlusPositioning } from '../../../hooks/usePlusPositioning';

export const BriefUpgradeAlert = ({
  className,
  text,
  ...attrs
}: ComponentProps<'div'> & {
  text?: string;
}) => {
  const { isAgentPositioning } = usePlusPositioning();
  const defaultText = isAgentPositioning
    ? 'Skip the feed and get a personalized briefing instead. Upgrade to Plus for unlimited presidential briefings.'
    : 'Get unlimited access to every past and future presidential briefing with daily.dev Plus.';

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
        {text || defaultText}
      </Typography>
      <BriefPlusUpgradeCTA />
    </div>
  );
};
