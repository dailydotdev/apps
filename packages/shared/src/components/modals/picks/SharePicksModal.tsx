import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalClose } from '../common/ModalClose';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { TextField } from '../../fields/TextField';
import { Image, ImageType } from '../../image/Image';
import { CopyIcon } from '../../icons';
import { ShareIcon } from '../../icons/Share';
import { SlackIcon } from '../../icons/Slack';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { Picks } from '../../../graphql/picks';
import { getPicksPath } from '../../../graphql/picks';
import { useCopyLink } from '../../../hooks/useCopy';
import { useGetShortUrl } from '../../../hooks/utils/useGetShortUrl';
import { useSlackShareButton } from '../../../hooks/integrations/slack/useSlackShareButton';
import { useLogContext } from '../../../contexts/LogContext';
import { webappUrl } from '../../../lib/constants';
import { LogEvent } from '../../../lib/log';
import type { Origin } from '../../../lib/log';
import { ReferralCampaignKey } from '../../../lib/referral';

export type SharePicksModalProps = Omit<ModalProps, 'children'> & {
  picks: Picks;
  origin: Origin;
};

const maxThumbnails = 3;

type SharePicksProvider = 'copy_link' | 'slack' | 'native';

const SharePicksModal = ({
  picks,
  origin,
  ...props
}: SharePicksModalProps): ReactElement => {
  const { logEvent } = useLogContext();
  const baseLink = `${webappUrl}${getPicksPath(picks.id).replace(/^\//, '')}`;
  const { getTrackedUrl, getShortUrl, shareLink } = useGetShortUrl({
    query: { url: baseLink, cid: ReferralCampaignKey.SharePicks },
  });
  const trackedLink = getTrackedUrl(baseLink, ReferralCampaignKey.SharePicks);
  const link = shareLink || trackedLink;
  const [isCopying, copyLink] = useCopyLink(() => trackedLink, true);
  const { onClick: onSlackClick, isLoading: isSlackLoading } =
    useSlackShareButton({ picks, origin });

  const [first] = picks.items;
  const thumbnails = picks.items.slice(0, maxThumbnails);
  const count = picks.items.length;
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const log = (provider: SharePicksProvider) =>
    logEvent({
      event_name: LogEvent.SharePicks,
      extra: JSON.stringify({ provider, picks_id: picks.id, origin }),
    });

  const onCopy = () => {
    log('copy_link');
    copyLink({ link: trackedLink, shorten: true, message: 'Link copied' });
  };

  const onSlack = () => {
    log('slack');
    onSlackClick();
  };

  const onNative = async () => {
    log('native');

    try {
      const shortLink = await getShortUrl(
        baseLink,
        ReferralCampaignKey.SharePicks,
      );
      await navigator.share({
        title: 'My weekly picks',
        url: shortLink,
      });
    } catch {
      // dismissing the native sheet rejects, which is not an error to report
    }
  };

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
      {...props}
    >
      <ModalClose
        className="right-4 top-4"
        onClick={props.onRequestClose}
        variant={ButtonVariant.Tertiary}
      />
      <Modal.Body className="flex flex-col gap-4">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
        >
          Share your weekly picks
        </Typography>
        <div className="flex items-center gap-3 rounded-16 bg-surface-float p-3">
          <div
            className="flex shrink-0 items-center"
            data-testid="picks-thumbnails"
          >
            {thumbnails.map(({ post }, index) => (
              <Image
                key={post.id}
                type={ImageType.Post}
                src={post.image}
                alt=""
                className="h-12 w-12 rounded-10 border-2 border-background-default object-cover"
                style={{ marginLeft: index ? -16 : 0 }}
              />
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
              className="line-clamp-2"
            >
              {first?.post.title}
            </Typography>
            {!!first?.note && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
                className="line-clamp-2"
              >
                {first.note}
              </Typography>
            )}
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {count} {count === 1 ? 'post' : 'posts'}
            </Typography>
          </div>
        </div>
        <TextField
          inputId="share-picks-link"
          name="share-picks-link"
          label="Link"
          fieldType="secondary"
          readOnly
          value={link}
          onFocus={(event) => event.currentTarget.select()}
        />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            icon={<CopyIcon secondary={isCopying} />}
            onClick={onCopy}
          >
            Copy link
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Large}
            icon={<SlackIcon />}
            loading={isSlackLoading}
            onClick={onSlack}
          >
            Share to Slack
          </Button>
          {canNativeShare && (
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Large}
              icon={<ShareIcon />}
              onClick={onNative}
            >
              Share…
            </Button>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SharePicksModal;
