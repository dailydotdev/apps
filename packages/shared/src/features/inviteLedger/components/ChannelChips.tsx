import type { ReactElement } from 'react';
import React from 'react';
import { ShareProvider, getShareLink } from '../../../lib/share';
import { labels } from '../../../lib';
import { useCopyLink } from '../../../hooks/useCopy';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

interface ChannelChipsProps {
  link: string;
}

interface Channel {
  provider: ShareProvider;
  label: string;
}

const CHANNELS: Channel[] = [
  { provider: ShareProvider.WhatsApp, label: 'WhatsApp' },
  { provider: ShareProvider.LinkedIn, label: 'LinkedIn' },
  { provider: ShareProvider.Telegram, label: 'Telegram' },
  { provider: ShareProvider.Twitter, label: 'X' },
  { provider: ShareProvider.Email, label: 'Email' },
];

const CHIP_CLASS =
  'rounded-md border border-border-subtlest-tertiary bg-transparent px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] text-text-secondary hover:border-text-tertiary hover:text-text-primary transition-colors';

export const ChannelChips = ({ link }: ChannelChipsProps): ReactElement => {
  const { logEvent } = useLogContext();
  const [, copyLink] = useCopyLink();

  const handleClick = (provider: ShareProvider) => {
    logEvent({
      event_name: LogEvent.InviteLedgerChannelClick,
      target_id: provider,
      target_type: TargetType.InviteLedgerPage,
    });
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {CHANNELS.map(({ provider, label }) => (
        <a
          key={provider}
          className={CHIP_CLASS}
          href={getShareLink({
            provider,
            link,
            text: labels.referral.generic.inviteText,
          })}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick(provider)}
        >
          {label}
        </a>
      ))}
      <button
        type="button"
        className={CHIP_CLASS}
        onClick={() => {
          copyLink({ link });
          handleClick(ShareProvider.CopyLink);
        }}
      >
        Copy
      </button>
    </div>
  );
};
