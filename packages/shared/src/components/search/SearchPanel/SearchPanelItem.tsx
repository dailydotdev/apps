import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import type { IconType } from '../../buttons/Button';
import type { SearchPanelItemContainerProps } from './SearchPanelInputContainer';
import { SearchPanelItemContainer } from './SearchPanelInputContainer';

export type SearchPanelItemProps = {
  icon?: IconType;
} & SearchPanelItemContainerProps;

export const SearchPanelItem = ({
  icon,
  children,
  ...props
}: SearchPanelItemProps): ReactElement => {
  return (
    <SearchPanelItemContainer
      {...props}
      className={classNames(
        props.className,
        'rounded-12 hover:bg-surface-float focus:bg-surface-float laptop:text-text-tertiary flex w-full items-center gap-2 overflow-hidden p-2',
      )}
    >
      {!!icon && icon}
      {children}
    </SearchPanelItemContainer>
  );
};
