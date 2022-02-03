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
import SettingsContext from '../../contexts/SettingsContext';
import { TextField } from '../fields/TextField';
import { ModalHeader } from './common';
import TwitterIcon from '../../../icons/twitter_color.svg';
import SlackIcon from '../../../icons/slack.svg';
import WhatsappIcon from '../../../icons/whatsapp_color.svg';
import TelegramIcon from '../../../icons/telegram_color.svg';
import { ModalCloseButton } from './ModalCloseButton';

export default function SharedBookmarksModal({
  className,
  ...props
}: ModalProps): ReactElement {
  const { user } = useContext(AuthContext);
  const [shareBookmarks, setShareBookmarks] = useState<boolean>(false);
  const { tokenRefreshed } = useContext(AuthContext);

  const { data: bookmarksSharingData } = useQuery<BookmarksSharingData>(
    'bookmarksSharing',
    () => request(`${apiUrl}/graphql`, BOOKMARK_SHARING_QUERY),
  );

  useEffect(() => {
    if (bookmarksSharingData?.bookmarksSharing?.enabled)
      setShareBookmarks(true);
  }, [bookmarksSharingData]);

  const { mutateAsync: updateBookmarksSharing } = useMutation<{
    enabled: boolean;
  }>(() => {
    const updatedValue = !shareBookmarks;
    setShareBookmarks(updatedValue);
    return request(`${apiUrl}/graphql`, BOOKMARK_SHARING_MUTATION, {
      enabled: updatedValue,
    });
  });

  return (
    <>
      <ResponsiveModal
        className={classNames(className, styles.accountDetailsModal)}
        {...props}
      >
        <ModalHeader>
          <h3 className="font-bold typo-title3">Bookmarks sharing</h3>
          <ModalCloseButton onClick={props.onRequestClose} />
        </ModalHeader>
        <section className="flex flex-col py-6 px-6 mobileL:px-10">
          <Switch
            inputId="share-bookmarks-switch"
            name="hide-read"
            className="mb-4"
            checked={shareBookmarks}
            onToggle={updateBookmarksSharing}
            compact={false}
          >
            Public mode
          </Switch>
          <p className="typo-callout text-theme-label-tertiary">
            Switching to public mode will generate a public rss feed of your
            bookmarks. Use this link to integrate and automatically share your
            bookmarks with other developers.
          </p>
          {shareBookmarks && (
            <TextField
              className="mt-6"
              name="rssUrl"
              inputId="rssUrl"
              label="Your unique RSS URL"
              type="url"
              fieldType="tertiary"
              value={bookmarksSharingData?.bookmarksSharing?.rssUrl}
              readOnly
            />
          )}
        </section>
        <section className="m-4 p-6 rounded-16 border border-theme-divider-tertiary">
          <p className="typo-callout text-theme-label-tertiary">
            Need inspiration? we prepared some tutorials explaining some best
            practices of integrating your bookmarks with other platforms.
          </p>
          <div className="flex justify-between mt-4">
            <Button
              rel="noopener noreferrer"
              className="btn-secondary"
              buttonSize="small"
              href=""
              tag="a"
              target="_blank"
            >
              Explore tutorials
            </Button>
            <div className="flex items-center gap-1 h-8 text-2xl">
              <SlackIcon />
              <TwitterIcon />
              <TelegramIcon />
              <WhatsappIcon />
            </div>
          </div>
        </section>
      </ResponsiveModal>
    </>
  );
}
