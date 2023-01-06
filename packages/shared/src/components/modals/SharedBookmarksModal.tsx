import React, { ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import CopyIcon from '../icons/Copy';
import { Button } from '../buttons/Button';
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
import { useCopyLink } from '../../hooks/useCopyLink';
import { sharingBookmarks } from '../../lib/constants';
import { Modal, ModalProps } from './common/Modal';

export default function SharedBookmarksModal({
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
    <Modal size={Modal.Size.Medium} kind={Modal.Kind.FlexibleCenter} {...props}>
      <Modal.Header title="Bookmarks sharing" />
      <Modal.Body>
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
          <div className="relative py-4">
            <TextField
              name="rssUrl"
              inputId="rssUrl"
              label="Your unique RSS URL"
              type="url"
              fieldType="tertiary"
              actionButton={
                <Button
                  buttonSize="small"
                  className="btn-tertiary"
                  icon={<CopyIcon />}
                  onClick={() => copyRssUrl()}
                />
              }
              value={bookmarksSharingData?.bookmarksSharing?.rssUrl}
              readOnly
            />
          </div>
        )}
        <div className="p-6 mt-4 rounded-16 border border-theme-divider-tertiary">
          <p className="typo-callout text-theme-label-tertiary">
            Need inspiration? we prepared some tutorials explaining some best
            practices of integrating your bookmarks with other platforms.
          </p>
          <div className="flex justify-between mt-4">
            <Button
              rel="noopener noreferrer"
              className="btn-secondary"
              buttonSize="small"
              href={sharingBookmarks}
              tag="a"
              target="_blank"
            >
              Explore tutorials
            </Button>
            <div className="flex gap-2 items-center h-8 text-2xl">
              <DiscordIcon size="large" />
              <TwitterIcon size="large" secondary />
              <SlackIcon size="large" />
              <GithubIcon size="large" />
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
