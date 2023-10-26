import React, { ReactElement, ReactNode, useRef, useState } from 'react';
import { Modal, ModalProps } from './common/Modal';
import UserList, { UserListProps } from '../profile/UserList';
import { InfiniteScrollingProps } from '../containers/InfiniteScrolling';
import { UserShortProfile } from '../../lib/user';
import { SearchField } from '../fields/SearchField';

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
  onSearch?(query: string): void;
}

function UserListModal({
  users,
  title,
  header,
  scrollingProps,
  placeholderAmount,
  size = Modal.Size.Medium,
  userListProps,
  onSearch,
  ...props
}: UserListModalProps): ReactElement {
  const container = useRef<HTMLElement>();
  const [modalRef, setModalRef] = useState<HTMLElement>();

  const { onScroll, ...otherScrollingProps } = scrollingProps;

  return (
    <Modal
      contentRef={(e) => setModalRef(e)}
      kind={Modal.Kind.FlexibleCenter}
      size={size}
      {...props}
    >
      {header ?? <Modal.Header title={title} />}
      <Modal.Body className="py-0 px-0" onScroll={onScroll} ref={container}>
        {onSearch && (
          <SearchField
            className="my-4 mx-6"
            inputId="members-search"
            valueChanged={onSearch}
          />
        )}
        <UserList
          {...userListProps}
          users={users}
          scrollingProps={otherScrollingProps}
          scrollingContainer={container.current}
          appendTooltipTo={modalRef}
          placeholderAmount={placeholderAmount}
        />
      </Modal.Body>
    </Modal>
  );
}

export default UserListModal;
