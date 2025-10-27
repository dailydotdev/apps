import { fn } from 'storybook/test';

export const useToastNotification = fn(() => ({
  displayToast: fn((message: string) => {
    console.log('Toast:', message);
  }),
  dismissToast: fn(),
}));

