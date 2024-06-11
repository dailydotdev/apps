import React, { ReactElement, useState } from 'react';
import { Modal, ModalProps } from './common/Modal';
import {
  SourceMember,
  SourceMemberRole,
  SourcePermissions,
  Squad,
} from '../../graphql/sources';
import UserListModal from './UserListModal';
import { checkFetchMore } from '../containers/InfiniteScrolling';
import useContextMenu from '../../hooks/useContextMenu';
import SquadMemberMenu from '../squads/SquadMemberMenu';
import { Origin } from '../../lib/log';
import { IconSize } from '../Icon';
import { LinkIcon } from '../icons';
import { useSquadInvitation } from '../../hooks/useSquadInvitation';
import { FlexCentered } from '../utilities';
import { useSquadActions } from '../../hooks';
import SquadMemberItemAdditionalContent from '../squads/SquadMemberItemAdditionalContent';
import { verifyPermission } from '../../graphql/squads';
import useDebounce from '../../hooks/useDebounce';
import { defaultSearchDebounceMs } from '../../lib/func';
import { BlockedMembersPlaceholder } from '../squads/Members';
import { ContextMenu } from '../../hooks/constants';

enum SquadMemberTab {
  AllMembers = 'Squad members',
  BlockedMembers = 'Blocked members',
}

export interface SquadMemberModalProps extends ModalProps {
  placeholderAmount?: number;
  squad: Squad;
}

const InitialItem = ({ squad }: { squad: Squad }) => {
  const { copying, logAndCopyLink } = useSquadInvitation({
    squad,
    origin: Origin.SquadMembersList,
  });

  if (!verifyPermission(squad, SourcePermissions.Invite)) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={copying}
      className="flex items-center justify-start px-6 py-3 hover:bg-surface-hover"
      onClick={() => {
        logAndCopyLink();
      }}
    >
      <FlexCentered className="mr-4 h-12 w-12 rounded-10 bg-surface-float">
        <LinkIcon size={IconSize.Large} className="text-raw-salt-90" />
      </FlexCentered>
      <p className="text-raw-salt-90 typo-callout">Copy invitation link</p>
    </button>
  );
};

export function SquadMemberModal({
  squad,
  ...props
}: SquadMemberModalProps): ReactElement {
  const [roleFilter, setRoleFilter] = useState<SourceMemberRole>(null);
  const [member, setMember] = useState<SourceMember>(null);
  const {
    onMenuClick,
    onHide: hideMenu,
    isOpen,
  } = useContextMenu({
    id: ContextMenu.SquadMemberContext,
  });
  const [query, setQuery] = useState('');
  const [handleSearchDebounce] = useDebounce(
    (value: string) => setQuery(value),
    defaultSearchDebounceMs,
  );
  const {
    members,
    membersQueryResult: queryResult,
    onUnblock,
    onUpdateRole,
  } = useSquadActions({
    squad,
    query: query?.trim?.()?.length ? query : undefined,
    membersQueryParams: { role: roleFilter },
    membersQueryEnabled: true,
  });

  const onOptionsClick = (e: React.MouseEvent, clickedMember: SourceMember) => {
    setMember(clickedMember);
    onMenuClick(e);
  };

  return (
    <>
      <UserListModal
        {...props}
        kind={Modal.Kind.FixedCenter}
        title="Squad members"
        tabs={Object.values(SquadMemberTab)}
        header={
          verifyPermission(squad, SourcePermissions.ViewBlockedMembers) ? (
            <Modal.Header.Tabs
              onTabClick={(tab) =>
                setRoleFilter(
                  tab === SquadMemberTab.BlockedMembers
                    ? SourceMemberRole.Blocked
                    : null,
                )
              }
            />
          ) : null
        }
        scrollingProps={{
          isFetchingNextPage: queryResult.isFetchingNextPage,
          canFetchMore: checkFetchMore(queryResult),
          fetchNextPage: queryResult.fetchNextPage,
          onScroll: hideMenu,
        }}
        userListProps={{
          additionalContent: (user, index) => (
            <SquadMemberItemAdditionalContent
              member={members[index]}
              onUnblock={() =>
                onUnblock({ sourceId: squad.id, memberId: user.id })
              }
              onOptionsClick={(e) => {
                e.preventDefault();
                onOptionsClick(e, members[index]);
              }}
            />
          ),
          emptyPlaceholder: query ? (
            <FlexCentered className="p-10 text-text-tertiary typo-callout">
              No user found
            </FlexCentered>
          ) : (
            <BlockedMembersPlaceholder />
          ),
          isLoading: queryResult.isLoading,
          initialItem:
            roleFilter === SourceMemberRole.Blocked ||
            query?.length ? undefined : (
              <InitialItem squad={squad} />
            ),
        }}
        users={members?.map(({ user }) => user)}
        onSearch={handleSearchDebounce}
      />
      <SquadMemberMenu
        squad={squad}
        member={member}
        onUpdateRole={onUpdateRole}
        isOpen={isOpen}
      />
    </>
  );
}

export default SquadMemberModal;
