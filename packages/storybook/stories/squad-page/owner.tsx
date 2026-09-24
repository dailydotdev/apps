import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CopyIcon,
  EyeIcon,
  FacebookIcon,
  LinkedInIcon,
  RedditIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  getFacebookShareLink,
  getLinkedInShareLink,
  getRedditShareLink,
  getTelegramShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
} from '@dailydotdev/shared/src/lib/share';
import { squad } from './data';

// The profile page's two owner tools, for the people who run the squad:
// ProfilePreviewToggle and the Share card, with the squad's copy.

export const squadPermalink = `https://app.daily.dev/squads/${squad.handle}`;
const shareText = `Check out ${squad.name} on daily.dev!`;

/**
 * ProfilePreviewToggle for the team, worded like LinkedIn's "View as
 * member": it names who you will see the page as, and says it in one line.
 */
export const PreviewModeToggle = ({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}): ReactElement => (
  <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary px-4 py-3">
    <EyeIcon
      size={IconSize.Small}
      secondary={checked}
      className={classNames(
        'shrink-0',
        checked ? 'text-text-primary' : 'text-text-tertiary',
      )}
    />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="font-bold text-text-primary typo-callout">
        View as a visitor
      </span>
      <span className="truncate text-text-tertiary typo-caption1">
        See what non-followers see
      </span>
    </div>
    <Switch
      inputId="squad-preview-toggle"
      name="squadPreview"
      checked={checked}
      onToggle={onToggle}
      compact
      className="shrink-0"
      aria-label="View as a visitor"
    />
  </div>
);

const networks = [
  {
    label: 'Share on X',
    icon: <TwitterIcon />,
    href: getTwitterShareLink(squadPermalink, shareText),
  },
  {
    label: 'Share on WhatsApp',
    icon: <WhatsappIcon />,
    href: getWhatsappShareLink(squadPermalink),
  },
  {
    label: 'Share on Facebook',
    icon: <FacebookIcon />,
    href: getFacebookShareLink(squadPermalink),
  },
  {
    label: 'Share on Reddit',
    icon: <RedditIcon />,
    href: getRedditShareLink(squadPermalink, shareText),
  },
  {
    label: 'Share on LinkedIn',
    icon: <LinkedInIcon />,
    href: getLinkedInShareLink(squadPermalink),
  },
  {
    label: 'Share on Telegram',
    icon: <TelegramIcon />,
    href: getTelegramShareLink(squadPermalink, shareText),
  },
];

/** The profile's Share card: the public address, copy, and one tap out. */
export const SharePageWidget = (): ReactElement => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(squadPermalink);
    } catch {
      // The preview may deny clipboard access; the state still confirms.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="flex flex-col rounded-16 border border-border-subtlest-tertiary p-4">
      <div className="flex w-full items-center gap-1">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-bold text-text-primary typo-callout">
            Public page & URL
          </span>
          <span className="truncate text-text-secondary typo-subhead">
            {squadPermalink}
          </span>
        </div>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={<CopyIcon secondary={copied} />}
          onClick={copy}
          aria-label={copied ? 'Copied!' : 'Copy link'}
          title={copied ? 'Copied!' : 'Copy link'}
        />
      </div>
      <div className="my-2 h-px w-full bg-border-subtlest-tertiary" />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-tertiary typo-subhead">Share</span>
        {networks.map(({ label, icon, href }) => (
          <Button
            key={label}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            icon={icon}
            tag="a"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
          />
        ))}
      </div>
    </section>
  );
};
