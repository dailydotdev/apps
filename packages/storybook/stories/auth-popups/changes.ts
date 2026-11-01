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
    'Always 400×640 on desktop. The primary background on the whole pop-up and its footer, white in light theme.',
  ],
};

export const footerRow = (before: string): CompareRow => ({
  aspect: 'Footer',
  cells: [
    before,
    'One 52px bar pinned to the bottom of every pop-up: “Already have an account? Log in” on Sign up, “Don’t have an account? Sign up” everywhere else',
  ],
});

export const fieldsRow: CompareRow = {
  aspect: 'Fields',
  cells: [
    'A reserved message row under every field, 28px from one field to the next',
    'The same reserved row, so errors and the password strength never move the form, with 24px from one field to the next',
  ],
};

export const loginErrorsRow: CompareRow = {
  aspect: 'Errors',
  cells: [
    'An empty field shows only the browser’s tooltip. A wrong password turns just the email red, with the message under the Log in button. Any other failure turns the email red with no message at all.',
    'A message under an empty or invalid field. A wrong password or any other failure shows one strip right above the Log in button, like Sign up, and no field is blamed.',
  ],
};

export const errorCopyRow: CompareRow = {
  aspect: 'Wrong-password error',
  cells: ['“…or create new account.”', '“…or create a new account.”'],
};
