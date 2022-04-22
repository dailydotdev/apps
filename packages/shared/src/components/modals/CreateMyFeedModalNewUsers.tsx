import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './CreateMyFeedNewUsers.module.css';
import UserIcon from '../../../icons/user.svg';
import { Button } from '../buttons/Button';
import CreateMyFeedModalIntroTags from './CreateMyFeedModalNewUsersTags';
import { CreateMyFeedModalIntroTagsContainer } from '../utilities';
import CreateMyFeedModal from './FeedFiltersModal';

type TypeProps = {
  feedFilterOnboardingModalType: string;
  actionToOpenFeedFilters: () => unknown;
  feedFilterModalType: string;
  setIsFeedFilterModalOpen: (isModalOpen: boolean) => unknown;
};

type CreateMyFeedModalProps = TypeProps & ModalProps;

type LayoutModalProps = TypeProps & Pick<ModalProps, 'onRequestClose'>;

const footerClass = {
  test1: 'justify-center',
  test2: 'justify-between',
};

const ModalFooter = ({
  feedFilterOnboardingModalType,
  onRequestClose,
  actionToOpenFeedFilters,
  feedFilterModalType,
  setIsFeedFilterModalOpen,
}: LayoutModalProps) => {
  const onCreateMyFeedButtonClick = (
    event: React.MouseEvent<Element, MouseEvent>,
  ): void => {
    if (feedFilterModalType === 'v1') {
      actionToOpenFeedFilters();
      onRequestClose(event);
    } else setIsFeedFilterModalOpen(true);
  };
  return (
    <footer
      className={classNames(
        footerClass[feedFilterOnboardingModalType],
        'flex fixed responsiveModalBreakpoint:sticky bottom-0 py-3 border-t border-theme-divider-tertiary bg-theme-bg-tertiary',
      )}
    >
      {feedFilterOnboardingModalType === 'test2' && (
        <Button
          className="ml-4 w-20 text-theme-label-tertiary btn-default"
          onClick={onRequestClose}
        >
          Skip
        </Button>
      )}

      <Button
        className="mr-4 w-40 btn-primary-cabbage"
        onClick={onCreateMyFeedButtonClick}
      >
        {feedFilterOnboardingModalType === 'test1'
          ? 'Create my feed'
          : 'Continue'}
      </Button>
    </footer>
  );
};

export default function CreateMyFeedModalForNewUsers({
  className,
  onRequestClose,
  feedFilterOnboardingModalType,
  actionToOpenFeedFilters,
  feedFilterModalType,
  ...modalProps
}: CreateMyFeedModalProps): ReactElement {
  const [isFeedFilterModalOpen, setIsFeedFilterModalOpen] = useState(false);

  const tags = [
    ['', 'docker', '', 'kubernetes', ''],
    ['', '', 'architecture', '', ''],
    ['', '', '', 'devops', ''],
    ['', 'cloud', '', '', ''],
  ];
  return !isFeedFilterModalOpen ? (
    <ResponsiveModal className={classNames(className)} {...modalProps}>
      <section className="flex overflow-hidden flex-col items-center py-6 px-6 mobileL:px-10 mt-24">
        <UserIcon className="m-2 w-12 h-12" />
        <h3 className="mt-4 font-bold typo-large-title">Create my feed</h3>
        <p className="mt-3 mb-16 text-center typo-title3 text-theme-label-tertiary">
          Devs with a personal feed get 11.5x more relevant articles
        </p>
        <CreateMyFeedModalIntroTagsContainer className="mb-20">
          {tags.map((row, i) => (
            <ul className="flex gap-3 mb-3">
              {row.map((tag) => (
                <CreateMyFeedModalIntroTags
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  tag={tag}
                />
              ))}
            </ul>
          ))}
        </CreateMyFeedModalIntroTagsContainer>
      </section>
      <ModalFooter
        feedFilterOnboardingModalType={feedFilterOnboardingModalType}
        onRequestClose={onRequestClose}
        actionToOpenFeedFilters={actionToOpenFeedFilters}
        feedFilterModalType={feedFilterModalType}
        setIsFeedFilterModalOpen={setIsFeedFilterModalOpen}
      />
    </ResponsiveModal>
  ) : (
    <CreateMyFeedModal
      isOpen={isFeedFilterModalOpen}
      onRequestClose={onRequestClose}
      feedFilterModalType={feedFilterModalType}
    />
  );
}
