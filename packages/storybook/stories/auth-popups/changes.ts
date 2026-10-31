import type { CompareRow } from './kit';

export const closeRow: CompareRow = {
  aspect: 'Close button',
  cells: [
    'On the left on phones, where a back arrow sits on the other screens. On the right on desktop.',
    'On the right at every size, like the landing page',
  ],
};

export const paddingRow: CompareRow = {
  aspect: 'Side padding',
  cells: ['24px on phones, 60px on desktop', '24px at every size'],
};

export const iconsRow: CompareRow = {
  aspect: 'Provider icons',
  cells: [
    '32px, larger than the landing page’s 24px marks',
    '28px, so the Google mark matches the landing page',
  ],
};

export const logInButtonRow: CompareRow = {
  aspect: 'Log in button',
  cells: [
    'Half width and 40px tall, next to “Forgot password?”',
    'Full width and 48px tall like the provider buttons, with “Forgot password?” under the password field',
  ],
};

export const errorCopyRow: CompareRow = {
  aspect: 'Wrong-password error',
  cells: ['“…or create new account.”', '“…or create a new account.”'],
};
