import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackBudgetStory } from '@dailydotdev/shared/src/features/giveback/components/GivebackBudgetStory';
import { GivebackFaq } from '@dailydotdev/shared/src/features/giveback/components/GivebackFaq';
import { withGiveback } from './giveback.mocks';

// The building blocks of the FAQ tab, each on its own so you can refine them in
// isolation: the emotional budget story (the "why") and the FAQ.
const meta: Meta = {
  title: 'Features/Giveback/Campaign pieces',
  parameters: { layout: 'padded' },
  decorators: [withGiveback({ selectedCauseIds: ['c-oss', 'c-access', 'c-docs'] })],
};

export default meta;

type Story = StoryObj;

export const BudgetStory: Story = {
  render: () => (
    <GivebackBudgetStory
      headline={{ title: 'Big tech buys ads.', highlight: 'We fund developers.' }}
    />
  ),
};

export const Faq: Story = {
  render: () => <GivebackFaq />,
};
