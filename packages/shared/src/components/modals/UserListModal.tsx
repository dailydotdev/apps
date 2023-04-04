import React, { ReactElement, ReactNode, useRef, useState } from 'react';
import { Modal, ModalProps } from './common/Modal';
import UserList, { UserListProps } from '../profile/UserList';
import { InfiniteScrollingProps } from '../containers/InfiniteScrolling';
import { UserShortProfile } from '../../lib/user';

export interface UserListModalProps extends Omit<ModalProps, 'children'> {
  users: UserShortProfile[];
  placeholderAmount?: number;
  title: string;
  header?: ReactNode;
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
  userListProps?: Pick<
    UserListProps,
    'additionalContent' | 'initialItem' | 'isLoading' | 'emptyPlaceholder'
  >;
}

function UserListModal({
  users,
  title,
  header,
  scrollingProps,
  placeholderAmount,
  size = Modal.Size.Medium,
  userListProps,
  ...props
}: UserListModalProps): ReactElement {
  const container = useRef<HTMLElement>();
  const [modalRef, setModalRef] = useState<HTMLElement>();

  return (
    <Modal
      contentRef={(e) => setModalRef(e)}
      kind={Modal.Kind.FlexibleCenter}
      size={size}
      {...props}
    >
      {header ?? <Modal.Header title={title} />}
      <Modal.Body className="py-2 px-0" ref={container}>
        <UserList
          {...userListProps}
          users={users}
          scrollingProps={scrollingProps}
          scrollingContainer={container.current}
          appendTooltipTo={modalRef}
          placeholderAmount={placeholderAmount}
        />
      </Modal.Body>
    </Modal>
  );
}

export default UserListModal;
