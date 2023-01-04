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
import CloseButton from '../CloseButton';
import styles from './FeedFilters.module.css';
import ArrowIcon from '../icons/Arrow';
import { Button } from '../buttons/Button';
import { UnblockItem } from './FilterMenu';
import UnblockModal from '../modals/UnblockModal';
// import { Modal } from '../modals/common/Modal';

enum FilterMenuTitle {
  Tags = 'Manage tags',
  Advanced = 'Advanced',
  Blocked = 'Blocked items',
}

export const filterAlertMessage = 'Edit your personal feed preferences here';

export default function FeedFilters({
  isOpen,
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [display, setDisplay] = useState<string>(FilterMenuTitle.Tags);
  const [unblockItem, setUnblockItem] = useState<UnblockItem>();
  const items = [
    {
      title: FilterMenuTitle.Tags,
      icon: <HashtagIcon />,
      component: <TagsFilter tagCategoryLayout={TagCategoryLayout.Settings} />,
    },
    {
      title: FilterMenuTitle.Advanced,
      icon: <FilterIcon />,
      component: <AdvancedSettingsFilter />,
    },
    {
      title: FilterMenuTitle.Blocked,
      icon: <BlockIcon />,
      component: <BlockedFilter onUnblockItem={setUnblockItem} />,
    },
  ];
  const onNavClick = (active: string) => {
    setDisplay(active);
    if (isNavOpen) {
      setIsNavOpen(false);
    }
  };

  //   const tabs = [
  //     {
  //       title: FilterMenuTitle.Tags,
  //       options: { icon: <HashtagIcon /> },
  //     },
  //     {
  //       title: FilterMenuTitle.Advanced,
  //       options: { icon: <FilterIcon /> },
  //     },
  //     {
  //       title: FilterMenuTitle.Blocked,
  //       options: { icon: <BlockIcon /> },
  //     },
  //   ];
  //   return (
  //     <Modal
  //       className="h-full mb-8 flex-1"
  //       isOpen
  //       kind={Modal.Kind.FlexibleTop}
  //       size={Modal.Size.Large}
  //       onRequestClose={onRequestClose}
  //       tabs={tabs}
  //     >
  //       <Modal.Sidebar>
  //         <Modal.Sidebar.List
  //           className='w-74'
  //           title="Feed filters"
  //           isNavOpen={isNavOpen}
  //           onViewChange={onNavClick}
  //           setIsNavOpen={setIsNavOpen}
  //         />
  //         <Modal.Sidebar.Inner>
  //           <Modal.Header>
  //             <Button
  //               buttonSize="small"
  //               className="flex tablet:hidden mr-2 -rotate-90"
  //               icon={<ArrowIcon />}
  //               onClick={() => setIsNavOpen(true)}
  //             />
  //           </Modal.Header>
  //           <Modal.Body view={FilterMenuTitle.Tags}>
  //             <TagsFilter tagCategoryLayout={TagCategoryLayout.Settings} />
  //           </Modal.Body>
  //           <Modal.Body view={FilterMenuTitle.Advanced}>
  //             <AdvancedSettingsFilter />
  //           </Modal.Body>
  //           <Modal.Body view={FilterMenuTitle.Blocked}>
  //             <BlockedFilter onUnblockItem={setUnblockItem} />
  //           </Modal.Body>
  //         </Modal.Sidebar.Inner>
  //       </Modal.Sidebar>
  //     </Modal>
  //   );

  return (
    <StyledModal
      {...props}
      overlayClassName={classNames('py-12', styles.feedFiltersOverlay)}
      contentClassName={classNames(
        'w-full h-full flex flex-row',
        isNavOpen && 'opened-nav',
        styles.feedFilters,
      )}
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
          <h2 className="flex sticky flex-row items-center py-4 px-6 w-full font-bold border-b border-theme-divider-tertiary typo-title3">
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
          <div className="flex overflow-auto flex-col py-6 h-full max-h-[calc(100vh-4.125rem)] tablet:max-h-[calc(100%-3.875rem)]">
            {items.find(({ title }) => title === display)?.component}
          </div>
        </div>
      </div>
      {unblockItem && (
        <UnblockModal
          item={unblockItem}
          isOpen={!!unblockItem}
          onConfirm={unblockItem.action}
          onRequestClose={() => setUnblockItem(null)}
        />
      )}
    </StyledModal>
  );
}
