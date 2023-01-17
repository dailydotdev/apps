import React, { ReactElement, useRef, useState } from 'react';
import { UserShortInfoPlaceholder } from '../profile/UserShortInfoPlaceholder';
import { Modal, ModalProps } from './common/Modal';
import UserList from '../profile/UserList';
import { InfiniteScrollingProps } from '../containers/InfiniteScrolling';
import { UserShortProfile } from '../../lib/user';

export interface UserListModalProps extends Omit<ModalProps, 'children'> {
  users: UserShortProfile[];
  placeholderAmount?: number;
  title: string;
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
}

function UserListModal({
  users,
  title,
  scrollingProps,
  placeholderAmount,
  ...props
}: UserListModalProps): ReactElement {
  const container = useRef<HTMLElement>();
  const [modalRef, setModalRef] = useState<HTMLElement>();

  return (
    <Modal
      contentRef={(e) => setModalRef(e)}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      {...props}
    >
      <Modal.Header title={title} />
      <Modal.Body className="py-2 px-0" ref={container}>
        {users?.length ? (
          <UserList
            users={users}
            scrollingProps={scrollingProps}
            scrollingContainer={container.current}
            appendTooltipTo={modalRef}
            placeholderAmount={placeholderAmount}
          />
        ) : (
          <UserShortInfoPlaceholder placeholderAmount={placeholderAmount} />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default UserListModal;
