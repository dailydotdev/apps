import React from 'react';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { PlusList } from '../../../components/plus/PlusList';
import { IconSize } from '../../../components/Icon';
import { BriefPlusUpgradeCTA } from './BriefPlusUpgradeCTA';
import { ButtonSize } from '../../../components/buttons/common';
import type { PlusItem } from '../../../components/plus/PlusListItem';
import { PlusItemStatus } from '../../../components/plus/PlusListItem';
import { DevPlusIcon } from '../../../components/icons';
import { ClickableCard } from '../../../components/cards/common/Card';

const briefingListItems: Array<PlusItem> = [
  {
    label: 'Get the briefings on your schedule',
    tooltip:
      'Your AI agent auto-generates the brief for you. Choose daily or weekly delivery, whenever it fits your workflow.',
  },
  {
    label: 'Delivered where you want them',
    tooltip: 'In-app, email, or even Slack. Fully integrated.',
  },
  {
    label: 'Tailored to your interests',
    tooltip: 'Based on your tags, reading behavior, and preferred sources.',
  },
  {
    label: 'Additional Plus-only features included',
    tooltip:
      'Unlimited access, more AI superpowers, clickbait detection and more.',
    className: 'underline',
  },
].map((item) => ({
  ...item,
  status: PlusItemStatus.Ready,
  icon: <DevPlusIcon size={IconSize.Size16} aria-hidden />,
}));

export const BriefPlusAdvantagesCard = () => {
  return (
    <ClickableCard className="flex flex-col !border-action-upvote-active !bg-action-upvote-float p-4">
      <Typography type={TypographyType.Callout} bold>
        Want unlimited briefings?
      </Typography>
      <PlusList
        className="flex-1 !py-3"
        iconProps={{
          size: IconSize.XSmall,
          className: 'text-status-success',
        }}
        items={briefingListItems}
        typographyProps={{
          className: 'typo-footnote py-0.5',
        }}
      />
      <BriefPlusUpgradeCTA size={ButtonSize.Medium} className="w-full" />
    </ClickableCard>
  );
};
