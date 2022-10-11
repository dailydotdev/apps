import classed from '../../lib/classed';

export const AlertBackground = classed(
  'div',
  'absolute inset-0 -z-1 w-full h-full opacity-24',
);

export const Alert = classed('div', 'relative p-4 border rounded-8');

export const PointedAlertWrapper = classed(
  'div',
  'flex relative flex-row justify-center items-center',
);
export const PointedAlertContainer = classed(
  'div',
  'flex absolute justify-center items-center w-max',
);
export const PointedAlertMessage = classed(
  'div',
  'p-3 border border-theme-status-success rounded-10 flex flex-row',
);
export const PointedAlertCopy = classed('p', 'typo-subhead');
