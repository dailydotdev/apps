import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealShareBar } from '@dailydotdev/shared/src/features/deals/components/DealShareBar';
import type { DealShareChannel } from '@dailydotdev/shared/src/features/deals/components/DealShareBar';
import { DealInviteUnlock } from '@dailydotdev/shared/src/features/deals/components/DealInviteUnlock';
import { DealBoostMeter } from '@dailydotdev/shared/src/features/deals/components/DealBoostMeter';
import { DealSharerImpact } from '@dailydotdev/shared/src/features/deals/components/DealSharerImpact';
import type {
  Deal,
  DealBoost,
} from '@dailydotdev/shared/src/features/deals/types';
import { DealState } from '@dailydotdev/shared/src/features/deals/types';
import { getDealBySlug, MOCK_USER, withDeals } from './deals.mocks';

const meta: Meta = {
  title: 'Features/Deals/Growth loops',
  parameters: { layout: 'padded', controls: { disable: true } },
  decorators: [withDeals()],
};

export default meta;

type Story = StoryObj<typeof meta>;

const inviteLink = `https://app.daily.dev/join?ref=${MOCK_USER.username}`;

const lockedDeal = getDealBySlug('linear-3-months-free') as Deal;
const boostDeal = getDealBySlug('warp-pro-community-boost') as Deal;
const shareDeal = getDealBySlug('cursor-20-credit') as Deal;
const boostLadder = boostDeal.boost as DealBoost;

const withLockProgress = (done: number): Deal => ({
  ...lockedDeal,
  state: done >= 2 ? DealState.Available : DealState.Locked,
  unlock: { invites: { required: 2, done } },
});

const withClaims = (currentClaims: number): DealBoost => ({
  ...boostLadder,
  currentClaims,
});

const Section = ({
  label,
  testId,
  children,
}: {
  label: string;
  testId: string;
  children: React.ReactNode;
}) => (
  <div data-testid={testId} className="flex flex-col gap-2">
    <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
      {label}
    </span>
    {children}
  </div>
);

const ShareBarDemo = () => {
  const [lastChannel, setLastChannel] = useState<DealShareChannel | null>(null);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Section label="Full width" testId="share-bar-default">
        <DealShareBar
          deal={shareDeal}
          username={MOCK_USER.username}
          onShare={setLastChannel}
        />
      </Section>
      <Section label="Compact" testId="share-bar-compact">
        <DealShareBar
          deal={shareDeal}
          username={MOCK_USER.username}
          onShare={setLastChannel}
          compact
        />
      </Section>
      <Section label="Anonymous sharer (no ref)" testId="share-bar-anonymous">
        <DealShareBar deal={shareDeal} onShare={setLastChannel} />
      </Section>
      <span className="text-text-tertiary typo-caption1">
        Last channel used: {lastChannel ?? 'none yet'}
      </span>
    </div>
  );
};

export const ShareBar: Story = {
  render: () => <ShareBarDemo />,
};

export const InviteToUnlock: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-6">
      <Section label="0 of 2 invites" testId="invite-unlock-0">
        <DealInviteUnlock deal={withLockProgress(0)} inviteLink={inviteLink} />
      </Section>
      <Section label="1 of 2 invites" testId="invite-unlock-1">
        <DealInviteUnlock deal={withLockProgress(1)} inviteLink={inviteLink} />
      </Section>
      <Section label="Unlocked" testId="invite-unlock-2">
        <DealInviteUnlock deal={withLockProgress(2)} inviteLink={inviteLink} />
      </Section>
    </div>
  ),
};

const BoostMeterDemo = () => {
  const [claims, setClaims] = useState(320);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Section label="Below the first tier" testId="boost-meter-low">
        <DealBoostMeter boost={withClaims(180)} />
      </Section>
      <Section label="Mid ladder" testId="boost-meter-mid">
        <DealBoostMeter boost={withClaims(827)} />
      </Section>
      <Section label="Top tier reached" testId="boost-meter-maxed">
        <DealBoostMeter boost={withClaims(1240)} />
      </Section>
      <Section label="Interactive: share to boost" testId="boost-meter-live">
        <DealBoostMeter
          boost={withClaims(claims)}
          onBoost={() => setClaims((current) => current + 90)}
        />
      </Section>
      <Section
        label="Compact, as it renders on a card"
        testId="boost-meter-compact"
      >
        <DealBoostMeter boost={boostLadder} compact />
      </Section>
    </div>
  );
};

export const BoostMeter: Story = {
  render: () => <BoostMeterDemo />,
};

export const SharerImpact: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-6">
      <Section label="Nothing yet" testId="sharer-impact-zero">
        <DealSharerImpact
          shares={0}
          claimsViaShares={0}
          savedViaSharesUsd={0}
        />
      </Section>
      <Section label="Active sharer" testId="sharer-impact-active">
        <DealSharerImpact
          shares={12}
          claimsViaShares={3}
          savedViaSharesUsd={148}
        />
      </Section>
      <Section label="Milestone: first claim" testId="sharer-impact-milestone">
        <DealSharerImpact
          shares={1}
          claimsViaShares={1}
          savedViaSharesUsd={50}
          milestone="first_claim"
        />
      </Section>
    </div>
  ),
};
