import React, { ReactElement, useState } from 'react';
import HashtagIcon from '../icons/Hashtag';
import FilterIcon from '../icons/Filter';
import BlockIcon from '../icons/Block';
import TagsFilter from './TagsFilter';
import { TagCategoryLayout } from './TagCategoryDropdown';
import AdvancedSettingsFilter from './AdvancedSettings';
import BlockedFilter from './BlockedFilter';
import ArrowIcon from '../icons/Arrow';
import { Button } from '../buttons/Button';
import { UnblockItem, unBlockPromptOptions } from './FilterMenu';
import { Modal, ModalProps } from '../modals/common/Modal';
import { usePrompt } from '../../hooks/usePrompt';
import { UnblockSourceCopy, UnblockTagCopy } from './UnblockCopy';

enum FilterMenuTitle {
  Tags = 'Manage tags',
  Advanced = 'Advanced',
  Blocked = 'Blocked items',
}

type FeedFiltersProps = ModalProps;

export const filterAlertMessage = 'Edit your personal feed preferences here';

export default function FeedFilters(props: FeedFiltersProps): ReactElement {
  const [isNavOpen, setIsNavOpen] = useState(false);
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
      title: FilterMenuTitle.Blocked,
      options: { icon: <BlockIcon /> },
    },
  ];
  return (
    <Modal
      {...props}
      className="overflow-auto flex-1 h-full"
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Large}
      tabs={tabs}
    >
      <Modal.Sidebar>
        <Modal.Sidebar.List
          className="w-74"
          title="Feed filters"
          isNavOpen={isNavOpen}
          setIsNavOpen={setIsNavOpen}
          onViewChange={() => setIsNavOpen(false)}
        />
        <Modal.Sidebar.Inner>
          <Modal.Header>
            <Button
              buttonSize="small"
              className="flex tablet:hidden mr-2 -rotate-90"
              icon={<ArrowIcon />}
              onClick={() => setIsNavOpen(true)}
            />
          </Modal.Header>
          <Modal.Body view={FilterMenuTitle.Tags}>
            <TagsFilter tagCategoryLayout={TagCategoryLayout.Settings} />
          </Modal.Body>
          <Modal.Body view={FilterMenuTitle.Advanced}>
            <AdvancedSettingsFilter />
          </Modal.Body>
          <Modal.Body view={FilterMenuTitle.Blocked}>
            <BlockedFilter onUnblockItem={unBlockPrompt} />
          </Modal.Body>
        </Modal.Sidebar.Inner>
      </Modal.Sidebar>
    </Modal>
  );
}
