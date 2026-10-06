import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Squad } from '../../../graphql/sources';
import { SourceMemberRole, SourcePermissions } from '../../../graphql/sources';
import { verifyPermission } from '../../../graphql/squads';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isSystemModerator } from '../../../lib/user';
import { Origin } from '../../../lib/log';
import { defaultSearchDebounceMs } from '../../../lib/func';
import { largeNumberFormat } from '../../../lib/numberFormat';
import { useSquadActions } from '../../../hooks/squads/useSquadActions';
import { useSquadInvitation } from '../../../hooks/useSquadInvitation';
import useDebounceFn from '../../../hooks/useDebounceFn';
import { useUsersContentPreferenceMutationSubscription } from '../../../hooks/contentPreference/useUsersContentPreferenceMutationSubscription';
import UserList from '../../../components/profile/UserList';
import { checkFetchMore } from '../../../components/containers/InfiniteScrolling';
import { SearchField } from '../../../components/fields/SearchField';
import { ButtonSize } from '../../../components/buttons/Button';
import { AddUserIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../../../components/squads/layout/SquadDirectoryNavbar';
import { BlockedMembersPlaceholder } from '../../../components/squads/Members/BlockedMembersPlaceholder';
import SquadMemberItemOptionsButton from '../../../components/squads/SquadMemberItemOptionsButton';
import { getSquadId } from '../lib/features';
import { useIsPhone } from '../../../hooks/useViewSize';
import { ShellDockedRow } from '../../../components/shell/ShellPageContext';
import { Segments, ShellRow } from '../../../components/shell/ShellRow';
import { ShellField } from '../../../components/shell/ShellField';

enum MembersTab {
  Members = 'Members',
  Moderators = 'Moderators',
  Blocked = 'Blocked',
}

const tabRole: Record<MembersTab, SourceMemberRole | undefined> = {
  [MembersTab.Members]: undefined,
  [MembersTab.Moderators]: SourceMemberRole.Moderator,
  [MembersTab.Blocked]: SourceMemberRole.Blocked,
};

const InviteRow = ({ squad }: { squad: Squad }): ReactElement | null => {
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
      onClick={() => logAndCopyLink()}
      className="flex w-full items-center gap-3 px-6 py-3 text-left text-text-primary typo-callout hover:bg-surface-hover"
    >
      <span className="flex size-10 items-center justify-center rounded-12 bg-surface-float text-text-secondary">
        <AddUserIcon size={IconSize.Medium} />
      </span>
      Copy invitation link
    </button>
  );
};

interface SquadMembersListProps {
  squad: Squad;
}

// The members modal as a page: three tabs (Blocked for those who may see
// it), search, the invitation link first, and the role menu for staff.
export const SquadMembersList = ({
  squad,
}: SquadMembersListProps): ReactElement => {
  const { user: loggedUser } = useAuthContext();
  const [tab, setTab] = useState(MembersTab.Members);
  const [query, setQuery] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const isPhone = useIsPhone();
  const [onSearch] = useDebounceFn<string>(
    (value) => setQuery(value ?? ''),
    defaultSearchDebounceMs,
  );
  const role = tabRole[tab];
  const {
    members = [],
    membersQueryResult,
    membersQueryKey,
    onUnblock,
    onDemoteSelf,
    onUpdateRole,
  } = useSquadActions({
    squad,
    query: query.trim() || undefined,
    membersQueryParams: { role },
    membersQueryEnabled: true,
  });

  useUsersContentPreferenceMutationSubscription({
    queryKey: membersQueryKey,
    queryProp: 'sourceMembers',
  });

  const canSeeBlocked =
    isSystemModerator(loggedUser) ||
    verifyPermission(squad, SourcePermissions.ViewBlockedMembers);
  const tabs = Object.values(MembersTab).filter(
    (item) => canSeeBlocked || item !== MembersTab.Blocked,
  );
  const segments = tabs.map((item) => ({
    key: item,
    label: item,
    active: tab === item,
    onClick: () => setTab(item),
  }));

  return (
    <div className="flex flex-col gap-4 py-4">
      {isPhone && (
        <>
          <ShellDockedRow>
            <ShellRow>
              <Segments items={segments} />
            </ShellRow>
          </ShellDockedRow>
          <ShellField
            placeholder={`Search ${tab.toLowerCase()}`}
            value={fieldValue}
            onChange={(value) => {
              setFieldValue(value);
              onSearch(value);
            }}
          />
        </>
      )}
      <div className="flex flex-col gap-4 px-4 tablet:px-6">
        <div className="hidden tablet:block">
          <SquadDirectoryNavbar
            aria-label="Members filters"
            className="!mx-0 !border-0 !px-0"
          >
            {tabs.map((item) => (
              <SquadDirectoryNavbarItem
                key={item}
                buttonSize={ButtonSize.Small}
                isActive={tab === item}
                label={item}
                ariaLabel={item}
                onClick={() => setTab(item)}
              />
            ))}
          </SquadDirectoryNavbar>
        </div>
        <SearchField
          className="hidden tablet:flex"
          inputId="squad-members-search"
          placeholder={`Search ${tab.toLowerCase()}`}
          aria-label={`Search ${tab.toLowerCase()}`}
          valueChanged={onSearch}
        />
        {tab === MembersTab.Members && (
          <span className="text-text-tertiary typo-footnote">
            <strong className="tabular-nums text-text-primary">
              {largeNumberFormat(squad.membersCount) ?? 0}
            </strong>{' '}
            members
          </span>
        )}
      </div>
      <UserList
        users={members.map(({ user, role: memberRole }) => ({
          ...user,
          role: memberRole,
        }))}
        placeholderAmount={Math.min(squad.membersCount, 5)}
        isLoading={membersQueryResult?.isPending}
        scrollingProps={{
          isFetchingNextPage: !!membersQueryResult?.isFetchingNextPage,
          canFetchMore:
            !!membersQueryResult && checkFetchMore(membersQueryResult),
          fetchNextPage: () =>
            membersQueryResult?.fetchNextPage() ?? Promise.resolve(),
        }}
        initialItem={
          tab !== MembersTab.Blocked && !query ? (
            <InviteRow squad={squad} />
          ) : undefined
        }
        emptyPlaceholder={
          tab === MembersTab.Blocked ? (
            <BlockedMembersPlaceholder />
          ) : (
            <p className="p-10 text-center text-text-tertiary typo-callout">
              No {tab === MembersTab.Moderators ? 'moderator' : 'member'} found
            </p>
          )
        }
        afterContent={
          canSeeBlocked
            ? (user, index) => (
                <SquadMemberItemOptionsButton
                  key={`squad_option_${user.id}`}
                  squad={squad}
                  member={members[index]}
                  onUpdateRole={onUpdateRole}
                  onDemoteSelf={onDemoteSelf}
                  onUnblock={() =>
                    onUnblock?.({
                      sourceId: getSquadId(squad),
                      memberId: user.id,
                    })
                  }
                />
              )
            : undefined
        }
        userInfoProps={{
          origin: Origin.SquadMembersList,
          showFollow: !canSeeBlocked,
          showSubscribe: false,
        }}
      />
    </div>
  );
};
