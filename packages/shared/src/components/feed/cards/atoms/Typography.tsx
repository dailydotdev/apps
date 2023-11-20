import React, { HTMLAttributes, ReactElement } from 'react';
import classed from '../../../../lib/classed';

export const enum TypographyElement {
  TIME = 'time',
  P = 'p',
  H1 = 'h1',
}
export const enum TypographyType {
  Footnote = 'typo-footnote',
  Giga1 = 'typo-giga1',
  Body = 'typo-body',
  Callout = 'typo-callout',
  Title3 = 'typo-title3',
}
export const enum TypographyColor {
  Primary = 'text-theme-label-primary',
  Secondary = 'text-theme-label-secondary',
  Tertiary = 'text-theme-label-tertiary',
  Quaternary = 'text-theme-label-quaternary',
}

type AllowedTags = keyof Pick<JSX.IntrinsicElements, 'time' | 'p'>;
type AllowedElements = HTMLTimeElement | HTMLParagraphElement;
export type TypographyProps<Tag extends AllowedTags> = {
  element?: TypographyElement;
  type?: TypographyType;
  color?: TypographyColor;
  bold?: boolean;
} & HTMLAttributes<AllowedElements> &
  JSX.IntrinsicElements[Tag];

export function Typography<TagName extends AllowedTags>({
  element = TypographyElement.P,
  type,
  color,
  bold = false,
  children,
  ...props
}: TypographyProps<TagName>): ReactElement {
  const Element = classed(element, type, bold && 'font-bold', color);
  return <Element {...props}>{children}</Element>;
}
