import classNames from 'classnames';
import React, { ReactElement } from 'react';
import { IconType } from '../../buttons/ButtonV2';
import {
  SearchPanelItemContainerProps,
  SearchPanelItemContainer,
} from './SearchPanelInputContainer';

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
        'flex w-full gap-2 overflow-hidden rounded-12 p-2 hover:bg-theme-float',
      )}
    >
      {!!icon && icon}
      {children}
    </SearchPanelItemContainer>
  );
};
