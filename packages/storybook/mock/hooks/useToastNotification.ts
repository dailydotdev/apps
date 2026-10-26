import { fn } from 'storybook/test';

// The real key, so a story that renders the real Toast can show one.
export { TOAST_NOTIF_KEY } from '../../../shared/src/hooks/useToastNotification';

export const useToastNotification = fn(() => ({
  displayToast: fn((message: string) => {
    console.log('Toast:', message);
  }),
  dismissToast: fn(),
}));
