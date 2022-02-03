import React, { ReactElement, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import XIcon from '../../../icons/x.svg';
import AuthContext from '../../contexts/AuthContext';
import { Button } from '../buttons/Button';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { BookmarksModelHeading } from '../utilities';
import styles from './AccountDetailsModal.module.css';
import { Switch } from '../fields/Switch';
import { useMutation, useQuery } from 'react-query';
import {
  BookmarksSharingData,
  BOOKMARK_SHARING_MUTATION,
  BOOKMARK_SHARING_QUERY,
} from '../../graphql/bookmarksSharing';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';

export default function SharedBookmarksModal({
  className,
  ...props
}: ModalProps): ReactElement {
  const { user } = useContext(AuthContext);
  const [shareBookmarks, setShareBookmarks] = useState(false);
  const { tokenRefreshed } = useContext(AuthContext);

  const { data: bookmarksSharingResponse } = useQuery<BookmarksSharingData>(
    'bookmarksSharing',
    () => request(`${apiUrl}/graphql`, BOOKMARK_SHARING_QUERY, {}),
    {
      enabled: true,
    },
  );

  const { mutateAsync: updateBookmarksSharing } = useMutation<{
    enabled: false;
  }>(
    (params) =>
      request(`${apiUrl}/graphql`, BOOKMARK_SHARING_MUTATION, {
        enabled: shareBookmarks,
      }),
    {},
  );

  const onShareBookmarks = async () => {
    setShareBookmarks(!shareBookmarks);
    console.log(bookmarksSharingResponse.bookmarksSharing.rssUrl);
    await updateBookmarksSharing();
  };

  return (
    <>
      <ResponsiveModal
        className={classNames(className, styles.accountDetailsModal)}
        {...props}
      >
        <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 justify-between items-center px-4 w-full h-12 border-b bg-theme-bg-secondary border-theme-divider-tertiary">
          <BookmarksModelHeading className="mt-2">
            Bookmarks sharing
          </BookmarksModelHeading>
          <Button
            title="Close"
            onClick={props.onRequestClose}
            icon={<XIcon />}
            className="btn-tertiary"
          />
        </header>
        <div className="px-6 mobileL:px-10 pt-6 pb-4">
          <Switch
            inputId="share-bookmarks-switch"
            name="hide-read"
            className="my-3"
            checked={shareBookmarks}
            onToggle={onShareBookmarks}
            compact={false}
          >
            Public mode
          </Switch>
        </div>
        <section className="flex flex-col px-6 mobileL:px-10 pb-10">
          <p className="typo-callout text-theme-label-tertiary">
            Switching to public mode will generate a public rss feed of your
            bookmarks. Use this link to integrate and automatically share your
            bookmarks with other developers.
          </p>
          <br />
          <p className="typo-callout text-theme-label-tertiary">
            Need inspiration? we prepared some tutorials explaining some best
            practices of integrating your bookmarks with other platforms.
            <br />
          </p>
          <div className="flex">
            <Button
              className="btn-secondary"
              buttonSize="medium"
              onClick={() => onShareBookmarks()}
            >
              Share bookmarks
            </Button>
          </div>
        </section>
      </ResponsiveModal>
    </>
  );
}
