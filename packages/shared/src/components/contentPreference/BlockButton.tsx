import type { ReactElement } from 'react';
import React from 'react';
import type { ContentPreferenceType } from '../../graphql/contentPreference';
import { ContentPreferenceStatus } from '../../graphql/contentPreference';
import { Button } from '../buttons/Button';
import { ButtonVariant, ButtonSize } from '../buttons/common';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';

type BlockButtonProps = {
  feedId: string;
  entityId: string;
  entityName: string;
  status?: ContentPreferenceStatus;
  entityType: ContentPreferenceType;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const BlockButton = ({
  variant = ButtonVariant.Secondary,
  size = ButtonSize.Small,
  feedId,
  entityId,
  entityName,
  entityType,
  status,
}: BlockButtonProps): ReactElement => {
  const { block, unblock } = useContentPreference();

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        if (status === ContentPreferenceStatus.Blocked) {
          unblock({
            id: entityId,
            entity: entityType,
            entityName,
            feedId,
          });
        } else {
          block({
            id: entityId,
            entity: entityType,
            entityName,
            feedId,
          });
        }
      }}
      variant={variant}
      size={size}
    >
      {status === ContentPreferenceStatus.Blocked ? 'Unblock' : 'Block'}
    </Button>
  );
};

export default BlockButton;
