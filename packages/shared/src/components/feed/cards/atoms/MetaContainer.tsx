import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { TypographyProps } from './Typography';

type MetaContainerProps = Pick<
  TypographyProps<'p'>,
  'type' | 'color' | 'children'
>;
export default function MetaContainer({
  type,
  color,
  children,
}: MetaContainerProps): ReactElement {
  return <div className={classNames('flex', type, color)}>{children}</div>;
}
