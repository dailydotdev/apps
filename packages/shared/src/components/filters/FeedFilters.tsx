import React, { ReactElement } from 'react';
import { HashtagIcon, FilterIcon, BlockIcon, AppIcon } from '../icons';
import TagsFilter from './TagsFilter';
import { TagCategoryLayout } from './TagCategoryDropdown';
import AdvancedSettingsFilter from './AdvancedSettings';
import BlockedFilter from './BlockedFilter';
import { Modal, ModalProps } from '../modals/common/Modal';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { UnblockSourceCopy, UnblockTagCopy } from './UnblockCopy';
import { ContentTypesFilter } from './ContentTypesFilter';
import { Source } from '../../graphql/sources';

enum FilterMenuTitle {
  Tags = 'Manage tags',
  Advanced = 'Advanced',
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
  const tabs = [
    {
      title: FilterMenuTitle.Tags,
      options: { icon: <HashtagIcon /> },
    },
    {
      title: FilterMenuTitle.Advanced,
      options: { icon: <FilterIcon /> },
    },
    {
      title: FilterMenuTitle.ContentTypes,
      options: { icon: <AppIcon /> },
    },
    {
      title: FilterMenuTitle.Blocked,
      options: { icon: <BlockIcon /> },
    },
  ];

  return (
    <Modal
      {...props}
      className="h-full flex-1 overflow-auto"
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.XLarge}
      tabs={tabs}
    >
      <Modal.Sidebar>
        <Modal.Sidebar.List className="w-74" title="Feed filters" defaultOpen />
        <Modal.Sidebar.Inner>
          <Modal.Header />
          <Modal.Body view={FilterMenuTitle.Tags}>
            <TagsFilter tagCategoryLayout={TagCategoryLayout.Settings} />
          </Modal.Body>
          <Modal.Body view={FilterMenuTitle.Advanced}>
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
