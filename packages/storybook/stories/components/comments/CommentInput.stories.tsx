import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import { BootApp } from '@dailydotdev/shared/src/lib/boot';
import CommentInput from '@dailydotdev/shared/src/components/comments/CommentInput';
import post from '@dailydotdev/shared/__tests__/fixture/post';
import { getBootMock } from '../../../mock/boot';

const meta: Meta<typeof CommentInput> = {
  title: 'Components/Comments/CommentInput',
  component: CommentInput,
  parameters: {
    viewport: { defaultViewport: 'mobile2' },
  },
  render: (props) => {
    const [queryClient] = useState(() => new QueryClient());
    const [open, setOpen] = useState(false);
    if (!document.getElementById('__next')) {
      const appRoot = document.createElement('div');
      appRoot.id = '__next';
      document.body.appendChild(appRoot);
    }
    return (
      <QueryClientProvider client={queryClient}>
        <BootDataProvider
          app={BootApp.Webapp}
          deviceId="123"
          getPage={fn()}
          getRedirectUri={fn()}
          version="pwa"
          localBootData={getBootMock()}
        >
          {open ? (
            <CommentInput {...props} post={post} onClose={() => setOpen(false)} />
          ) : (
            <button type="button" onClick={() => setOpen(true)}>
              Open composer
            </button>
          )}
        </BootDataProvider>
      </QueryClientProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof CommentInput>;

export const NewCommentComposer: Story = {};

export const ReplyComposer: Story = {
  args: { replyTo: 'database-star', parentCommentId: 'c1' },
};
