import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import CopyIcon from '../icons/Copy';
import { Button } from '../buttons/Button';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import styles from './AccountDetailsModal.module.css';
import { Switch } from '../fields/Switch';
import {
  BookmarksSharingData,
  BOOKMARK_SHARING_MUTATION,
  BOOKMARK_SHARING_QUERY,
} from '../../graphql/bookmarksSharing';
import { apiUrl } from '../../lib/config';
import { TextField } from '../fields/TextField';
import TwitterIcon from '../icons/Twitter';
import SlackIcon from '../icons/Slack';
import DiscordIcon from '../icons/Discord';
import GithubIcon from '../icons/GitHub';
import { ModalCloseButton } from './ModalCloseButton';
import { useCopyLink } from '../../hooks/useCopyLink';

export default function SharedBookmarksModal({
  className,
  ...props
}: ModalProps): ReactElement {
  const queryClient = useQueryClient();

  const { data: bookmarksSharingData, isFetched } =
    useQuery<BookmarksSharingData>('bookmarksSharing', () =>
      request(`${apiUrl}/graphql`, BOOKMARK_SHARING_QUERY),
    );

  const { mutateAsync: updateBookmarksSharing } = useMutation<{
    enabled: boolean;
  }>(
    () => {
      const updatedValue = !bookmarksSharingData?.bookmarksSharing?.enabled;
      return request(`${apiUrl}/graphql`, BOOKMARK_SHARING_MUTATION, {
        enabled: updatedValue,
      });
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData('bookmarksSharing', data);
      },
    },
  );

  const [, copyRssUrl] = useCopyLink(
    () => bookmarksSharingData?.bookmarksSharing?.rssUrl,
  );

  if (!isFetched || !bookmarksSharingData?.bookmarksSharing) {
    return <></>;
  }

  return (
    <ResponsiveModal
      className={classNames(className, styles.accountDetailsModal)}
      {...props}
    >
      <header className="flex justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <h3 className="pl-2 font-bold typo-title3">Bookmarks sharing</h3>
        <ModalCloseButton onClick={props.onRequestClose} />
      </header>
      <section className="flex flex-col py-6 px-6 mobileL:px-10">
        <Switch
          inputId="share-bookmarks-switch"
          name="share-bookmarks"
          className="mb-4"
          checked={bookmarksSharingData?.bookmarksSharing?.enabled}
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
        {bookmarksSharingData?.bookmarksSharing?.enabled && (
          <div className="relative">
            <TextField
              className="mt-6"
              name="rssUrl"
              inputId="rssUrl"
              label="Your unique RSS URL"
              type="url"
              fieldType="tertiary"
              actionIcon={<CopyIcon />}
              onActionIconClick={copyRssUrl}
              value={bookmarksSharingData?.bookmarksSharing?.rssUrl}
              readOnly
            />
          </div>
        )}
      </section>
      <section className="p-6 m-4 rounded-16 border border-theme-divider-tertiary">
        <p className="typo-callout text-theme-label-tertiary">
          Need inspiration? we prepared some tutorials explaining some best
          practices of integrating your bookmarks with other platforms.
        </p>
        <div className="flex justify-between mt-4">
          <Button
            rel="noopener noreferrer"
            className="btn-secondary"
            buttonSize="small"
            href="https://docs.daily.dev/docs/integrations/sharing-bookmarks"
            tag="a"
            target="_blank"
          >
            Explore tutorials
          </Button>
          <div className="flex gap-2 items-center h-8 text-2xl">
            <DiscordIcon size="medium" />
            <TwitterIcon size="medium" />
            <SlackIcon size="medium" />
            <GithubIcon size="medium" />
          </div>
        </div>
      </section>
    </ResponsiveModal>
  );
}
