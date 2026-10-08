// A phone held sideways is wider than the tablet breakpoint but no taller
// than a phone is wide, and under a finger. It keeps the phone shell. Every
// tablet is taller or wider than that, so a keyboard shortening a tablet's
// window never flips it to the shell, and a mouse never matches at all.
const phoneLandscapeQuery =
  '(pointer: coarse) and (max-height: 500px) and (max-width: 959.98px)';

export const mobileM = `@media (min-width: 356px)`;
export const mobileL = `@media (min-width: 420px)`;
export const mobileXL = `@media (min-width: 500px)`;
export const tablet = `@media (min-width: 656px) and (pointer: fine), (min-width: 656px) and (pointer: none), (min-width: 656px) and (min-height: 500.02px), (min-width: 960px)`;
export const phone = `@media (max-width: 655.98px), ${phoneLandscapeQuery}`;
export const phoneLandscape = `@media (min-width: 656px) and ${phoneLandscapeQuery}`;
export const laptop = `@media (min-width: 1020px)`;
export const laptopL = `@media (min-width: 1360px)`;
export const laptopXL = `@media (min-width: 1668px)`;
export const desktop = `@media (min-width: 1976px)`;
export const desktopL = `@media (min-width: 2156px)`;
