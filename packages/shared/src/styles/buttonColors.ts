import { ColorName } from './colors';

// The colors `tailwind/buttons.ts` generates `btn-{variant}-{color}` classes
// for, so the only ones `Button` accepts.
// eslint-disable-next-line no-redeclare
export const ButtonColor = {
  BlueCheese: ColorName.BlueCheese,
  Avocado: ColorName.Avocado,
  Cheese: ColorName.Cheese,
  Bun: ColorName.Bun,
  Ketchup: ColorName.Ketchup,
  Bacon: ColorName.Bacon,
  Cabbage: ColorName.Cabbage,
  Water: ColorName.Water,
  Twitter: ColorName.Twitter,
  WhatsApp: ColorName.WhatsApp,
  Facebook: ColorName.Facebook,
  Reddit: ColorName.Reddit,
  LinkedIn: ColorName.LinkedIn,
  Telegram: ColorName.Telegram,
} as const;

export type ButtonColor = (typeof ButtonColor)[keyof typeof ButtonColor];

// `ButtonV2` takes a color on Tertiary only, and `tailwind/buttons-v2.ts`
// generates `btn-v2-tertiary-{color}` for these.
// eslint-disable-next-line no-redeclare
export const ButtonV2Color = {
  BlueCheese: ColorName.BlueCheese,
  Avocado: ColorName.Avocado,
  Cheese: ColorName.Cheese,
  Bun: ColorName.Bun,
  Ketchup: ColorName.Ketchup,
  Cabbage: ColorName.Cabbage,
  Water: ColorName.Water,
} as const;

export type ButtonV2Color = (typeof ButtonV2Color)[keyof typeof ButtonV2Color];
