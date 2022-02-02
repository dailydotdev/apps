import classed from '../../lib/classed';

export const ModalHeader = classed(
  'header',
  'flex flex-row items-center py-2 px-3 h-14 border-b border-theme-divider-tertiary',
);

export const ModalSubTitle = classed('strong', 'typo-headline mb-2');
export const ModalText = classed('p', 'typo-callout text-theme-label-tertiary');
export const ModalSection = classed('section', 'flex flex-col p-6');
