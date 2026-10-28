import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions } from '../../../graphql/sources';
import { verifyPermission } from '../../../graphql/squads';
import type { ButtonSize } from '../../../components/buttons/Button';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import { EditIcon } from '../../../components/icons';
import Link from '../../../components/utilities/Link';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { TooltipLinkWrapper } from '../../../components/tooltip/TooltipLinkWrapper';
import { getSquadManageUrl, SquadManageSection } from '../lib/routes';

interface SquadRulesEditButtonProps {
  squad: Squad;
  size: ButtonSize;
  className?: string;
}

// Preview drops the viewer's membership, so "View as a visitor" hides it too.
export const SquadRulesEditButton = ({
  squad,
  size,
  className,
}: SquadRulesEditButtonProps): ReactElement | null => {
  if (!verifyPermission(squad, SourcePermissions.Edit)) {
    return null;
  }

  const url = getSquadManageUrl(squad.handle, SquadManageSection.Rules);

  return (
    <Tooltip content="Edit rules">
      <TooltipLinkWrapper className={className}>
        <Link href={url} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Tertiary}
            size={size}
            icon={<EditIcon />}
            aria-label="Edit rules"
          />
        </Link>
      </TooltipLinkWrapper>
    </Tooltip>
  );
};
