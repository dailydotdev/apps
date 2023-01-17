import React, { ReactElement, useRef, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import request from 'graphql-request';
import {
  UserShortInfoPlaceholder,
  UserShortInfoPlaceholderProps,
} from '../profile/UserShortInfoPlaceholder';
import { apiUrl } from '../../lib/config';
import { Modal, ModalProps } from './common/Modal';
import {
  Squad,
  SQUAD_MEMBERS_QUERY,
  SquadEdgesData,
} from '../../graphql/squads';
import { SquadMemberList } from '../profile/SquadMemberList';

export interface UpvotedPopupModalProps extends ModalProps {
  squad: Squad;
  listPlaceholderProps: UserShortInfoPlaceholderProps;
}

export function SquadMemberModal({
  squad,
  listPlaceholderProps,
  onRequestClose,
  ...modalProps
}: UpvotedPopupModalProps): ReactElement {
  const queryKey = ['squadMembers', squad?.id];
  const queryResult = useInfiniteQuery<SquadEdgesData>(
    queryKey,
    ({ pageParam }) =>
      request(
        `${apiUrl}/graphql`,
        SQUAD_MEMBERS_QUERY,
        { id: squad?.id, after: pageParam },
        { requestKey: JSON.stringify(queryKey) },
      ),
    {
      enabled: !!squad?.id,
      getNextPageParam: (lastPage) =>
        lastPage?.sourceMembers?.pageInfo?.hasNextPage &&
        lastPage?.sourceMembers?.pageInfo?.endCursor,
    },
  );

  const [page] = queryResult?.data?.pages || [];
  const container = useRef<HTMLElement>();
  const [modalRef, setModalRef] = useState<HTMLElement>();

  return (
    <Modal
      contentRef={(e) => setModalRef(e)}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      {...modalProps}
    >
      <Modal.Header title="Squad members" />
      <Modal.Body
        className="py-2 px-0"
        data-testid={`List of ${queryKey[0]} with ID ${queryKey[1]}`}
        ref={container}
      >
        {page?.sourceMembers.edges.length > 0 ? (
          <SquadMemberList
            queryResult={queryResult}
            scrollingContainer={container.current}
            appendTooltipTo={modalRef}
            squadId={squad?.id}
          />
        ) : (
          <UserShortInfoPlaceholder {...listPlaceholderProps} />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default SquadMemberModal;
