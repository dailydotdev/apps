import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { TopReaderBadgeCompact } from '@dailydotdev/shared/src/components/badges/TopReaderBadgeCompact';

const badges = [
  { issuedAt: new Date('2026-04-01'), keyword: { value: 'github-actions', flags: { title: 'GitHub Actions' } } },
  { issuedAt: new Date('2026-06-01'), keyword: { value: 'clickhouse', flags: { title: 'ClickHouse' } } },
  { issuedAt: new Date('2026-05-01'), keyword: { value: 'content-creation', flags: { title: 'Content Creation' } } },
  { issuedAt: new Date('2026-03-01'), keyword: { value: 'rust', flags: { title: 'Rust' } } },
  { issuedAt: new Date('2026-02-01'), keyword: { value: 'react', flags: { title: 'React' } } },
];

const meta: Meta<typeof TopReaderBadgeCompact> = {
  title: 'components/TopReaderBadgeCompact',
  component: TopReaderBadgeCompact,
  render: () => {
    return (
      <div className="p-6">
        <div className="overflow-x-auto pb-2">
          <div className="flex w-max gap-4">
            {badges.map((badge) => (
              <div key={badge.keyword.value} className="shrink-0">
                <TopReaderBadgeCompact
                  issuedAt={badge.issuedAt}
                  keyword={badge.keyword}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<typeof TopReaderBadgeCompact>;

export const Row: Story = {};
