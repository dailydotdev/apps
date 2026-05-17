import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ShareProvider, getShareLink } from '../../../lib/share';
import { labels } from '../../../lib';
import { useCopyLink } from '../../../hooks/useCopy';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  WhatsappIcon,
  LinkedInIcon,
  TelegramIcon,
  TwitterIcon,
  MailIcon,
  CopyIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface ChannelChipsProps {
  link: string;
}

interface Channel {
  provider: ShareProvider;
  label: string;
  icon: ReactElement;
}

const CHANNELS: Channel[] = [
  {
    provider: ShareProvider.WhatsApp,
    label: 'WhatsApp',
    icon: <WhatsappIcon size={IconSize.Size16} />,
  },
  {
    provider: ShareProvider.LinkedIn,
    label: 'LinkedIn',
    icon: <LinkedInIcon size={IconSize.Size16} />,
  },
  {
    provider: ShareProvider.Telegram,
    label: 'Telegram',
    icon: <TelegramIcon size={IconSize.Size16} />,
  },
  {
    provider: ShareProvider.Twitter,
    label: 'X',
    icon: <TwitterIcon size={IconSize.Size16} />,
  },
  {
    provider: ShareProvider.Email,
    label: 'Email',
    icon: <MailIcon size={IconSize.Size16} />,
  },
];

const chipClass = classNames(
  'inline-flex items-center gap-1.5 rounded-8 border border-border-subtlest-secondary bg-transparent px-2.5 py-1 text-text-secondary transition-colors typo-caption1',
  'hover:border-text-secondary hover:bg-surface-hover hover:text-text-primary',
);

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
    <div className="flex flex-wrap items-center gap-1.5">
      {CHANNELS.map(({ provider, label, icon }) => (
        <a
          key={provider}
          className={chipClass}
          href={getShareLink({
            provider,
            link,
            text: labels.referral.generic.inviteText,
          })}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleClick(provider)}
        >
          {icon}
          {label}
        </a>
      ))}
      <button
        type="button"
        className={chipClass}
        onClick={() => {
          copyLink({ link });
          handleClick(ShareProvider.CopyLink);
        }}
      >
        <CopyIcon size={IconSize.Size16} />
        Copy
      </button>
    </div>
  );
};
