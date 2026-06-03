import type { ReactElement } from 'react';
import React from 'react';
import type { UserShortProfile } from '../../../lib/user';
import type { Source, SourceMemberRole, Squad } from '../../../graphql/sources';
import { UserShortInfo } from '../../profile/UserShortInfo';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { Origin } from '../../../lib/log';
import { useSquad } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSourceContentPreferenceMutationSubscription } from '../../../hooks/contentPreference/useSourceContentPreferenceMutationSubscription';
import { generateQueryKey, RequestKey } from '../../../lib/query';

export interface SquadUsersModalProps extends Omit<ModalProps, 'children'> {
  source: Pick<Source, 'handle'>;
  title: string;
  getUsers: (
    squad: Squad | undefined,
  ) => Array<UserShortProfile & { role?: SourceMemberRole }>;
}

export function SquadUsersModal({
  source,
  title,
  getUsers,
  ...props
}: SquadUsersModalProps): ReactElement {
  const { user: loggedUser } = useAuthContext();
  const { squad } = useSquad({ handle: source.handle });

  useSourceContentPreferenceMutationSubscription({
    queryKey: generateQueryKey(RequestKey.Squad, loggedUser, source.handle),
  });

  const users = getUsers(squad);

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header title={title} />
      <Modal.Body className="!p-0">
        {users.map((user) => (
          <UserShortInfo
            key={user.id}
            tag="a"
            href={user.permalink}
            user={user}
            showFollow
            origin={Origin.SquadMembersList}
          />
        ))}
      </Modal.Body>
    </Modal>
  );
}
