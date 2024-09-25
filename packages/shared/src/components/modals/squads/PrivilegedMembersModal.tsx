import React, { ReactElement } from 'react';
import Link from '../../utilities/Link';
import { Modal, ModalProps } from '../common/Modal';
import { Source } from '../../../graphql/sources';
import { UserShortInfo } from '../../profile/UserShortInfo';
import SquadMemberBadge from '../../squads/SquadMemberBadge';
import { Origin } from '../../../lib/log';
import { useSquad } from '../../../hooks';

import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSourceContentPreferenceMutationSubscription } from '../../../hooks/contentPreference/useSourceContentPreferenceMutationSubscription';

export interface PrivilegedMembersModalProps
  extends Omit<ModalProps, 'children'> {
  source: Pick<Source, 'handle'>;
}

function PrivilegedMembersModal({
  source,
  ...props
}: PrivilegedMembersModalProps): ReactElement {
  const { user: loggedUser } = useAuthContext();
  const { squad } = useSquad({ handle: source.handle });

  useSourceContentPreferenceMutationSubscription({
    queryKey: generateQueryKey(RequestKey.Squad, loggedUser, source.handle),
  });

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header title="Moderated by" />
      <Modal.Body className="!p-0">
        {squad.privilegedMembers?.map(({ user, role }) => (
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
