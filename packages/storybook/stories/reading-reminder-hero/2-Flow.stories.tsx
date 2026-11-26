import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Device } from '../sources/device';
import { FeedInDevice, FeedMock, StripInLaptop } from './FeedMock';
import type { HeroStep } from './ProposedHero';
import {
  offeredHour,
  PermissionPrompt,
  ProposedHero,
  ProposedTopHero,
  shortHour,
} from './ProposedHero';

type Permission = 'default' | 'granted' | 'denied';

interface FlowArgs {
  readingHour: number;
  permission: Permission;
}

const meta: Meta<FlowArgs> = {
  title: 'Growth/Reading reminder hero/2. Flow',
  parameters: { layout: 'fullscreen' },
  args: { readingHour: 20, permission: 'default' },
  argTypes: {
    readingHour: {
      name: 'Hour they see the card',
      control: { type: 'range', min: 0, max: 23, step: 1 },
    },
    permission: {
      name: 'Push permission before the tap',
      control: 'inline-radio',
      options: ['default', 'granted', 'denied'],
    },
  },
};

export default meta;

const Page = ({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-8 px-4 py-8 tablet:px-8">
    <header className="flex max-w-[44rem] flex-col gap-2">
      <h1 className="font-bold text-text-primary typo-title1">{title}</h1>
      <p className="text-text-secondary typo-body">{intro}</p>
    </header>
    {children}
  </div>
);

const Log = ({ lines }: { lines: string[] }): ReactElement => (
  <ol className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 text-text-secondary typo-footnote">
    {lines.length ? (
      lines.map((line, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={index}>
          {index + 1}. {line}
        </li>
      ))
    ) : (
      <li className="text-text-tertiary">Tap the card to start.</li>
    )}
  </ol>
);

const InteractiveFlow = ({
  readingHour,
  permission: initialPermission,
}: FlowArgs): ReactElement => {
  const [step, setStep] = useState<HeroStep | 'gone'>('offer');
  const [hour, setHour] = useState(offeredHour(readingHour));
  const [permission, setPermission] = useState(initialPermission);
  const [lines, setLines] = useState<string[]>([]);
  const log = (line: string) => setLines((current) => [...current, line]);

  const restart = useCallback(() => {
    setStep('offer');
    setHour(offeredHour(readingHour));
    setPermission(initialPermission);
    setLines([]);
  }, [readingHour, initialPermission]);
  useEffect(restart, [restart]);

  useEffect(() => {
    if (step !== 'saved') {
      return undefined;
    }
    const timeout = window.setTimeout(() => setStep('gone'), 2500);
    return () => window.clearTimeout(timeout);
  }, [step]);

  const save = (pickedHour: number) => {
    log(`Reminder saved: daily at ${shortHour(pickedHour)}, reader’s timezone`);
    setStep('saved');
  };

  const send = (pickedHour: number) => {
    setHour(pickedHour);
    if (permission === 'granted') {
      log('Push already allowed, no prompt');
      save(pickedHour);
      return;
    }
    if (permission === 'denied') {
      log('Push blocked in the browser, nothing saved');
      setStep('denied');
      return;
    }
    log('Asked for push, nothing saved yet');
    setStep('asking');
  };

  return (
    <div className="grid grid-cols-1 gap-6 laptop:grid-cols-[auto_1fr]">
      <div className="relative w-[23.4375rem] max-w-full">
        <Device device="phone" height={640} url="/">
          <FeedMock
            hero={
              step === 'gone' ? undefined : (
                <ProposedHero
                  step={step}
                  readingHour={readingHour}
                  savedHour={hour}
                  onSend={send}
                  onPickTime={() => setStep('picking')}
                  onRetry={() => {
                    // The demo pretends the reader unblocked it in settings.
                    setPermission('default');
                    log('Reader unblocked push in settings');
                    log('Asked for push, nothing saved yet');
                    setStep('asking');
                  }}
                  onClose={() => {
                    log('Closed: stored on the account, gone on every device');
                    setStep('gone');
                  }}
                />
              )
            }
          />
        </Device>
        {step === 'asking' && (
          <div className="absolute left-0 top-6">
            <PermissionPrompt
              onAllow={() => {
                setPermission('granted');
                log('Push allowed');
                save(hour);
              }}
              onBlock={() => {
                setPermission('denied');
                log('Push blocked, nothing saved');
                setStep('denied');
              }}
            />
          </div>
        )}
      </div>
      <div className="flex max-w-[28rem] flex-col gap-3">
        <h2 className="font-bold text-text-primary typo-title3">
          What happens
        </h2>
        <Log lines={lines} />
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          className="w-fit"
          onClick={restart}
        >
          Start over
        </Button>
        <p className="text-text-tertiary typo-footnote">
          Change the reader’s hour and their push permission in the controls.
          The permission prompt is a stand-in: the real one belongs to the
          browser or the OS.
        </p>
      </div>
    </div>
  );
};

export const Interactive: StoryObj<FlowArgs> = {
  render: (args) => (
    <Page
      title="Push first, at the hour they read"
      intro="One tap names the hour the reader already reads at. Push is asked for before anything is saved, so every saved reminder can arrive. Readers who already allow push skip the prompt."
    >
      <InteractiveFlow {...args} />
    </Page>
  ),
};

const states: { step: HeroStep; label: string; note: string }[] = [
  {
    step: 'offer',
    label: 'Offer',
    note: 'The hour they see the card, in their timezone, rounded down; 9 AM between midnight and 5 AM. The current hour’s first reminder comes tomorrow; a later hour (9 AM late at night, or one picked under Other time) can come today.',
  },
  {
    step: 'picking',
    label: 'Other time',
    note: 'Three presets, the offered hour in place of the nearest one. Picking one goes straight to the push ask.',
  },
  {
    step: 'asking',
    label: 'Asking for push',
    note: 'Shown behind the browser or OS prompt. Nothing is saved yet.',
  },
  {
    step: 'saved',
    label: 'Saved',
    note: 'Push allowed and the reminder saved. The card leaves after a moment.',
  },
  {
    step: 'denied',
    label: 'Blocked',
    note: 'Push blocked: no reminder is saved. In production the steps come from ReEnableNotifications, per platform.',
  },
  {
    step: 'paused',
    label: 'Paused reminder (#7013)',
    note: 'The message that already shares the slot, moved to the same layout.',
  },
];

const noop = (): void => undefined;

export const AllStates: StoryObj<FlowArgs> = {
  name: 'All states',
  render: ({ readingHour }) => (
    <Page
      title="All states"
      intro="Every state the slot can show: the feed card on a phone and a tablet, and the laptop strip card at 1024px, sharing the strip with another card as it does when the upload-CV card also shows. Each state keeps its frame and roughly its height, so the feed under it doesn’t jump."
    >
      <div className="flex flex-col gap-10">
        {states.map(({ step, label, note }) => {
          const card = (
            <ProposedHero
              step={step}
              readingHour={readingHour}
              onSend={noop}
              onPickTime={noop}
              onRetry={noop}
              onClose={noop}
            />
          );
          return (
            <div key={step} className="flex flex-col gap-3">
              <div className="flex max-w-[48rem] flex-col gap-1">
                <p className="font-bold text-text-primary typo-callout">
                  {label}
                </p>
                <p className="text-text-tertiary typo-footnote">{note}</p>
              </div>
              <div className="grid grid-cols-1 items-start gap-4 laptop:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1fr)]">
                <FeedInDevice device="phone" height={440} hero={card} />
                <FeedInDevice device="tablet" height={300} hero={card} />
                <StripInLaptop
                  hero={
                    <ProposedTopHero
                      step={step}
                      readingHour={readingHour}
                      onSend={noop}
                      onPickTime={noop}
                      onRetry={noop}
                      onClose={noop}
                    />
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  ),
};

const CloseEverywhereDemo = (): ReactElement => {
  const [isPerAccount, setIsPerAccount] = useState(true);
  const [closedOn, setClosedOn] = useState<Set<string>>(new Set());
  const isClosed = (device: string): boolean =>
    isPerAccount ? closedOn.size > 0 : closedOn.has(device);
  const close = (device: string) =>
    setClosedOn((current) => new Set(current).add(device));

  const phoneHero = isClosed('phone') ? undefined : (
    <ProposedHero
      step="offer"
      readingHour={20}
      onSend={noop}
      onPickTime={noop}
      onClose={() => close('phone')}
    />
  );
  const laptopHero = isClosed('laptop') ? undefined : (
    <ProposedTopHero
      step="offer"
      readingHour={20}
      onSend={noop}
      onPickTime={noop}
      onClose={() => close('laptop')}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={isPerAccount ? ButtonVariant.Float : ButtonVariant.Primary}
          onClick={() => {
            setIsPerAccount(false);
            setClosedOn(new Set());
          }}
        >
          Today: per device
        </Button>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={isPerAccount ? ButtonVariant.Primary : ButtonVariant.Float}
          onClick={() => {
            setIsPerAccount(true);
            setClosedOn(new Set());
          }}
        >
          Proposed: on the account
        </Button>
        <span className="text-text-tertiary typo-footnote">
          Close the card on one device and watch the other.
        </span>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 laptop:grid-cols-[auto_1fr]">
        <div className="w-[23.4375rem] max-w-full">
          <Device device="phone" height={560} url="/" label="Phone">
            <FeedMock hero={phoneHero} />
          </Device>
        </div>
        <Device device="laptop" height={560} url="/" label="Laptop">
          <FeedMock isLaptop hero={laptopHero} />
        </Device>
      </div>
    </div>
  );
};

export const CloseEverywhere: StoryObj<FlowArgs> = {
  name: 'Close everywhere',
  render: () => (
    <Page
      title="Close counts on every device"
      intro="Today closing is stored on the device, so 23% of people who closed the card saw it again somewhere else. Stored on the account, one close is enough."
    >
      <CloseEverywhereDemo />
    </Page>
  ),
};
