import type { KeyboardEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FlexCol } from '../../../components/utilities';
import { SearchField } from '../../../components/fields/SearchField';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import type { SearchSuggestion } from '../../../graphql/search';
import {
  minSearchQueryLength,
  SearchProviderEnum,
} from '../../../graphql/search';
import { useSearchProviderSuggestions } from '../../../hooks/search/useSearchProviderSuggestions';
import { getMessagesUrl } from '../urls';

const resultsLimit = 10;

const UserRow = ({
  user,
  onSelect,
}: {
  user: SearchSuggestion;
  onSelect: () => void;
}): ReactElement => (
  <button
    type="button"
    className="flex w-full items-center gap-3 rounded-12 px-3 py-2.5 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
    onClick={onSelect}
  >
    <ProfilePicture
      user={{
        id: user.id,
        image: user.image ?? '',
        name: user.title,
        username: user.subtitle,
      }}
      size={ProfileImageSize.Large}
      nativeLazyLoading
    />
    <FlexCol className="min-w-0 flex-1">
      <Typography type={TypographyType.Callout} bold truncate>
        {user.title}
      </Typography>
      {user.subtitle && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          truncate
        >
          @{user.subtitle}
        </Typography>
      )}
    </FlexCol>
  </button>
);

// Picking someone just opens the thread: whether they can be messaged (blocks,
// DMs off) is decided there and by daily-api on the first send.
export const NewMessageSearch = ({
  onClose,
}: {
  onClose: () => void;
}): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [query, setQuery] = useState('');
  const isQueryable = query.trim().length >= minSearchQueryLength;
  const { suggestions, isLoading } = useSearchProviderSuggestions({
    provider: SearchProviderEnum.Users,
    query: query.trim(),
    limit: resultsLimit,
    scope: 'messages',
    enabled: isQueryable,
  });
  const users = (suggestions?.hits ?? []).filter(
    (hit) => !!hit.id && hit.id !== user?.id,
  );

  const openChat = (peerId: string) => {
    router.push(getMessagesUrl(peerId));
    onClose();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onClose();
    }

    if (event.key === 'Enter' && users[0]?.id) {
      event.preventDefault();
      openChat(users[0].id);
    }
  };

  const renderResults = () => {
    if (!isQueryable) {
      return (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="px-3 py-4"
        >
          Search by name or username.
        </Typography>
      );
    }

    if (isLoading && !users.length) {
      return (
        <FlexCol className="gap-2 px-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-12 bg-surface-float"
            />
          ))}
        </FlexCol>
      );
    }

    if (!users.length) {
      return (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="px-3 py-4"
        >
          No developers found for “{query.trim()}”.
        </Typography>
      );
    }

    return (
      <nav aria-label="People" className="flex flex-col gap-0.5">
        {users.map((hit) => (
          <UserRow
            key={hit.id}
            user={hit}
            onSelect={() => openChat(hit.id as string)}
          />
        ))}
      </nav>
    );
  };

  return (
    <FlexCol className="min-h-0 flex-1 gap-2">
      <div className="flex items-center gap-2 px-4">
        <SearchField
          inputId="new-message-search"
          aria-label="Search for someone to message"
          placeholder="Search developers"
          fieldSize="medium"
          className="flex-1"
          autoFocus
          autoComplete="off"
          value={query}
          valueChanged={setQuery}
          onKeyDown={onKeyDown}
        />
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {renderResults()}
      </div>
    </FlexCol>
  );
};
