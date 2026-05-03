import type { ReactElement } from 'react';
import React from 'react';
import type { ContentPreferenceType } from '../../graphql/contentPreference';
import { ContentPreferenceStatus } from '../../graphql/contentPreference';
import type { ButtonV2Props } from '../buttons/ButtonV2';
import { ButtonV2 } from '../buttons/ButtonV2';
import { ButtonVariant, ButtonSize } from '../buttons/common';
import { useContentPreference } from '../../hooks/contentPreference/useContentPreference';

type BlockButtonProps = {
  feedId: string;
  entityId: string;
  entityName: string;
  status?: ContentPreferenceStatus;
  entityType: ContentPreferenceType;
} & Pick<ButtonV2Props<'button'>, 'variant' | 'size' | 'className'>;

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
    <ButtonV2
      {...attrs}
      onClick={() => {
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
    </ButtonV2>
  );
};

export default BlockButton;
