import type { Meta, StoryObj } from '@storybook/react-vite';
import { LimitedReachCard } from '@dailydotdev/shared/src/components/post/analytics/LimitedReachCard';
import { LimitedReachReason } from '@dailydotdev/shared/src/graphql/posts';

const meta: Meta<typeof LimitedReachCard> = {
  title: 'Components/Post/LimitedReachCard',
  component: LimitedReachCard,
  decorators: [
    (Story) => (
      <div className="w-[30rem] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LimitedReachCard>;

export const FreeCompanyPage: Story = {
  args: { reason: LimitedReachReason.Locked, squadHandle: 'acme' },
};

export const PaidPlan: Story = {
  args: { reason: LimitedReachReason.AiWritten, squadHandle: 'acme' },
};
