import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import UserIcon from '../../../icons/user.svg';
import { Button } from '../buttons/Button';
import CreateMyFeedModalIntroTags from './FeedFiltersIntroModalTags';
import { FeedFiltersIntroModalTagsContainer } from '../utilities';

type TypeProps = {
  actionToOpenFeedFilters: () => unknown;
  feedFilterModalType: string;
};

type ModalFooterProps = {
  feedFilterOnboardingModalType: string;
  onOpenFeedFilterModal: (event: React.MouseEvent<Element, MouseEvent>) => void;
};

type CreateMyFeedModalProps = TypeProps & ModalFooterProps & ModalProps;

type LayoutModalProps = ModalFooterProps & Pick<ModalProps, 'onRequestClose'>;

const footerClass = {
  test1: 'justify-center',
  test2: 'justify-between',
};

const ModalFooter = ({
  feedFilterOnboardingModalType,
  onRequestClose,
  onOpenFeedFilterModal,
}: LayoutModalProps) => {
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
        onClick={onOpenFeedFilterModal}
      >
        {feedFilterOnboardingModalType === 'test1'
          ? 'Create my feed'
          : 'Continue'}
      </Button>
    </footer>
  );
};

export default function FeedFiltersIntroModal({
  className,
  onRequestClose,
  feedFilterOnboardingModalType,
  actionToOpenFeedFilters,
  feedFilterModalType,
  onOpenFeedFilterModal,
  ...modalProps
}: CreateMyFeedModalProps): ReactElement {
  const tags = [
    ['', 'docker', '', 'kubernetes', ''],
    ['', '', 'architecture', '', ''],
    ['', '', '', 'devops', ''],
    ['', 'cloud', '', '', ''],
  ];
  return (
    <ResponsiveModal className={classNames(className)} {...modalProps}>
      <section className="flex overflow-hidden flex-col items-center py-6 px-6 mobileL:px-10 mt-24">
        <UserIcon className="m-2 w-12 h-12" />
        <h3 className="mt-4 font-bold typo-large-title">Create my feed</h3>
        <p className="mt-3 mb-16 text-center typo-title3 text-theme-label-tertiary">
          Devs with a personal feed get 11.5x more relevant articles
        </p>
        <FeedFiltersIntroModalTagsContainer className="mb-20">
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
        </FeedFiltersIntroModalTagsContainer>
      </section>
      <ModalFooter
        feedFilterOnboardingModalType={feedFilterOnboardingModalType}
        onRequestClose={onRequestClose}
        onOpenFeedFilterModal={onOpenFeedFilterModal}
      />
    </ResponsiveModal>
  );
}
