import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useQueryClient } from '@tanstack/react-query';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import ExtensionProviders from '../../extension/_providers';

// The transient, app-level toast (bottom-left). This is the SAME component the
// app ships (Toast.tsx). Storybook mocks `useToastNotification`, so instead of
// calling the hook we seed the toast query cache directly — the exact key/shape
// the real Toast reads — and let the real component render, animate and dismiss.
//
// `variant` values mirror ToastType ('success' | 'error' | …); Toast maps them
// to the leading status icon + color.

const TOAST_NOTIF_KEY = ['toast_notif'];

const meta: Meta = {
  title: 'Components/Notifications/Toast (live)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Live transient toast — the real Toast.tsx. The chip background inverts per theme, so status colors and text resolve against the chip, not the page. See also the deeper design playground at Components/Toast/Redesign Comparison.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
        {/* Auto-dismiss on so the countdown ring is visible. */}
        <Toast autoDismissNotifications />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

type Variant =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading';

const Triggers = (): React.ReactElement => {
  const client = useQueryClient();

  const fire =
    (message: string, variant?: Variant, extra?: Record<string, unknown>) =>
    () =>
      client.setQueryData(TOAST_NOTIF_KEY, {
        message,
        timer: 6000,
        variant,
        ...extra,
      });

  const variants: Array<{ label: string; message: string; variant?: Variant }> =
    [
      { label: 'Default', message: 'Saved to your bookmarks' },
      {
        label: 'Success',
        message: 'Post shared successfully',
        variant: 'success',
      },
      {
        label: 'Error',
        message: 'Something went wrong, try again',
        variant: 'error',
      },
      {
        label: 'Warning',
        message: 'Your session is about to expire',
        variant: 'warning',
      },
      { label: 'Info', message: 'Syncing your preferences', variant: 'info' },
      { label: 'Loading', message: 'Uploading…', variant: 'loading' },
    ];

  return (
    <div className="flex max-w-md flex-col items-start gap-3 p-8">
      <p className="text-text-tertiary typo-callout">
        Fire a toast — it appears bottom-left. Hover to pause the dismiss ring.
      </p>
      <div className="flex flex-row flex-wrap gap-2">
        {variants.map(({ label, message, variant }) => (
          <Button
            key={label}
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            onClick={fire(message, variant)}
          >
            {label}
          </Button>
        ))}
      </div>
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        onClick={fire('Removed from your feed', undefined, {
          timer: 8000,
          action: { copy: 'Undo', onClick: () => undefined },
        })}
      >
        With action (Undo)
      </Button>
    </div>
  );
};

export const Playground: Story = {
  render: () => <Triggers />,
};
