import React, { HTMLAttributes, ReactElement, RefAttributes } from 'react';
import classNames from 'classnames';
import classed from '../../lib/classed';
import { truncateTextClassNames } from '../utilities/common';

export enum TypographyTag {
  Time = 'time',
  P = 'p',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
  Span = 'span',
  Label = 'label',
  Link = 'a',
}

export enum TypographyType {
  Caption2 = 'typo-caption2',
  Caption1 = 'typo-caption1',
  Footnote = 'typo-footnote',
  Subhead = 'typo-subhead',
  Callout = 'typo-callout',
  Body = 'typo-body',
  Title3 = 'typo-title3',
  Title2 = 'typo-title2',
  Title1 = 'typo-title1',
  LargeTitle = 'typo-large-title',
  Mega3 = 'typo-mega3',
  Mega2 = 'typo-mega2',
  Mega1 = 'typo-mega1',
  Giga3 = 'typo-giga3',
  Giga2 = 'typo-giga2',
  Giga1 = 'typo-giga1',
  Tera = 'typo-tera',
}

export enum TypographyColor {
  Primary = 'text-text-primary',
  Secondary = 'text-text-secondary',
  Tertiary = 'text-text-tertiary',
  Quaternary = 'text-text-quaternary',
  Disabled = 'text-text-disabled',
  Link = 'text-text-link',
  StatusSuccess = 'text-status-success',
  Plus = 'text-action-plus-default',
  Brand = 'text-brand-default',
}

export type AllowedTags = keyof Pick<JSX.IntrinsicElements, TypographyTag>;
type AllowedElements = HTMLTimeElement | HTMLParagraphElement;

export type TypographyProps<Tag extends AllowedTags> = {
  tag?: TypographyTag;
  type?: TypographyType;
  color?: TypographyColor;
  bold?: boolean;
  ref?: RefAttributes<AllowedElements>['ref'];
  truncate?: boolean;
} & HTMLAttributes<AllowedElements> &
  JSX.IntrinsicElements[Tag];

export function Typography<TagName extends AllowedTags>({
  tag = TypographyTag.P,
  type,
  color,
  bold = false,
  children,
  className,
  truncate = false,
  ...props
}: TypographyProps<TagName>): ReactElement {
  const classes = classNames(
    className,
    type,
    { 'font-bold': bold },
    color,
    truncate && truncateTextClassNames,
  );
  const Tag = classed(tag, classes);

  return <Tag {...props}>{children}</Tag>;
}
