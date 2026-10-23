import React, { useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PrototypeArgs } from './checkout/Prototype';
import { Prototype } from './checkout/Prototype';
import { caseId, useCases } from './cases';
import { Frame } from './docs/Frame';

const meta: Meta<PrototypeArgs> = {
  title: 'Plus Checkout/3. Use cases',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  render: (args) => <Prototype {...args} />,
};

export default meta;

type Story = StoryObj<PrototypeArgs>;

const byExport = (n: string) => {
  const c = useCases.find((u) => u.exportName === n)!;
  return { name: c.name, args: c.args };
};

const Overview = () => {
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop');
  const groups = Array.from(new Set(useCases.map((u) => u.group)));
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-background-default p-6 text-text-primary">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-3xl flex-col gap-1">
          <h1 className="font-bold typo-title1">Every use case, one design</h1>
          <p className="typo-callout text-text-tertiary">
            {useCases.length} cases. Each one is its own story in this folder (open it to click through it at full size); here they render live at {device === 'desktop' ? '1280×800' : '375×812'}.
          </p>
        </div>
        <div className="flex gap-1 rounded-12 border border-border-subtlest-tertiary p-1" role="radiogroup" aria-label="Device">
          {(['desktop', 'phone'] as const).map((d) => (
            <button key={d} type="button" role="radio" aria-checked={device === d} onClick={() => setDevice(d)} className={classNames('rounded-8 px-3 py-1 typo-footnote', device === d ? 'bg-surface-hover font-bold' : 'text-text-tertiary')}>
              {d === 'desktop' ? 'Desktop 1280' : 'Phone 375'}
            </button>
          ))}
        </div>
      </header>
      {groups.map((g) => (
        <section key={g} className="flex flex-col gap-3">
          <h2 className="font-mono uppercase tracking-wider typo-caption1 text-text-quaternary">{g}</h2>
          <div className={classNames('grid gap-5', device === 'desktop' ? 'grid-cols-1 laptop:grid-cols-2' : 'grid-cols-2 tablet:grid-cols-4 laptopL:grid-cols-5')}>
            {useCases.filter((u) => u.group === g).map((u) => (
              <div key={u.exportName} className="flex flex-col gap-1.5">
                <Frame
                  id={caseId(u.exportName)}
                  width={device === 'desktop' ? 1280 : 375}
                  height={device === 'desktop' ? 800 : 812}
                  label={u.name}
                />
                <p className="typo-caption1 text-text-tertiary">{u.when}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export const AllCases: Story = { name: '★ All use cases', render: () => <Overview /> };

export const Annual: Story = byExport('Annual');
export const Monthly: Story = byExport('Monthly');
export const PhoneStep2: Story = byExport('PhoneStep2');
export const StaticList: Story = byExport('StaticList');
export const PricesLoading: Story = byExport('PricesLoading');
export const FromAd: Story = byExport('FromAd');
export const FromBrief: Story = byExport('FromBrief');
export const FromCustomFeed: Story = byExport('FromCustomFeed');
export const FromClickbait: Story = byExport('FromClickbait');
export const FromBookmarks: Story = byExport('FromBookmarks');
export const Sale: Story = byExport('Sale');
export const Gift: Story = byExport('Gift');
export const Team: Story = byExport('Team');
export const SignedOut: Story = byExport('SignedOut');
export const AlreadyPlus: Story = byExport('AlreadyPlus');
export const AlreadyPlusGifted: Story = byExport('AlreadyPlusGifted');
export const Unavailable: Story = byExport('Unavailable');
export const Loading: Story = byExport('Loading');
export const Processing: Story = byExport('Processing');
export const Declined: Story = byExport('Declined');
export const BankVerification: Story = byExport('BankVerification');
export const Blocked: Story = byExport('Blocked');
export const UsZip: Story = byExport('UsZip');
export const PayPal: Story = byExport('PayPal');
export const Safari: Story = byExport('Safari');
export const Success: Story = byExport('Success');
export const GiftSuccess: Story = byExport('GiftSuccess');
export const TeamSuccess: Story = byExport('TeamSuccess');
export const IosSuccess: Story = byExport('IosSuccess');
export const IosApp: Story = byExport('IosApp');
export const NoReminderRegion: Story = byExport('NoReminderRegion');
export const ReminderUsState: Story = byExport('ReminderUsState');
export const Express: Story = byExport('Express');
