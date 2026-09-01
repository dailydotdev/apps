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
import type { ReferralCampaignKey } from '../../lib/referral';
import type { ShareProvider } from '../../lib/share';

export interface ShareBandProps {
  title: string;
  description: string;
  link: string;
  /** Share text / description used for native share + pre-filled network text. */
  text: string;
  /** Omit when `link` is already a tracked short URL — passing it double-shortens. */
  cid?: ReferralCampaignKey;
  emailTitle?: string;
  /** Surface and spacing belong to the host: the two callers sit in different places. */
  className?: string;
  onShare: (provider: ShareProvider) => void;
}

/**
 * One line of encouraging copy beside a single split copy-link control, with
 * the social networks behind its chevron.
 *
 * Shared by the two surfaces that prompt a share: `EndOfConversationShare`
 * below an active discussion, and `PostContentShare` right after an upvote.
 * They differ only in copy, link and placement — everything visual lives here
 * so the two cannot drift apart.
 */
export const ShareBand = ({
  title,
  description,
  link,
  text,
  cid,
  emailTitle,
  className,
  onShare,
}: ShareBandProps): ReactElement => (
  <aside
    // Labelled by its own visible copy, so no aria-label here — a second label
    // on the landmark would shadow the share button's.
    className={classNames(
      'flex flex-col items-center gap-3 text-center tablet:flex-row tablet:justify-between tablet:text-left',
      className,
    )}
  >
    <div className="flex min-w-0 flex-col gap-0.5">
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
    <ShareActions
      variant="split"
      link={link}
      text={text}
      cid={cid}
      emailTitle={emailTitle}
      buttonVariant={ButtonVariant.Primary}
      buttonSize={ButtonSize.Small}
      label="Copy link"
      triggerText="Copy link"
      dropdownLabel="More share options"
      className="shrink-0"
      onShare={onShare}
    />
  </aside>
);
