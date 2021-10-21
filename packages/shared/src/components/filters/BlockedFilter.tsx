import React, { HTMLAttributes, ReactElement, useContext } from 'react';
import { Source } from '../../graphql/sources';
import { FilterItem, FiltersList } from './common';
import Link from 'next/link';
import { getTooltipProps } from '../../lib/tooltip';
import { LazyImage } from '../LazyImage';
import { Button } from '../buttons/Button';
import BlockIcon from '../../../icons/block.svg';
import XIcon from '../../../icons/x.svg';
import MenuIcon from '../../../icons/menu.svg';
import { getSourcesFiltersQueryKey } from '../../hooks/useMutateFilters';
import AuthContext from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import { apiUrl } from '../../lib/config';
import {
  ALL_BLOCKED_TAGS_AND_SOURCES,
  ALL_SOURCES_AND_SETTINGS_QUERY,
  FeedSettingsData,
} from '../../graphql/feedSettings';
import request from 'graphql-request';

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
  <FilterItem className="relative py-1">
    <Link
      href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}sources/${source.id}`}
      passHref
      prefetch={false}
    >
      <a
        className="flex flex-1 items-center pr-14 pl-6 h-10 hover:bg-theme-hover active:bg-theme-active rounded-md focus-outline"
        {...getTooltipProps(`${source.name} feed`)}
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
    </Link>
    <Button
      className="right-4 my-auto btn-tertiary"
      style={{ position: 'absolute' }}
      onClick={() => onClick?.(source)}
      icon={<BlockIcon />}
      {...getTooltipProps(blocked ? 'Unblock source' : 'Block source', {
        position: 'left',
      })}
    />
  </FilterItem>
);

const Tag = ({
  tooltip,
  tag,
  selected,
  menu,
  onClick,
  ...props
}: {
  tooltip: string;
  tag: string;
  selected?: boolean;
  menu?: boolean;
  onClick?: (event: React.MouseEvent, tag: string) => unknown;
} & Omit<HTMLAttributes<HTMLAnchorElement>, 'onClick'>): ReactElement => (
  <FilterItem className="relative my-2">
    <Link
      href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}tags/${tag}`}
      passHref
      prefetch={false}
    >
      <Button
        tag="a"
        buttonSize="small"
        pressed={selected}
        className="btn-tertiaryFloat"
        {...getTooltipProps(`${tag} feed`)}
        {...props}
      >
        #{tag}
      </Button>
    </Link>
    <Button
      className="right-4 my-auto btn-tertiary"
      style={{ position: 'absolute' }}
      onClick={(event) => onClick?.(event, tag)}
      icon={<MenuIcon />}
      {...getTooltipProps(tooltip, {
        position: 'left',
      })}
    />
  </FilterItem>
);

export default function BlockedFilter(): ReactElement {
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);

  const filtersKey = getSourcesFiltersQueryKey(user);
  const { data: blockedTagsAndSources, isLoading: isLoadingQuery } = useQuery(
    filtersKey,
    () => request(`${apiUrl}/graphql`, ALL_BLOCKED_TAGS_AND_SOURCES),
    {
      enabled: tokenRefreshed,
    },
  );

  return (
    <div aria-busy="true">
      <div className="px-6 pb-6">
        <p className="typo-callout text-theme-label-tertiary">
          Articles containing the following tags or sources will never be shown
          on your feed, even if the article contains a specifc tag that you do
          follow.
        </p>

        <h3 className="my-6 typo-headline">Blocked tags</h3>

        <FiltersList className="-mr-6">
          {blockedTagsAndSources?.feedSettings?.blockedTags.map((tag) => (
            <Tag tag={tag} tooltip="Unblock tag" />
          ))}
        </FiltersList>

        <h3 className="mt-10 mb-3 typo-headline">Blocked sources</h3>

        <p className="mb-6 typo-callout text-theme-label-tertiary">
          Blocking sources can be done from the feed. Next time you’ve seen a
          post from a source you wish to block, click on the ⋮ button and choose
          “Don’t show articles from…”
        </p>

        <FiltersList className="-mr-6 -ml-6">
          {blockedTagsAndSources?.feedSettings?.excludeSources.map((source) => (
            <SourceItem source={source} blocked />
          ))}
        </FiltersList>
      </div>
    </div>
  );
}
