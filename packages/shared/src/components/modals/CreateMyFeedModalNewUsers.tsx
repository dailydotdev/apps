import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './CreateMyFeedNewUsers.module.css';
import CreateFeedFilterButton from '../CreateFeedFilterButton';
import UserIcon from '../../../icons/user.svg';
import { Button } from '../buttons/Button';
import CreateMyFeedModalIntroTags from './CreateMyFeedModalNewUsersTags';
import { CreateMyFeedModalIntroTagsContainer } from '../utilities';

type TypeProps = {
  feedFilterModalType: string;
};

type CreateMyFeedModalProps = TypeProps & ModalProps;

type LayoutModalProps = TypeProps & Pick<ModalProps, 'onRequestClose'>;

const buttonClass = {
  v4: 'w-40',
  v5: 'w-40 ml-3',
};

const ModalFooter = ({
  feedFilterModalType,
  onRequestClose,
}: LayoutModalProps) => {
  return (
    <footer className="flex fixed responsiveModalBreakpoint:sticky bottom-0 justify-center items-center py-3 border-t border-theme-divider-tertiary bg-theme-bg-tertiary">
      {feedFilterModalType === 'v5' && (
        <Button className="mr-3 w-40 btn-secondary" onClick={onRequestClose}>
          Cancel
        </Button>
      )}
      <CreateFeedFilterButton
        className={classNames(
          buttonClass[feedFilterModalType],
          'btn-primary-cabbage',
        )}
        feedFilterModalType={feedFilterModalType}
        buttonText="Create my feed"
      />
    </footer>
  );
};

export default function CreateMyFeedModalForNewUsers({
  className,
  onRequestClose,
  feedFilterModalType,
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
      onRequestClose={onRequestClose}
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
        feedFilterModalType={feedFilterModalType}
        onRequestClose={onRequestClose}
      />
    </ResponsiveModal>
  );
}
