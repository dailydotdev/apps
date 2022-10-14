import classed from '../../lib/classed';

export const AlertBackground = classed(
  'div',
  'absolute inset-0 -z-1 w-full h-full opacity-24',
);

export const Alert = classed('div', 'relative p-4 border rounded-8');

export const AlertPointerWrapper = classed(
  'div',
  'flex relative flex-row justify-center items-center',
);
export const AlertPointerContainer = classed(
  'div',
  'flex absolute justify-center items-center w-max',
);
export const AlertPointerMessage = classed(
  'div',
  'p-3 border rounded-10 flex flex-row font-normal relative',
);
export const AlertPointerCopy = classed('p', 'typo-subhead');
