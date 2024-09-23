import React, { ReactElement } from 'react';
import Link from '../../utilities/Link';
import { Modal, ModalProps } from '../common/Modal';
import { Source, Squad } from '../../../graphql/sources';
import { UserShortInfo } from '../../profile/UserShortInfo';
import SquadMemberBadge from '../../squads/SquadMemberBadge';
import { Origin } from '../../../lib/log';
import { useMutationSubscription, useSquad } from '../../../hooks';
import {
  ContentPreferenceMutation,
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from '../../../hooks/contentPreference/types';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { PropsParameters } from '../../../types';

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

  useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({
      mutation,
      variables: mutationVariables,
      queryClient: mutationQueryClient,
    }) => {
      const queryKey = generateQueryKey(
        RequestKey.Squad,
        loggedUser,
        source.handle,
      );
      const currentData = mutationQueryClient.getQueryData(queryKey);
      const [requestKey] = mutation.options.mutationKey as [
        RequestKey,
        ...unknown[],
      ];

      if (!currentData) {
        return;
      }

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];

      const { id: entityId } =
        mutationVariables as PropsParameters<ContentPreferenceMutation>;

      mutationQueryClient.setQueryData<Squad>(queryKey, (data) => {
        const newData = structuredClone(data);

        const followedMember = newData.privilegedMembers?.find(
          (item) => item.user.id === entityId,
        );

        if (followedMember?.user) {
          followedMember.user.contentPreference = nextStatus
            ? {
                ...followedMember.user.contentPreference,
                status: nextStatus,
              }
            : undefined;
        }

        return newData;
      });
    },
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
