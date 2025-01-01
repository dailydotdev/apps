import type { ReactElement } from 'react';
import React from 'react';
import { PageHeader, PageHeaderTitle } from './common';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { TypographyType } from '../typography/Typography';

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
      <PageHeaderTitle bold type={TypographyType.Title3}>
        Squad settings
      </PageHeaderTitle>
    </PageHeader>
  );
}
