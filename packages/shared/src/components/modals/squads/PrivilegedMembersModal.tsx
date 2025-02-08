import type { ReactElement } from 'react';
import React from 'react';
import Link from '../../utilities/Link';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import type { Source } from '../../../graphql/sources';
import { UserShortInfo } from '../../profile/UserShortInfo';
import { Origin } from '../../../lib/log';
import { useSquad } from '../../../hooks';

import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSourceContentPreferenceMutationSubscription } from '../../../hooks/contentPreference/useSourceContentPreferenceMutationSubscription';
import UserBadge, { getBadgeColorByRole } from '../../UserBadge';

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
              <UserBadge className="mr-2" color={getBadgeColorByRole(role)}>
                {role}
              </UserBadge>
            </UserShortInfo>
          </Link>
        ))}
      </Modal.Body>
    </Modal>
  );
}

export default PrivilegedMembersModal;
