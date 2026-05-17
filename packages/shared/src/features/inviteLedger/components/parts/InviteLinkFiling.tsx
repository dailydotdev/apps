import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useCopyLink } from '../../../../hooks/useCopy';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, TargetId, TargetType } from '../../../../lib/log';
import {
  getEmailShareLink,
  getLinkedInShareLink,
  getTelegramShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../../../../lib/share';

interface InviteLinkFilingProps {
  link: string;
  origin: 'page' | 'modal';
  copyLabel?: string;
}

interface Channel {
  id: ShareProvider;
  short: string;
  build: (link: string, text: string) => string;
}

const SHARE_TEXT =
  'I use daily.dev to keep up with what is shipping. Sign up with my link and you get 7 days of Plus on me.';

const CHANNELS: Channel[] = [
  { id: ShareProvider.WhatsApp, short: 'wa', build: getWhatsappShareLink },
  {
    id: ShareProvider.LinkedIn,
    short: 'li',
    build: (link) => getLinkedInShareLink(link),
  },
  { id: ShareProvider.Telegram, short: 'tg', build: getTelegramShareLink },
  { id: ShareProvider.Twitter, short: 'x', build: getTwitterShareLink },
  {
    id: ShareProvider.Email,
    short: '@',
    build: (link) =>
      getEmailShareLink(link, 'Try daily.dev, get a week of Plus'),
  },
];

const CHANNEL_LABEL: Record<ShareProvider, string> = {
  [ShareProvider.WhatsApp]: 'Share on WhatsApp',
  [ShareProvider.LinkedIn]: 'Share on LinkedIn',
  [ShareProvider.Telegram]: 'Share on Telegram',
  [ShareProvider.Twitter]: 'Share on X',
  [ShareProvider.Email]: 'Share by email',
  [ShareProvider.Facebook]: 'Share on Facebook',
  [ShareProvider.Reddit]: 'Share on Reddit',
  [ShareProvider.CopyLink]: 'Copy link',
  [ShareProvider.Native]: 'Share',
};

/**
 * The "filing" — your invite link rendered as a single monospace line
 * with a copy action, followed by a thin row of channel shortcuts.
 * Designed to read like a dispatch point in a field report, not a form.
 */
export const InviteLinkFiling = ({
  link,
  origin,
  copyLabel = 'copy',
}: InviteLinkFilingProps): ReactElement => {
  const [copied, copy] = useCopyLink(() => link);
  const { logEvent } = useLogContext();

  const handleCopy = () => {
    copy();
    logEvent({
      event_name: LogEvent.CopyReferralLink,
      target_id: TargetId.InviteLedgerPage,
      extra: JSON.stringify({ surface: origin }),
    });
  };

  const handleShare = (channel: Channel) => {
    logEvent({
      event_name: LogEvent.InviteLedgerChannelClick,
      target_type: TargetType.InviteLedgerPage,
      extra: JSON.stringify({ surface: origin, channel: channel.id }),
    });
  };

  // Strip protocol for a cleaner editorial read.
  const display = link.replace(/^https?:\/\//, '');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-stretch gap-px overflow-hidden rounded-8 border border-border-subtlest-secondary">
        <div className="flex min-w-0 flex-1 items-center bg-surface-float px-3 py-2">
          <code className="block w-full select-all truncate font-mono text-text-primary typo-footnote">
            {display}
          </code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={classNames(
            'shrink-0 border-l border-border-subtlest-secondary px-3 font-mono font-semibold uppercase tracking-[0.14em] transition-colors typo-caption2',
            copied
              ? 'bg-accent-avocado-subtlest text-accent-avocado-default'
              : 'bg-surface-float text-text-secondary hover:text-text-primary',
          )}
          aria-label={copied ? 'Copied' : copyLabel}
        >
          {copied ? 'copied' : copyLabel}
        </button>
      </div>

      <div className="flex items-center gap-px overflow-hidden rounded-8 border border-border-subtlest-secondary text-text-tertiary">
        <span className="flex items-center bg-surface-float px-2 py-1.5 font-mono uppercase tracking-[0.14em] typo-caption2">
          file
        </span>
        {CHANNELS.map((channel) => (
          <a
            key={channel.id}
            href={channel.build(link, SHARE_TEXT)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleShare(channel)}
            aria-label={CHANNEL_LABEL[channel.id]}
            className="flex min-w-[2rem] flex-1 items-center justify-center border-l border-border-subtlest-secondary bg-surface-float px-2 py-1.5 font-mono font-semibold uppercase tracking-[0.14em] transition-colors typo-caption2 hover:bg-surface-hover hover:text-text-primary"
          >
            {channel.short}
          </a>
        ))}
      </div>
    </div>
  );
};
