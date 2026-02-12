import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ExtensionProviders } from '../../../extension/_providers';
import { TweetProcessingError } from '@dailydotdev/shared/src/components/post/tweet/TweetProcessingError';

const meta: Meta<typeof TweetProcessingError> = {
  title: 'Components/Post/Tweet/TweetProcessingError',
  component: TweetProcessingError,
  args: {
    url: 'https://x.com/dailydotdev/status/1234567890123456789',
    onRetry: fn(),
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="max-w-2xl">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TweetProcessingError>;

export const Default: Story = {
  name: 'Default Error',
};

export const CustomMessage: Story = {
  name: 'Custom Error Message',
  args: {
    errorMessage: 'This tweet is no longer available',
  },
};

export const NoRetryButton: Story = {
  name: 'No Retry Button',
  args: {
    onRetry: undefined,
  },
};

export const NoViewOnX: Story = {
  name: 'No View on X Button',
  args: {
    showViewOnX: false,
  },
};

export const NoUrl: Story = {
  name: 'No URL',
  args: {
    url: undefined,
  },
};

export const MinimalError: Story = {
  name: 'Minimal (No Actions)',
  args: {
    onRetry: undefined,
    showViewOnX: false,
    url: undefined,
  },
};
