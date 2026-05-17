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

type Tone = 'avocado' | 'water' | 'cabbage' | 'salt' | 'bacon' | 'cheese';

interface Channel {
  provider: ShareProvider;
  label: string;
  icon: ReactElement;
  tone: Tone;
}

const toneClasses: Record<Tone, string> = {
  avocado:
    'hover:border-accent-avocado-default/50 hover:text-accent-avocado-default hover:bg-accent-avocado-subtlest',
  water:
    'hover:border-accent-water-default/50 hover:text-accent-water-default hover:bg-accent-water-subtlest',
  cabbage:
    'hover:border-accent-cabbage-default/50 hover:text-accent-cabbage-default hover:bg-accent-cabbage-subtlest',
  salt: 'hover:border-text-secondary hover:text-text-primary hover:bg-surface-float',
  bacon:
    'hover:border-accent-bacon-default/50 hover:text-accent-bacon-default hover:bg-accent-bacon-subtlest',
  cheese:
    'hover:border-accent-cheese-default/50 hover:text-accent-cheese-default hover:bg-accent-cheese-subtlest',
};

const CHANNELS: Channel[] = [
  {
    provider: ShareProvider.WhatsApp,
    label: 'WhatsApp',
    icon: <WhatsappIcon size={IconSize.Size16} />,
    tone: 'avocado',
  },
  {
    provider: ShareProvider.LinkedIn,
    label: 'LinkedIn',
    icon: <LinkedInIcon size={IconSize.Size16} />,
    tone: 'water',
  },
  {
    provider: ShareProvider.Telegram,
    label: 'Telegram',
    icon: <TelegramIcon size={IconSize.Size16} />,
    tone: 'water',
  },
  {
    provider: ShareProvider.Twitter,
    label: 'X',
    icon: <TwitterIcon size={IconSize.Size16} />,
    tone: 'salt',
  },
  {
    provider: ShareProvider.Email,
    label: 'Email',
    icon: <MailIcon size={IconSize.Size16} />,
    tone: 'bacon',
  },
];

const baseChip =
  'inline-flex items-center gap-1.5 rounded-10 border border-border-subtlest-secondary bg-surface-float/60 px-3 py-1.5 font-semibold text-text-secondary transition-all duration-150 hover:-translate-y-px typo-footnote';

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
    <div className="flex flex-wrap gap-2">
      <span className="self-center text-text-tertiary typo-footnote">
        Or share via
      </span>
      {CHANNELS.map(({ provider, label, icon, tone }) => (
        <a
          key={provider}
          className={classNames(baseChip, toneClasses[tone])}
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
        className={classNames(baseChip, toneClasses.cheese)}
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
