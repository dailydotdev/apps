import classed from '../../lib/classed';
import { ElementPlaceholder } from '../ElementPlaceholder';

export const widgetClasses =
  'border border-border-subtlest-tertiary rounded-16';

export const WidgetContainer = classed('div', widgetClasses);

export const TextPlaceholder = classed(
  ElementPlaceholder,
  'h-3 rounded-12 my-0.5',
);

export const PlaceholderSeparator = classed(
  'div',
  'h-px bg-border-subtlest-tertiary',
);
