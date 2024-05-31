import React, { ReactElement } from 'react';
import Link from 'next/link';
import { Modal, ModalProps } from '../common/Modal';
import { SourceMember } from '../../../graphql/sources';
import { UserShortInfo } from '../../profile/UserShortInfo';
import SquadMemberBadge from '../../squads/SquadMemberBadge';

export interface PrivilegedMembersModalProps
  extends Omit<ModalProps, 'children'> {
  members: SourceMember[];
}

function PrivilegedMembersModal({
  members,
  ...props
}: PrivilegedMembersModalProps): ReactElement {
  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header title="Moderated by" />
      <Modal.Body className="!p-0">
        {members.map(({ user, role }) => (
          <Link key={user.username} href={user.permalink}>
            <UserShortInfo tag="a" href={user.permalink} user={user}>
              <SquadMemberBadge role={role} />
            </UserShortInfo>
          </Link>
        ))}
      </Modal.Body>
    </Modal>
  );
}

export default PrivilegedMembersModal;
