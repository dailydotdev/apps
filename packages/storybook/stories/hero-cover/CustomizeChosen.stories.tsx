import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chosen } from './CustomizeEntry.stories';

const meta: Meta = {
  title: 'Hero Cover/Final/2. Customize',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Customize: StoryObj = { ...Chosen, name: '2. Customize' };
