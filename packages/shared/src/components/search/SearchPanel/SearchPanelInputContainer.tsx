import React, { HTMLAttributes, ReactElement, ReactNode } from 'react';

export type SearchPanelItemContainerProps = {
  children?: ReactNode;
} & HTMLAttributes<HTMLButtonElement>;

export const SearchPanelItemContainer = ({
  children,
  ...props
}: SearchPanelItemContainerProps): ReactElement => {
  return (
    <button type="button" data-search-panel-item="true" {...props}>
      {children}
    </button>
  );
};
