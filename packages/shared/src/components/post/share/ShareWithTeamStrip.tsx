import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { SlackIcon } from '../../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { ShareActions } from '../../share/ShareActions';
import { useCopyPostLink } from '../../../hooks/useCopyPostLink';
import { useGetShortUrl } from '../../../hooks';
import { ReferralCampaignKey } from '../../../lib/referral';
import { useLogContext } from '../../../contexts/LogContext';
import { postLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import { ShareProvider } from '../../../lib/share';

interface ShareWithTeamStripProps {
  post: Post;
  className?: string;
}

/**
 * Quiet band offering the single most common "share at work" move.
 *
 * Slack publishes no web share-intent URL (unlike X/WhatsApp/LinkedIn), so
 * "Send to Slack" copies the post link: Slack unfurls a pasted daily.dev link
 * into a rich card from the post's OG tags. A first-class Slack app posting via
 * `chat.postMessage`/`chat.unfurl` is a backend dependency, not something the
 * client can do on its own.
 */
export const ShareWithTeamStrip = ({
  post,
  className,
}: ShareWithTeamStripProps): ReactElement => {
  const [copying, copyLink] = useCopyPostLink();
  const { getShortUrl } = useGetShortUrl();
  const { logEvent } = useLogContext();

  const logShare = (provider: ShareProvider) =>
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider, origin: Origin.PostTeamShare },
      }),
    );

  const onSendToSlack = async () => {
    const shortLink = await getShortUrl(
      post.commentsPermalink,
      ReferralCampaignKey.SharePost,
    );
    copyLink({
      link: shortLink,
      message: '✅ Link copied — paste it in any Slack channel',
    });
    logShare(ShareProvider.CopyLink);
  };

  return (
    <div
      className={classNames(
        'flex flex-col gap-3 rounded-14 border border-border-subtlest-tertiary bg-surface-float px-4 py-3 tablet:flex-row tablet:items-center',
        className,
      )}
      data-testid="share-with-team-strip"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography bold type={TypographyType.Callout}>
          Share this with your team
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          Drop the link in a channel — it unfurls with the title and summary.
        </Typography>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          icon={<SlackIcon />}
          onClick={onSendToSlack}
          pressed={copying}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Secondary}
        >
          {copying ? 'Copied!' : 'Send to Slack'}
        </Button>
        <ShareActions
          cid={ReferralCampaignKey.SharePost}
          emailSummary={post.summary}
          emailTitle={post.title}
          label="More sharing options"
          link={post.commentsPermalink}
          onShare={logShare}
          text={post.title ?? post.sharedPost?.title ?? ''}
        />
      </div>
    </div>
  );
};
