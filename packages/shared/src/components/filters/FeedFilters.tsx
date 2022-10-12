import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ModalProps, StyledModal } from '../modals/StyledModal';
import SidebarList from '../sidebar/SidebarList';
import HashtagIcon from '../icons/Hashtag';
import FilterIcon from '../icons/Filter';
import BlockIcon from '../icons/Block';
import TagsFilter from './TagsFilter';
import { TagCategoryLayout } from './TagCategoryDropdown';
import AdvancedSettingsFilter from './AdvancedSettings';
import BlockedFilter from './BlockedFilter';
import CloseButton from '../modals/CloseButton';
import styles from './FeedFilters.module.css';
import ArrowIcon from '../icons/Arrow';
import { Button } from '../buttons/Button';

const items = [
  {
    title: 'Manage tags',
    icon: <HashtagIcon />,
    component: <TagsFilter tagCategoryLayout={TagCategoryLayout.Settings} />,
  },
  {
    title: 'Advanced',
    icon: <FilterIcon />,
    component: <AdvancedSettingsFilter />,
  },
  { title: 'Blocked items', icon: <BlockIcon />, component: <BlockedFilter /> },
];

const HEADER_HEIGHT = 64;

export default function FeedFilters({
  isOpen,
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const [contentRef, setContentRef] = useState<HTMLDivElement>();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [display, setDisplay] = useState<string>(items[0].title);

  const onNavClick = (active: string) => {
    setDisplay(active);
    if (isNavOpen) {
      setIsNavOpen(false);
    }
  };

  const getHeight = () => {
    if (!contentRef) {
      return '100%';
    }

    const { height } = contentRef.getBoundingClientRect();
    const result = height - HEADER_HEIGHT;

    return result;
  };

  return (
    <StyledModal
      {...props}
      overlayClassName={classNames('py-12', styles.feedFiltersOverlay)}
      contentClassName={classNames(
        'w-full h-full flex flex-row',
        isNavOpen && 'opened-nav',
        styles.feedFilters,
      )}
      contentRef={setContentRef}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <div className="flex overflow-hidden relative flex-col tablet:flex-row flex-1 bg-theme-bg-inherit">
        <SidebarList
          className="z-1"
          active={display}
          title="Feed filters"
          onItemClick={onNavClick}
          items={items}
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
        />
        <div className="flex flex-col flex-1 border-l border-theme-divider-tertiary">
          <h2 className="flex relative flex-row items-center py-4 px-6 w-full font-bold border-b border-theme-divider-tertiary typo-title3">
            <Button
              buttonSize="small"
              className="flex tablet:hidden mr-2 -rotate-90"
              icon={<ArrowIcon />}
              onClick={() => setIsNavOpen(true)}
            />
            {display}
            <CloseButton
              style={{ position: 'absolute' }}
              className="right-2"
              buttonSize="medium"
              onClick={onRequestClose}
            />
          </h2>
          <div
            className="flex overflow-auto flex-col pt-6 h-full"
            style={{ height: getHeight() }}
          >
            {items.find(({ title }) => title === display)?.component}
          </div>
        </div>
      </div>
    </StyledModal>
  );
}
