import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyType,
  TypographyTag,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { IconSize } from '../../../../components/Icon';
import {
  TerminalIcon,
  BookmarkIcon,
  SpotifyIcon,
  EarthIcon,
} from '../../../../components/icons';

interface CurrentlyItemProps {
  icon: ReactElement;
  label: string;
  value: string;
  subtext?: string;
  link?: string;
  accentColor?: string;
}

const CurrentlyItem = ({
  icon,
  label,
  value,
  subtext,
  link,
  accentColor = 'bg-surface-float',
}: CurrentlyItemProps): ReactElement => {
  const content = (
    <div
      className={`flex items-center gap-3 rounded-12 ${accentColor} p-3 transition-colors ${
        link ? 'hover:bg-surface-hover' : ''
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-10 bg-surface-secondary">
        {icon}
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-text-quaternary typo-footnote">{label}</span>
        <span className="font-medium text-text-primary typo-callout">
          {value}
        </span>
        {subtext && (
          <span className="text-text-tertiary typo-footnote">{subtext}</span>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
};

interface StatusBadgeProps {
  status: 'available' | 'busy' | 'away';
  text: string;
}

const StatusBadge = ({ status, text }: StatusBadgeProps): ReactElement => {
  const statusStyles = {
    available: 'bg-status-success/20 text-status-success',
    busy: 'bg-status-error/20 text-status-error',
    away: 'bg-status-warning/20 text-status-warning',
  };

  const dotStyles = {
    available: 'bg-status-success',
    busy: 'bg-status-error',
    away: 'bg-status-warning',
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-8 px-3 py-1.5 ${statusStyles[status]}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotStyles[status]}`} />
      <span className="typo-callout">{text}</span>
    </div>
  );
};

export const CurrentlySection = (): ReactElement => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Body}
          tag={TypographyTag.H2}
          color={TypographyColor.Primary}
          bold
        >
          Currently
        </Typography>
        <StatusBadge status="available" text="Open to chat" />
      </div>

      <div className="grid gap-2 tablet:grid-cols-2">
        {/* Working On */}
        <CurrentlyItem
          icon={
            <TerminalIcon
              size={IconSize.Medium}
              className="text-brand-default"
            />
          }
          label="Building"
          value="daily.dev v4.0"
          subtext="New profile experience"
        />

        {/* Listening To */}
        <CurrentlyItem
          icon={
            <SpotifyIcon
              size={IconSize.Medium}
              className="text-status-success"
            />
          }
          label="Listening to"
          value="Lo-fi Beats"
          subtext="Chillhop Music"
          link="https://open.spotify.com"
          accentColor="bg-status-success/5"
        />

        {/* Reading */}
        <CurrentlyItem
          icon={
            <BookmarkIcon
              size={IconSize.Medium}
              className="text-accent-bacon-default"
            />
          }
          label="Reading"
          value="Designing Data-Intensive Apps"
          subtext="Chapter 7: Transactions"
        />

        {/* Location */}
        <CurrentlyItem
          icon={
            <EarthIcon size={IconSize.Medium} className="text-text-tertiary" />
          }
          label="Based in"
          value="Tel Aviv, Israel"
          subtext="GMT+3 • 2:34 PM local time"
        />
      </div>

      {/* What I'm thinking about */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          On my mind
        </Typography>
        <div className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4">
          <p className="text-text-secondary typo-body">
            &ldquo;Exploring how we can make developer profiles more meaningful
            than just a list of skills. What if your profile actually showed how
            you think, learn, and grow as a developer?&rdquo;
          </p>
          <span className="mt-2 block text-text-quaternary typo-footnote">
            Updated 2 hours ago
          </span>
        </div>
      </div>

      {/* Quick Links / Social Presence */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Find me elsewhere
        </Typography>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Blog', url: '#', active: true },
            { label: 'Newsletter', url: '#', active: true },
            { label: 'YouTube', url: '#', active: false },
            { label: 'Podcast', url: '#', active: true },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              className={`flex items-center gap-1.5 rounded-10 border px-3 py-1.5 transition-colors ${
                link.active
                  ? 'border-border-subtlest-tertiary bg-surface-float text-text-primary hover:bg-surface-hover'
                  : 'border-border-subtlest-tertiary bg-transparent text-text-quaternary'
              } typo-callout`}
            >
              {link.label}
              {link.active && (
                <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
