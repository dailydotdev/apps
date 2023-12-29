import React, { ReactElement } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import CopyIcon from '../icons/Copy';
import { Button, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import { Switch } from '../fields/Switch';
import {
  BookmarksSharingData,
  BOOKMARK_SHARING_MUTATION,
  BOOKMARK_SHARING_QUERY,
} from '../../graphql/bookmarksSharing';
import { graphqlUrl } from '../../lib/config';
import { TextField } from '../fields/TextField';
import TwitterIcon from '../icons/Twitter';
import SlackIcon from '../icons/Slack';
import DiscordIcon from '../icons/Discord';
import GithubIcon from '../icons/GitHub';
import { useCopyLink } from '../../hooks/useCopy';
import { sharingBookmarks } from '../../lib/constants';
import { Modal, ModalProps } from './common/Modal';
import { IconSize } from '../Icon';

export default function SharedBookmarksModal({
  ...props
}: ModalProps): ReactElement {
  const queryClient = useQueryClient();

  const { data: bookmarksSharingData, isFetched } =
    useQuery<BookmarksSharingData>(['bookmarksSharing'], () =>
      request(graphqlUrl, BOOKMARK_SHARING_QUERY),
    );

  const { mutateAsync: updateBookmarksSharing } = useMutation<{
    enabled: boolean;
  }>(
    () => {
      const updatedValue = !bookmarksSharingData?.bookmarksSharing?.enabled;
      return request(graphqlUrl, BOOKMARK_SHARING_MUTATION, {
        enabled: updatedValue,
      });
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['bookmarksSharing'], data);
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
        <p className="text-theme-label-tertiary typo-callout">
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
              autoComplete="off"
              fieldType="tertiary"
              actionButton={
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  icon={<CopyIcon />}
                  onClick={() => copyRssUrl()}
                />
              }
              value={bookmarksSharingData?.bookmarksSharing?.rssUrl}
              readOnly
            />
          </div>
        )}
        <div className="mt-4 rounded-16 border border-theme-divider-tertiary p-6">
          <p className="text-theme-label-tertiary typo-callout">
            Need inspiration? we prepared some tutorials explaining some best
            practices of integrating your bookmarks with other platforms.
          </p>
          <div className="mt-4 flex justify-between">
            <Button
              rel="noopener noreferrer"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              href={sharingBookmarks}
              tag="a"
              target="_blank"
            >
              Explore tutorials
            </Button>
            <div className="flex h-8 items-center gap-2 text-2xl">
              <DiscordIcon size={IconSize.Medium} />
              <TwitterIcon size={IconSize.Medium} />
              <SlackIcon size={IconSize.Medium} />
              <GithubIcon size={IconSize.Medium} />
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
