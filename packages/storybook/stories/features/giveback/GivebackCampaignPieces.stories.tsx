import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackFaq } from '@dailydotdev/shared/src/features/giveback/components/GivebackFaq';
import { withGiveback } from './giveback.mocks';

// The building blocks of the FAQ tab. The campaign's "why" headline now lives in
// the page hero, so this is the FAQ on its own.
const meta: Meta = {
  title: 'Features/Giveback/Campaign pieces',
  parameters: { layout: 'padded' },
  decorators: [withGiveback({ selectedCauseIds: ['c-oss', 'c-access', 'c-docs'] })],
};

export default meta;

type Story = StoryObj;

export const Faq: Story = {
  render: () => <GivebackFaq />,
};
