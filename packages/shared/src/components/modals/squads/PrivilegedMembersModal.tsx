import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import type { Source } from '../../../graphql/sources';
import { SquadUsersModal } from './SquadUsersModal';

export interface PrivilegedMembersModalProps
  extends Omit<ModalProps, 'children'> {
  source: Pick<Source, 'handle'>;
}

function PrivilegedMembersModal({
  source,
  ...props
}: PrivilegedMembersModalProps): ReactElement {
  return (
    <SquadUsersModal
      {...props}
      source={source}
      title="Moderated by"
      getUsers={(squad) =>
        squad?.privilegedMembers?.map(({ user, role }) => ({
          ...user,
          role,
        })) ?? []
      }
    />
  );
}

export default PrivilegedMembersModal;
