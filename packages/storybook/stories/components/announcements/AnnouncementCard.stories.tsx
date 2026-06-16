import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnnouncementCard } from '@dailydotdev/shared/src/components/announcements/AnnouncementCard';
import { AnnouncementCardVariant } from '@dailydotdev/shared/src/components/announcements/types';
import {
  HotIcon,
  MegaphoneIcon,
  SparkleIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { cloudinarySquadsDirectoryCardBannerDefault } from '@dailydotdev/shared/src/lib/image';

// The card is built for the ~240px expanded sidebar — frame the single-variant
// stories at that width so spacing/truncation read true.
const framed: NonNullable<Story['decorators']> = (Story) => (
  <div className="w-60 rounded-16 bg-background-default p-3">
    <Story />
  </div>
);

const meta: Meta<typeof AnnouncementCard> = {
  title: 'Components/Announcements/Card',
  component: AnnouncementCard,
  parameters: {
    controls: { expanded: true },
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(AnnouncementCardVariant),
    },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AnnouncementCard>;

export const Compact: Story = {
  decorators: [framed],
  args: {
    variant: AnnouncementCardVariant.Compact,
    icon: <HotIcon size={IconSize.Small} />,
    title: 'Keyboard shortcuts are here',
    href: '#',
  },
};

export const CompactWithSubtitle: Story = {
  decorators: [framed],
  args: {
    variant: AnnouncementCardVariant.Compact,
    icon: <MegaphoneIcon size={IconSize.Small} />,
    title: 'Catch up on everything new',
    description: 'Browse the full changelog',
    href: '#',
  },
};

export const Default: Story = {
  decorators: [framed],
  args: {
    variant: AnnouncementCardVariant.Default,
    icon: <SparkleIcon size={IconSize.Small} />,
    badge: { label: 'Updated' },
    title: 'Smarter custom feeds',
    description:
      'Custom feeds now learn from what you read to surface more of what matters.',
    cta: { text: 'See what changed', href: '#' },
    onClose: () => undefined,
  },
};

export const Cover: Story = {
  decorators: [framed],
  args: {
    variant: AnnouncementCardVariant.Cover,
    image: cloudinarySquadsDirectoryCardBannerDefault,
    badge: { label: 'New' },
    title: 'Introducing Clips',
    description:
      'Save the best moments from any post and share them with your network in one tap.',
    cta: { text: 'Try Clips', href: '#' },
    onClose: () => undefined,
  },
};

export const WithoutDismiss: Story = {
  name: 'Default · no dismiss',
  decorators: [framed],
  args: {
    ...Default.args,
    onClose: undefined,
  },
};

const allVariants = [
  {
    label: 'Compact',
    props: Compact.args,
  },
  {
    label: 'Default',
    props: Default.args,
  },
  {
    label: 'Cover',
    props: Cover.args,
  },
];

export const AllVariants: StoryObj = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-screen items-start gap-8 bg-background-default p-6">
      {allVariants.map(({ label, props }) => (
        <div key={label} className="flex w-60 flex-col gap-2">
          <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
            {label}
          </span>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <AnnouncementCard {...(props as any)} />
        </div>
      ))}
    </div>
  ),
};
