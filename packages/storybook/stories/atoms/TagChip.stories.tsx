import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  TagChip,
  type TagChipSize,
} from '@dailydotdev/shared/src/components/tags/TagChip';

const meta: Meta<typeof TagChip> = {
  title: 'Atoms/TagChip',
  component: TagChip,
  parameters: {
    controls: { expanded: true },
    layout: 'padded',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'] satisfies TagChipSize[],
    },
    isFollowed: { control: 'boolean' },
    tag: { control: 'text' },
  },
  args: {
    tag: 'webdev',
    size: 'sm',
    isFollowed: false,
    onFollow: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof TagChip>;

/**
 * Default story — playground for tweaking size, followed state, and tag
 * label via Storybook controls. Use the controls panel to flip between
 * `sm` / `md` / `lg` and followed / not-followed.
 */
export const Default: Story = {};

/**
 * Three sizes, both states. Use this to compare densities side-by-side.
 *
 * The "followed" treatment is intentionally a plain bordered chip (no
 * separator, no action button) so it reads as a passive label. Unfollow
 * lives on the tag page itself, not inline — see the comment in
 * `TagChip.tsx` for the full rationale.
 */
export const SizesAndStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['sm', 'md', 'lg'] satisfies TagChipSize[]).map((size) => (
        <section key={size} className="flex flex-col gap-2">
          <div className="font-bold text-text-tertiary typo-footnote">
            Size: {size}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TagChip
              tag="webdev"
              size={size}
              isFollowed={false}
              onFollow={() => undefined}
            />
            <TagChip
              tag="javascript"
              size={size}
              isFollowed
              onFollow={() => undefined}
            />
            <TagChip
              tag="typescript"
              size={size}
              isFollowed={false}
              onFollow={() => undefined}
            />
            <TagChip
              tag="react"
              size={size}
              isFollowed
              onFollow={() => undefined}
            />
          </div>
        </section>
      ))}
    </div>
  ),
};

/**
 * Recommended surface mapping. Keep this in sync with `TagChip.tsx` so
 * call sites pick the right density.
 */
export const SurfaceUsage: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <div className="font-bold text-text-tertiary typo-footnote">
          sm (24 px) — article post / modal, in-card chips
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TagChip
            tag="webdev"
            size="sm"
            isFollowed={false}
            onFollow={() => undefined}
          />
          <TagChip
            tag="javascript"
            size="sm"
            isFollowed
            onFollow={() => undefined}
          />
          <TagChip
            tag="typescript"
            size="sm"
            isFollowed={false}
            onFollow={() => undefined}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="font-bold text-text-tertiary typo-footnote">
          md (32 px) — tags directory, search panels
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <TagChip
            tag="webdev"
            size="md"
            isFollowed={false}
            onFollow={() => undefined}
          />
          <TagChip
            tag="javascript"
            size="md"
            isFollowed
            onFollow={() => undefined}
          />
          <TagChip
            tag="typescript"
            size="md"
            isFollowed={false}
            onFollow={() => undefined}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="font-bold text-text-tertiary typo-footnote">
          lg (40 px) — featured / hero placements
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <TagChip
            tag="webdev"
            size="lg"
            isFollowed={false}
            onFollow={() => undefined}
          />
          <TagChip
            tag="javascript"
            size="lg"
            isFollowed
            onFollow={() => undefined}
          />
        </div>
      </section>
    </div>
  ),
};
