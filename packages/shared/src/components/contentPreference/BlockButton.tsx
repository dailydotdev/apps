import type { ReactElement } from 'react';
import React from 'react';
import type { ContentPreferenceType } from '../../graphql/contentPreference';
import { ContentPreferenceStatus } from '../../graphql/contentPreference';
import type { ButtonProps } from '../buttons/Button';
import { Button } from '../buttons/Button';
import { ButtonVariant, ButtonSize } from '../buttons/common';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';

type BlockButtonProps = {
  feedId: string;
  entityId: string;
  entityName: string;
  status?: ContentPreferenceStatus;
  entityType: ContentPreferenceType;
} & Pick<ButtonProps<'button'>, 'variant' | 'size' | 'className'>;

const BlockButton = ({
  variant = ButtonVariant.Secondary,
  size = ButtonSize.Small,
  feedId,
  entityId,
  entityName,
  entityType,
  status,
  ...attrs
}: BlockButtonProps): ReactElement => {
  const { block, unblock } = useContentPreference();

  return (
    <Button
      {...attrs}
      onClick={(e) => {
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
      type="button"
      variant={variant}
      size={size}
    >
      {status === ContentPreferenceStatus.Blocked ? 'Unblock' : 'Block'}
    </Button>
  );
};

export default BlockButton;
