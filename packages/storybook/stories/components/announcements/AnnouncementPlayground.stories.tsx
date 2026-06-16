import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnnouncementCarousel } from '@dailydotdev/shared/src/components/announcements/AnnouncementCarousel';
import { AnnouncementCardVariant } from '@dailydotdev/shared/src/components/announcements/types';
import type { AnnouncementItem } from '@dailydotdev/shared/src/components/announcements/types';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BellIcon,
  HotIcon,
  MagicIcon,
  MegaphoneIcon,
  SparkleIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { cloudinarySquadsDirectoryCardBannerDefault } from '@dailydotdev/shared/src/lib/image';

const seed = (): AnnouncementItem[] => [
  {
    id: 'clips',
    variant: AnnouncementCardVariant.Cover,
    image: cloudinarySquadsDirectoryCardBannerDefault,
    badge: { label: 'New' },
    title: 'Introducing Clips',
    description:
      'Save the best moments from any post and share them in one tap.',
    cta: { text: 'Try Clips', href: '#' },
  },
  {
    id: 'custom-feeds',
    variant: AnnouncementCardVariant.Default,
    badge: { label: 'Updated' },
    title: 'Smarter custom feeds',
    description:
      'Custom feeds now learn from what you read to surface more of what matters.',
    cta: { text: 'See what changed', href: '#' },
  },
  {
    id: 'shortcuts',
    variant: AnnouncementCardVariant.Compact,
    icon: <HotIcon size={IconSize.Small} />,
    title: 'Keyboard shortcuts are here',
    href: '#',
  },
  {
    id: 'digest',
    variant: AnnouncementCardVariant.Default,
    badge: { label: 'Beta' },
    title: 'Your weekly digest',
    description: 'A personalized briefing of the best posts, every Monday.',
    cta: { text: 'Enable digest', href: '#' },
  },
  {
    id: 'changelog',
    variant: AnnouncementCardVariant.Compact,
    icon: <MegaphoneIcon size={IconSize.Small} />,
    title: 'Catch up on everything new',
    description: 'Browse the full changelog',
    href: '#',
  },
];

const extras: AnnouncementItem[] = [
  {
    id: 'extra-magic',
    variant: AnnouncementCardVariant.Default,
    badge: { label: 'New' },
    icon: <MagicIcon size={IconSize.Small} />,
    title: 'AI-powered summaries',
    description: 'Get the gist of any long read in two lines.',
    cta: { text: 'Try it', href: '#' },
  },
  {
    id: 'extra-bell',
    variant: AnnouncementCardVariant.Compact,
    icon: <BellIcon size={IconSize.Small} />,
    title: 'Smarter notifications',
    href: '#',
  },
  {
    id: 'extra-sparkle',
    variant: AnnouncementCardVariant.Cover,
    image: cloudinarySquadsDirectoryCardBannerDefault,
    badge: { label: 'New' },
    icon: <SparkleIcon size={IconSize.Small} />,
    title: 'A fresh reading theme',
    description: 'Easier on the eyes during those late-night sessions.',
    cta: { text: 'Preview', href: '#' },
  },
];

const Chip = ({ children }: { children: string }): ReactElement => (
  <kbd className="rounded-6 border border-border-subtlest-tertiary bg-surface-float px-1.5 py-0.5 font-mono text-text-secondary typo-caption2">
    {children}
  </kbd>
);

const Playground = (): ReactElement => {
  const [items, setItems] = useState<AnnouncementItem[]>(seed);
  const [log, setLog] = useState<string[]>([]);
  const [extraIndex, setExtraIndex] = useState(0);

  const pushLog = (line: string): void =>
    setLog((prev) => [line, ...prev].slice(0, 8));

  const remaining = items.length;
  const addOne = (): void => {
    const next = extras[extraIndex % extras.length];
    const id = `${next.id}-${extraIndex}`;
    setItems((prev) => [...prev, { ...next, id }]);
    setExtraIndex((i) => i + 1);
    pushLog(`added · ${id}`);
  };

  const sidebarBg = useMemo(
    () =>
      'flex w-[17rem] flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default p-3',
    [],
  );

  return (
    <div className="flex min-h-screen flex-wrap items-start gap-10 bg-background-default p-8 text-text-primary">
      {/* Sidebar-like panel hosting the real carousel */}
      <div className="flex flex-col gap-3">
        <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
          Sidebar panel ({remaining} announcement{remaining === 1 ? '' : 's'})
        </span>
        <div className={sidebarBg}>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold text-text-primary typo-footnote">
              What&apos;s new
            </span>
          </div>
          {remaining > 0 ? (
            <AnnouncementCarousel
              items={items}
              onView={(item) => pushLog(`viewed · ${item.id}`)}
              onItemClick={(item) => pushLog(`clicked · ${item.id}`)}
              onDismiss={(id) => {
                pushLog(`dismissed · ${id}`);
                setItems((prev) => prev.filter((i) => i.id !== id));
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                You&apos;re all caught up 🎉
              </Typography>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Float}
                onClick={() => {
                  setItems(seed());
                  pushLog('reset');
                }}
              >
                Restore announcements
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Controls + how-to + event log */}
      <div className="flex w-80 flex-col gap-4">
        <div>
          <h3 className="font-bold typo-title3">Try the interactions</h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-text-secondary typo-footnote">
            <li>
              • <b>Switch</b>: click the dots, the{' '}
              <Chip>‹</Chip> <Chip>›</Chip> arrows, or press{' '}
              <Chip>←</Chip> <Chip>→</Chip> (focus a control first).
            </li>
            <li>
              • <b>Dismiss</b>: hit the <Chip>✕</Chip> — the card animates out
              and the next one slides up into its place.
            </li>
            <li>
              • <b>Stack</b>: the edges peeking under the card show there are
              more behind; they shrink as the stack empties.
            </li>
            <li>
              • <b>Empty</b>: dismiss them all to see the caught-up state, then
              restore.
            </li>
            <li>
              • <b>Motion</b>: enable “Reduce motion” in your OS — enter/exit
              animations are skipped automatically.
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            onClick={addOne}
          >
            Add announcement
          </Button>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            onClick={() => {
              setItems(seed());
              setExtraIndex(0);
              pushLog('reset');
            }}
          >
            Reset
          </Button>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            onClick={() => setItems([])}
          >
            Dismiss all
          </Button>
        </div>

        <div>
          <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
            Event log
          </span>
          <div className="mt-2 flex min-h-24 flex-col gap-1 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3 font-mono text-text-secondary typo-caption1">
            {log.length === 0 ? (
              <span className="text-text-quaternary">
                interactions will appear here…
              </span>
            ) : (
              log.map((line, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={i}>{line}</span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Components/Announcements/Playground',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: { disable: true },
  },
};

export default meta;

export const Interactive: StoryObj = {
  render: () => <Playground />,
};
