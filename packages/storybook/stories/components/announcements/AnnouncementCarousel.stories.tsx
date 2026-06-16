import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnnouncementCarousel } from '@dailydotdev/shared/src/components/announcements/AnnouncementCarousel';
import { AnnouncementCardVariant } from '@dailydotdev/shared/src/components/announcements/types';
import type { AnnouncementItem } from '@dailydotdev/shared/src/components/announcements/types';
import {
  HotIcon,
  MegaphoneIcon,
  SparkleIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { cloudinarySquadsDirectoryCardBannerDefault } from '@dailydotdev/shared/src/lib/image';

const sampleItems: AnnouncementItem[] = [
  {
    id: 'cover',
    variant: AnnouncementCardVariant.Cover,
    image: cloudinarySquadsDirectoryCardBannerDefault,
    badge: { label: 'New' },
    title: 'Introducing Clips',
    description:
      'Save the best moments from any post and share them in one tap.',
    cta: { text: 'Try Clips', href: '#' },
  },
  {
    id: 'default',
    variant: AnnouncementCardVariant.Default,
    icon: <SparkleIcon size={IconSize.Small} />,
    badge: { label: 'Updated' },
    title: 'Smarter custom feeds',
    description:
      'Custom feeds now learn from what you read to surface more of what matters.',
    cta: { text: 'See what changed', href: '#' },
  },
  {
    id: 'compact-1',
    variant: AnnouncementCardVariant.Compact,
    icon: <HotIcon size={IconSize.Small} />,
    title: 'Keyboard shortcuts are here',
    href: '#',
  },
  {
    id: 'compact-2',
    variant: AnnouncementCardVariant.Compact,
    icon: <MegaphoneIcon size={IconSize.Small} />,
    title: 'Catch up on everything new',
    description: 'Browse the full changelog',
    href: '#',
  },
];

// Local state so dismiss/advance behaves like the real sidebar hook.
const StatefulCarousel = ({
  initialItems,
}: {
  initialItems: AnnouncementItem[];
}) => {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="w-60 rounded-16 bg-background-default p-3">
      <AnnouncementCarousel
        items={items}
        onDismiss={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
      />
      {items.length === 0 && (
        <p className="text-text-tertiary typo-footnote">
          All caught up — nothing left to show.
        </p>
      )}
    </div>
  );
};

const meta: Meta<typeof AnnouncementCarousel> = {
  title: 'Components/Announcements/Carousel',
  component: AnnouncementCarousel,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
};

export default meta;

type Story = StoryObj<typeof AnnouncementCarousel>;

export const Stack: Story = {
  name: 'Stack (browse + dismiss)',
  render: () => <StatefulCarousel initialItems={sampleItems} />,
};

export const SingleItem: Story = {
  render: () => <StatefulCarousel initialItems={[sampleItems[1]]} />,
};

export const Empty: Story = {
  render: () => <StatefulCarousel initialItems={[]} />,
};
