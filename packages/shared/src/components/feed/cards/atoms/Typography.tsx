import { ReactElement } from 'react';
import classed from '../../../../lib/classed';

export const enum TypographyElement {
  P = 'p',
  H1 = 'h1',
}
export const enum TypographyType {
  Giga1 = 'typo-giga1',
  Body = 'typo-body',
  Callout = 'typo-callout',
}
export function Typography({
  element = TypographyElement.P,
  type = TypographyType.Body,
  bold = false,
  children,
}): ReactElement {
  const Element = classed(element, type, bold && 'font-bold');
  return <Element>{children}</Element>;
}
