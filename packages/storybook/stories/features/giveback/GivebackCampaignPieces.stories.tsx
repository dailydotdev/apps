import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackBudgetStory } from '@dailydotdev/shared/src/features/giveback/components/GivebackBudgetStory';
import { GivebackSelectedCauses } from '@dailydotdev/shared/src/features/giveback/components/GivebackSelectedCauses';
import { GivebackFaq } from '@dailydotdev/shared/src/features/giveback/components/GivebackFaq';
import { withGiveback } from './giveback.mocks';

// The building blocks of the Campaign ("why") tab, each on its own so you can
// refine them in isolation: the emotional budget story, the editable list of
// your picked causes (with the edit pop-up), and the FAQ.
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

export const SelectedCauses: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Your picked causes with an "Edit" button that opens the modal.',
      },
    },
  },
  render: () => <GivebackSelectedCauses />,
};

export const Faq: Story = {
  render: () => <GivebackFaq />,
};
