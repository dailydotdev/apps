import React, {
  HTMLAttributes,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import dynamic from 'next/dynamic';
import {
  FilterItem,
  FilterProps,
  FiltersContainer,
  FiltersDetails,
  FiltersHeadline,
  FiltersList,
  FiltersPlaceholder,
  FiltersSummaryArrow,
} from './common';
import AuthContext from '../../contexts/AuthContext';
import useMutateFilters, {
  getSourcesFiltersQueryKey,
  getSourcesSettingsQueryKey,
} from '../../hooks/useMutateFilters';
import {
  ALL_SOURCES_AND_SETTINGS_QUERY,
  ALL_SOURCES_QUERY,
  FeedSettingsData,
  SourcesData,
} from '../../graphql/feedSettings';
import { apiUrl } from '../../lib/config';
import { Source } from '../../graphql/sources';
import { LazyImage } from '../LazyImage';
import { trackEvent } from '../../lib/analytics';
import { ForwardedButton as Button } from '../buttons/Button';
import PlusIcon from '../../../icons/plus.svg';
import { LoginModalMode } from '../../types/LoginModalMode';
import { Summary } from '../utilities';
import BlockIcon from '../../../icons/block.svg';
import XIcon from '../../../icons/x.svg';

const LazyTooltip = dynamic(() => import('../tooltips/LazyTooltip'));

const NewSourceModal = dynamic(() => import('../modals/NewSourceModal'));

const SourceItem = ({
  source,
  selected,
  onClick,
  blocked,
  ...props
}: {
  source: Source;
  selected?: boolean;
  onClick?: (source: Source) => unknown;
  blocked?: boolean;
} & Omit<HTMLAttributes<HTMLAnchorElement>, 'onClick'>): ReactElement => (
  <FilterItem className="relative my-1">
    <Link
      href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/${source.id}`}
      passHref
      prefetch={false}
    >
      <LazyTooltip content={`${source.name} feed`}>
        <a
          className="flex flex-1 h-10 pl-6 pr-14 items-center rounded-md hover:bg-theme-hover active:bg-theme-active focus-outline"
          {...props}
        >
          <LazyImage
            imgSrc={source.image}
            imgAlt={`${source.name} logo`}
            className="w-8 h-8 rounded-md"
          />
          <span
            className={`flex-1 ml-3 text-left typo-callout truncate ${
              selected
                ? 'font-bold text-theme-label-primary'
                : 'text-theme-label-tertiary'
            }`}
          >
            {source.name}
          </span>
        </a>
      </LazyTooltip>
    </Link>
    <LazyTooltip
      content={blocked ? 'Unblock source' : 'Block source'}
      placement="left"
    >
      <Button
        className="btn-tertiary right-4 my-auto"
        style={{ position: 'absolute' }}
        onClick={() => onClick?.(source)}
        icon={blocked ? <XIcon /> : <BlockIcon />}
      />
    </LazyTooltip>
  </FilterItem>
);

export default function SourcesFilter({
  enableQueries = true,
  query,
}: FilterProps): ReactElement {
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const [followedSources, setFollowedSources] = useState<Source[]>([]);
  const [moreSources, setMoreSources] = useState<Source[]>([]);
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const queryClient = useQueryClient();

  const { followSource, unfollowSource } = useMutateFilters(user);

  const onSuggestSource = (): void => {
    if (!user) {
      showLogin('add source', LoginModalMode.ContentQuality);
      return;
    }

    setShowNewSourceModal(true);
  };

  const onFollowSource = async (source: Source): Promise<void> => {
    if (!user) {
      showLogin('filter');
      return;
    }

    trackEvent({
      category: 'Publications',
      action: 'Toggle',
      label: 'Check',
    });
    await followSource({ source });
  };

  const onUnfollowSource = async (source: Source): Promise<void> => {
    if (!user) {
      showLogin('filter');
      return;
    }

    trackEvent({
      category: 'Publications',
      action: 'Toggle',
      label: 'Uncheck',
    });
    await unfollowSource({ source });
  };

  const filtersKey = getSourcesFiltersQueryKey(user);
  const { data: settingsAndSources, isLoading: isLoadingQuery } = useQuery<
    FeedSettingsData & SourcesData
  >(
    filtersKey,
    () =>
      request(
        `${apiUrl}/graphql`,
        user ? ALL_SOURCES_AND_SETTINGS_QUERY : ALL_SOURCES_QUERY,
      ),
    {
      enabled: tokenRefreshed && enableQueries,
    },
  );

  const isLoading =
    isLoadingQuery || !(followedSources?.length || moreSources?.length);

  useEffect(() => {
    if (user && settingsAndSources) {
      queryClient.setQueryData(getSourcesSettingsQueryKey(user), {
        feedSettings: settingsAndSources.feedSettings,
      });
    }
  }, [settingsAndSources, user]);

  useEffect(() => {
    if (settingsAndSources) {
      const accumulatedFollowedSources = [];
      const accumulatedMoreSources = [];
      const loweredCaseQuery = query?.toLowerCase();
      settingsAndSources.sources.edges.forEach(({ node }) => {
        if (loweredCaseQuery?.length) {
          if (!node.name.toLowerCase().includes(loweredCaseQuery)) {
            return;
          }
        }
        const followed =
          (settingsAndSources?.feedSettings?.excludeSources ?? []).findIndex(
            (exSource) => exSource.id === node.id,
          ) < 0;
        if (followed) {
          accumulatedFollowedSources.push(node);
        } else {
          accumulatedMoreSources.push(node);
        }
      });
      setFollowedSources(accumulatedFollowedSources);
      setMoreSources(accumulatedMoreSources);
    }
  }, [settingsAndSources, query]);

  return (
    <FiltersContainer aria-busy={isLoading}>
      {isLoading ? (
        <FiltersPlaceholder />
      ) : (
        <>
          <Button
            className="btn-secondary mt-6 mr-4 ml-6 self-start"
            icon={<PlusIcon />}
            onClick={onSuggestSource}
            buttonSize="small"
          >
            Suggest new source
          </Button>
          <FiltersDetails open className="mt-5">
            <Summary>
              <FiltersHeadline>
                All sources ({followedSources.length})
                <FiltersSummaryArrow />
              </FiltersHeadline>
            </Summary>
            <FiltersList className="-my-1 -ml-6 -mr-4">
              {followedSources.map((source) => (
                <SourceItem
                  source={source}
                  selected
                  key={source.id}
                  onClick={() => onUnfollowSource(source)}
                />
              ))}
            </FiltersList>
          </FiltersDetails>
          {moreSources.length > 0 && (
            <FiltersDetails open>
              <Summary>
                <FiltersHeadline>
                  Blocked sources ({moreSources.length})
                  <FiltersSummaryArrow />
                </FiltersHeadline>
              </Summary>
              <FiltersList className="-my-1 -ml-6 -mr-4">
                {moreSources.map((source) => (
                  <SourceItem
                    source={source}
                    blocked
                    key={source.id}
                    onClick={() => onFollowSource(source)}
                  />
                ))}
              </FiltersList>
            </FiltersDetails>
          )}
        </>
      )}
      {showNewSourceModal && (
        <NewSourceModal
          isOpen={showNewSourceModal}
          onRequestClose={() => setShowNewSourceModal(false)}
        />
      )}
    </FiltersContainer>
  );
}
