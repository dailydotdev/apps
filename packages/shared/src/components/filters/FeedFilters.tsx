import React, { MouseEvent, ReactElement } from 'react';
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
import { webappUrl } from '../../lib/constants';
import { ViewSize, useFeeds, useViewSize } from '../../hooks';
import { feature } from '../../lib/featureManagement';
import { CustomFeedsExperiment } from '../../lib/featureValues';
import { useFeature } from '../GrowthBookProvider';

enum FilterMenuTitle {
  MyFeed = 'My feed',
  Tags = 'Manage tags',
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
  const customFeedsVersion = useFeature(feature.customFeeds);
  const hasCustomFeedsEnabled =
    customFeedsVersion !== CustomFeedsExperiment.Control;

  const { feeds } = useFeeds();

  const filtersTab = hasCustomFeedsEnabled
    ? FilterMenuTitle.MyFeed
    : FilterMenuTitle.Tags;

  const tabs = [
    {
      title: filtersTab,
      options: { icon: <HomeIcon />, group: 'Feeds' },
    },
    ...(isMobile && hasCustomFeedsEnabled
      ? feeds?.edges?.map(({ node: feed }) => {
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
    isMobile && hasCustomFeedsEnabled
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
          <Modal.Body view={filtersTab}>
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
