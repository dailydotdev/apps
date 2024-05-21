import React, { MouseEvent, ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { FilterIcon, BlockIcon, AppIcon, HomeIcon, StarIcon } from '../icons';
import TagsFilter from './TagsFilter';
import { TagCategoryLayout } from './TagCategoryDropdown';
import AdvancedSettingsFilter from './AdvancedSettings';
import BlockedFilter from './BlockedFilter';
import { Modal, ModalProps } from '../modals/common/Modal';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { UnblockSourceCopy, UnblockTagCopy } from './UnblockCopy';
import { ContentTypesFilter } from './ContentTypesFilter';
import { Source } from '../../graphql/sources';
import { FeedList, FEED_LIST_QUERY } from '../../graphql/feed';
import { graphqlUrl } from '../../lib/config';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { webappUrl } from '../../lib/constants';
import { ViewSize, useViewSize } from '../../hooks';

enum FilterMenuTitle {
  Tags = 'My feed',
  ManageCategories = 'Manage categories',
  ContentTypes = 'Content types',
  Blocked = 'Blocked items',
}

type FeedFiltersProps = ModalProps;

export interface UnblockItem {
  tag?: string;
  source?: Source;
  action?: () => unknown;
}
const unBlockPromptOptions: PromptOptions = {
  title: 'Are you sure?',
  okButton: {
    title: 'Yes, unblock',
  },
};

export default function FeedFilters(props: FeedFiltersProps): ReactElement {
  const { user } = useAuthContext();
  const { showPrompt } = usePrompt();
  const unBlockPrompt = async ({ action, source, tag }: UnblockItem) => {
    const description = tag ? (
      <UnblockTagCopy name={tag} />
    ) : (
      <UnblockSourceCopy name={source.name} />
    );
    if (await showPrompt({ ...unBlockPromptOptions, description })) {
      action?.();
    }
  };
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data: userFeeds } = useQuery(
    generateQueryKey(RequestKey.Feeds, user),
    async () => {
      const result = await request<FeedList>(graphqlUrl, FEED_LIST_QUERY);

      return result.feedList;
    },
    {
      enabled: !!user && isMobile,
      staleTime: StaleTime.OneHour,
    },
  );

  const tabs = [
    {
      title: FilterMenuTitle.Tags,
      options: { icon: <HomeIcon />, group: 'Feeds' },
    },
    ...(isMobile
      ? userFeeds?.edges?.map(({ node: feed }) => {
          return {
            title: feed.flags?.name || `Feed ${feed.id}`,
            options: {
              icon: <StarIcon />,
              href: `${webappUrl}feeds/${feed.id}/edit`,
              onClick: (event: MouseEvent<Element>) => {
                const { onRequestClose } = props;

                if (onRequestClose) {
                  onRequestClose(event);
                }
              },
              group: 'Feeds',
            },
          };
        })
      : []),
    {
      title: FilterMenuTitle.ManageCategories,
      options: { icon: <FilterIcon />, group: 'Preference' },
    },
    {
      title: FilterMenuTitle.ContentTypes,
      options: { icon: <AppIcon />, group: 'Preference' },
    },
    {
      title: FilterMenuTitle.Blocked,
      options: { icon: <BlockIcon />, group: 'Preference' },
    },
  ].map((item) =>
    isMobile
      ? item
      : {
          ...item,
          options: {
            ...item.options,
            group: undefined,
          },
        },
  );

  return (
    <Modal
      {...props}
      className="h-full flex-1 overflow-auto"
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.XLarge}
      tabs={tabs}
    >
      <Modal.Sidebar>
        <Modal.Sidebar.List
          className="w-74"
          title="Feed settings"
          defaultOpen
        />
        <Modal.Sidebar.Inner>
          <Modal.Header />
          <Modal.Body view={FilterMenuTitle.Tags}>
            <TagsFilter tagCategoryLayout={TagCategoryLayout.Settings} />
          </Modal.Body>
          <Modal.Body view={FilterMenuTitle.ManageCategories}>
            <AdvancedSettingsFilter />
          </Modal.Body>
          <Modal.Body view={FilterMenuTitle.ContentTypes}>
            <ContentTypesFilter />
          </Modal.Body>
          <Modal.Body view={FilterMenuTitle.Blocked}>
            <BlockedFilter onUnblockItem={unBlockPrompt} />
          </Modal.Body>
        </Modal.Sidebar.Inner>
      </Modal.Sidebar>
    </Modal>
  );
}
