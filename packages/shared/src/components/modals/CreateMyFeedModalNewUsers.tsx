import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './CreateMyFeedNewUsers.module.css';
import UserIcon from '../../../icons/user.svg';
import { Button } from '../buttons/Button';
import CreateMyFeedModalIntroTags from './CreateMyFeedModalNewUsersTags';
import { CreateMyFeedModalIntroTagsContainer } from '../utilities';

type TypeProps = {
  feedFilterOnboardingModalType: string;
  actionToOpenFeedFilters: () => unknown;
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
}: LayoutModalProps) => {
  const onCreateMyFeedButtonClick = (
    event: React.MouseEvent<Element, MouseEvent>,
  ): void => {
    actionToOpenFeedFilters();
    onRequestClose(event);
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
          className="w-20 text-theme-label-tertiary btn-default ml-4"
          onClick={onRequestClose}
        >
          Skip
        </Button>
      )}

      <Button
        className="w-40 btn-primary-cabbage mr-4"
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
  ...modalProps
}: CreateMyFeedModalProps): ReactElement {
  const tags = [
    ['', 'docker', '', 'kubernetes', ''],
    ['', '', 'architecture', '', ''],
    ['', '', '', 'devops', ''],
    ['', 'cloud', '', '', ''],
  ];
  return (
    <ResponsiveModal
      className={classNames(className, styles.createMyFeedNewUsersModal)}
      {...modalProps}
    >
      <section className="flex flex-col items-center py-6 px-6 mobileL:px-10 mt-24 overflow-hidden">
        <UserIcon className="w-12 h-12 m-2" />
        <h3 className="font-bold typo-large-title mt-4">Create my feed</h3>
        <p className="typo-title3 text-center text-theme-label-tertiary mt-3 mb-16">
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
      />
    </ResponsiveModal>
  );
}
