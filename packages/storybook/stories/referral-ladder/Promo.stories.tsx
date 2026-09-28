import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { fn } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import {
  ReferralLadderPromo,
  ReferralLadderPromoVariant,
} from '@dailydotdev/shared/src/components/referral/ReferralLadderPromo';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import ExtensionProviders from '../extension/_providers';

const meta: Meta = {
  title: 'Experiments/Referral Ladder Promo',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.post('*/e', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div id="__next">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const versions = [
  { variant: ReferralLadderPromoVariant.Gift, label: 'A. Gift' },
  { variant: ReferralLadderPromoVariant.Perks, label: 'B. Plus perks' },
];

export const AllVersions: Story = {
  name: 'All versions',
  render: () => (
    <div className="flex min-h-screen flex-wrap items-start justify-center gap-8 bg-background-subtle p-8">
      {versions.map(({ variant, label }) => (
        <div key={variant} className="flex flex-col gap-3">
          <p className="font-bold text-text-tertiary typo-callout">{label}</p>
          <ReferralLadderPromo
            variant={variant}
            onInvite={fn()}
            onClose={fn()}
            className="w-[26.25rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
          />
        </div>
      ))}
    </div>
  ),
};

const LivePromo = ({
  variant,
}: {
  variant: ReferralLadderPromoVariant;
}): ReactElement => {
  const { openModal } = useLazyModal();
  const open = () =>
    openModal({ type: LazyModal.ReferralLadderPromo, props: { variant } });

  // Opens on mount, like a campaign popup would.
  useEffect(() => {
    openModal({ type: LazyModal.ReferralLadderPromo, props: { variant } });
  }, [openModal, variant]);

  return (
    <div className="min-h-screen bg-background-default p-6">
      <Button variant={ButtonVariant.Secondary} onClick={open}>
        Show the promo again
      </Button>
      <LazyModalElement />
    </div>
  );
};

export const GiftLive: Story = {
  name: 'A. Gift (click Invite friends)',
  render: () => <LivePromo variant={ReferralLadderPromoVariant.Gift} />,
};

export const PerksLive: Story = {
  name: 'B. Plus perks (click Invite friends)',
  render: () => <LivePromo variant={ReferralLadderPromoVariant.Perks} />,
};
