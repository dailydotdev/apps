import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import type { Source } from '../../../graphql/sources';
import { SquadUsersModal } from './SquadUsersModal';

export interface TopMembersModalProps extends Omit<ModalProps, 'children'> {
  source: Pick<Source, 'handle'>;
}

function TopMembersModal({
  source,
  ...props
}: TopMembersModalProps): ReactElement {
  return (
    <SquadUsersModal
      {...props}
      source={source}
      title="Top members"
      getUsers={(squad) => squad?.topMembers ?? []}
    />
  );
}

export default TopMembersModal;
