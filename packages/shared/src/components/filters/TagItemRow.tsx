import React, { HTMLAttributes, ReactElement } from 'react';
import { FilterItem } from './common';
import { getTooltipProps } from '../../lib/tooltip';
import { Button } from '../buttons/Button';
import MenuIcon from '../../../icons/menu.svg';

export default function TagItemRow({
  tooltip,
  tag,
  menu,
  onClick,
  ...props
}: {
  tooltip: string;
  tag: string;
  menu?: boolean;
  onClick?: (event: React.MouseEvent, tag: string) => unknown;
} & Omit<HTMLAttributes<HTMLAnchorElement>, 'onClick'>): ReactElement {
  return (
    <FilterItem className="relative my-2">
      <Button
        buttonSize="small"
        className="btn-tertiaryFloat"
        {...getTooltipProps(`${tag} feed`)}
        {...props}
      >
        {`#${tag}`}
      </Button>
      <Button
        className="right-4 my-auto btn-tertiary"
        style={{ position: 'absolute' }}
        onClick={(event) => onClick?.(event, tag)}
        icon={<MenuIcon />}
        {...getTooltipProps(tooltip, {
          position: 'left',
        })}
      />
    </FilterItem>
  );
}
