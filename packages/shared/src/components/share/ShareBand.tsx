import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ShareActions } from './ShareActions';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { SlackCtaButton } from '../widgets/SlackCtaButton';
import type { ReferralCampaignKey } from '../../lib/referral';
import type { ShareProvider } from '../../lib/share';
import type { Post } from '../../graphql/posts';
import type { Origin } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';

export interface ShareBandProps {
  title: string;
  description: string;
  link: string;
  /** Share text / description used for native share + pre-filled network text. */
  text: string;
  /** Omit when `link` is already a tracked short URL — passing it double-shortens. */
  cid?: ReferralCampaignKey;
  /** Adds Slack to the networks behind the chevron. */
  post?: Post;
  /** The post the Slack button beside Copy link shares; defaults to `post`. */
  slackPost?: Post;
  origin?: Origin;
  emailTitle?: string;
  /** Surface and spacing belong to the host: the two callers sit in different places. */
  className?: string;
  onShare: (provider: ShareProvider) => void;
}

/**
 * One line of encouraging copy beside a single split copy-link control, with
 * the social networks behind its chevron.
 *
 * Shared by the two surfaces that prompt a share: `EndOfThreadShare` below an
 * active discussion, and `PostContentShare` right after an upvote.
 * They differ only in copy, link and placement — everything visual lives here
 * so the two cannot drift apart.
 */
export const ShareBand = ({
  title,
  description,
  link,
  text,
  cid,
  post,
  slackPost = post,
  origin,
  emailTitle,
  className,
  onShare,
}: ShareBandProps): ReactElement => {
  const { user } = useAuthContext();
  // connecting a workspace needs an account
  const slackSharePost = user ? slackPost : undefined;

  return (
    <aside
      // Labelled by its own visible copy, so no aria-label here — a second label
      // on the landmark would shadow the share button's.
      className={classNames(
        'flex flex-col items-stretch gap-3 text-center tablet:flex-row tablet:flex-wrap tablet:items-center tablet:gap-x-4 tablet:text-left',
        className,
      )}
    >
      {/* the buttons wrap below the copy rather than squeeze it any narrower */}
      <div className="flex min-w-0 flex-col gap-0.5 tablet:flex-[1_1_14rem]">
        <Typography bold type={TypographyType.Callout}>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      </div>
      <div className="flex flex-col gap-2 tablet:flex-row tablet:flex-wrap tablet:items-center">
        <ShareActions
          variant="split"
          link={link}
          text={text}
          cid={cid}
          // the button beside it is Slack's one door while it shows
          post={slackSharePost ? undefined : post}
          origin={origin}
          emailTitle={emailTitle}
          buttonVariant={ButtonVariant.Primary}
          buttonSize={ButtonSize.Small}
          label="Copy link"
          triggerText="Copy link"
          dropdownLabel="More share options"
          className="w-full tablet:w-auto"
          onShare={onShare}
        />
        {slackSharePost && (
          <SlackCtaButton
            post={slackSharePost}
            origin={origin}
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            className="w-full tablet:w-auto"
          />
        )}
      </div>
    </aside>
  );
};
