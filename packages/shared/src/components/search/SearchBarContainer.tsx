import React, { ReactElement, ReactNode } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import { AiIcon } from '../icons';
import { IconSize } from '../Icon';

export interface SearchBarContainerProps {
  children: ReactNode;
}

export const SearchBarContainer = ({
  children,
}: SearchBarContainerProps): ReactElement => {
  return (
    <div className="px-6 laptop:px-16 pt-10 bg-gradient-to-r test from-[#A223FF] to-[#4739E5]">
      {children}
    </div>
  );
};
