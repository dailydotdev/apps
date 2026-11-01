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
    'White, half width and 40px tall, next to “Forgot password?”',
    'The outlined secondary button, since the providers above lead. Full width and 48px tall, with “Forgot password?” under the password field.',
  ],
};

export const cardRow: CompareRow = {
  aspect: 'Card',
  cells: [
    '420px wide on desktop. A gray fill (light gray in light theme) under a different footer color.',
    '400px wide on desktop. The primary background on the whole pop-up and its footer, white in light theme.',
  ],
};

export const footerRow = (before: string): CompareRow => ({
  aspect: 'Footer',
  cells: [
    before,
    'One pinned bar on every pop-up: “Already have an account? Log in” on Sign up, “Don’t have an account? Sign up” everywhere else',
  ],
});

export const errorCopyRow: CompareRow = {
  aspect: 'Wrong-password error',
  cells: ['“…or create new account.”', '“…or create a new account.”'],
};
