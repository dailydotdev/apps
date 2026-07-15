import type { Meta, StoryObj } from '@storybook/react-vite';
import { GivebackActionCatalog } from '@dailydotdev/shared/src/features/giveback/components/GivebackActionCatalog';
import { mockActions, withGiveback } from './giveback.mocks';

// The "Take action" grid: paid growth actions with category filter chips and a
// "Show more" expand, plus the voluntary "love" actions. Each card opens the
// submission modal. Reads actions + categories from the actions query.
const meta: Meta<typeof GivebackActionCatalog> = {
  title: 'Features/Giveback/Action catalog',
  component: GivebackActionCatalog,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Filter by category, open a card to launch the submission modal. Shows the full catalog and an empty state.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GivebackActionCatalog>;

export const Default: Story = {
  decorators: [withGiveback()],
};

export const SingleCategory: Story = {
  parameters: {
    docs: { description: { story: 'Only content actions — no category chips.' } },
  },
  decorators: [
    withGiveback({
      actions: mockActions().filter((a) => a.categoryId === 'cat-content'),
      categories: [{ id: 'cat-content', title: 'Content' }],
    }),
  ],
};

export const Empty: Story = {
  decorators: [withGiveback({ actions: [], categories: [] })],
};
