import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons';
import { FreeIcon } from './icons/Free';

const sizes = [
  IconSize.Size16,
  IconSize.Small,
  IconSize.Medium,
  IconSize.Large,
  IconSize.XLarge,
  IconSize.XXXLarge,
];

const Row = ({
  label,
  secondary,
}: {
  label: string;
  secondary?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <p className="font-bold text-text-tertiary typo-footnote">{label}</p>
    <div className="flex items-end gap-6 text-text-primary">
      {sizes.map((size) => (
        <FreeIcon key={size} size={size} secondary={secondary} />
      ))}
      <span className="text-text-tertiary typo-caption1">next to</span>
      <TimerIcon size={IconSize.Large} secondary={secondary} />
    </div>
  </div>
);

const FreeIconSheet = (): ReactElement => (
  <div className="flex min-h-screen flex-col gap-8 bg-background-default p-10">
    <Row label="Outlined" />
    <Row label="Filled" secondary />
  </div>
);

const meta: Meta = {
  title: 'Verify Work Email/3. Free icon',
  component: FreeIconSheet,
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** New icon for the "Free, and takes a minute" benefit, at every size. */
export const Sizes: StoryObj = {};
