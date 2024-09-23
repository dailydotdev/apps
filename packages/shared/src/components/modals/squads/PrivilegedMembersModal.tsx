import React, { ReactElement } from 'react';
import Link from '../../utilities/Link';
import { Modal, ModalProps } from '../common/Modal';
import { SourceMember } from '../../../graphql/sources';
import { UserShortInfo } from '../../profile/UserShortInfo';
import SquadMemberBadge from '../../squads/SquadMemberBadge';
import { Origin } from '../../../lib/log';

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
            <UserShortInfo
              tag="a"
              href={user.permalink}
              user={user}
              showFollow
              origin={Origin.SquadMembersList}
            >
              <SquadMemberBadge className="mr-2" role={role} />
            </UserShortInfo>
          </Link>
        ))}
      </Modal.Body>
    </Modal>
  );
}

export default PrivilegedMembersModal;
