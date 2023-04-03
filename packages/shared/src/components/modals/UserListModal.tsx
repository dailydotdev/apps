import React, { ReactElement, ReactNode, useRef, useState } from 'react';
import { UserShortInfoPlaceholder } from '../profile/UserShortInfoPlaceholder';
import { Modal, ModalProps } from './common/Modal';
import UserList, { UserListProps } from '../profile/UserList';
import { InfiniteScrollingProps } from '../containers/InfiniteScrolling';
import { UserShortProfile } from '../../lib/user';

export interface UserListModalProps
  extends Omit<ModalProps, 'children'>,
    Pick<UserListProps, 'additionalContent' | 'initialItem'> {
  users: UserShortProfile[];
  placeholderAmount?: number;
  title: string;
  header?: ReactNode;
  scrollingProps: Omit<InfiniteScrollingProps, 'children'>;
}

function UserListModal({
  users,
  title,
  header,
  scrollingProps,
  placeholderAmount,
  additionalContent,
  size = Modal.Size.Medium,
  initialItem,
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
        {users?.length ? (
          <UserList
            users={users}
            scrollingProps={scrollingProps}
            scrollingContainer={container.current}
            appendTooltipTo={modalRef}
            placeholderAmount={placeholderAmount}
            additionalContent={additionalContent}
            initialItem={initialItem}
          />
        ) : (
          <UserShortInfoPlaceholder placeholderAmount={placeholderAmount} />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default UserListModal;
