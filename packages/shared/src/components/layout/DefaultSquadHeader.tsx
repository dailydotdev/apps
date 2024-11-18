import React, { ReactElement } from 'react';
import { PageHeader, PageHeaderTitle } from './common';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';

interface DefaultSquadHeaderProps {
  onClick?: () => void;
  className?: string;
}

export function DefaultSquadHeader({
  onClick,
  className,
}: DefaultSquadHeaderProps): ReactElement {
  return (
    <PageHeader className={className}>
      <Button
        onClick={onClick}
        variant={ButtonVariant.Tertiary}
        icon={<ArrowIcon className="-rotate-90" />}
      />
      <PageHeaderTitle className="typo-title3">Squad settings</PageHeaderTitle>
    </PageHeader>
  );
}
