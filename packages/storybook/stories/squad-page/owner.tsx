import type { ReactElement } from 'react';
import React, { useState } from 'react';
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

/** ProfilePreviewToggle: the page as a follower-to-be sees it. */
export const PreviewModeToggle = ({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}): ReactElement => (
  <div className="flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <EyeIcon
        size={IconSize.Medium}
        className="shrink-0 text-text-tertiary"
        secondary
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-body">
          Preview mode
        </span>
        <span className="break-words text-text-tertiary typo-footnote">
          See how your page looks to others
        </span>
      </div>
    </div>
    <Switch
      inputId="squad-preview-toggle"
      name="squadPreview"
      checked={checked}
      onToggle={onToggle}
      compact={false}
      className="shrink-0 self-center"
      aria-label="Preview mode"
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
