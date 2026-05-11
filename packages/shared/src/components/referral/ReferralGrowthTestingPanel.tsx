import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import {
  chromeWebStoreReviewUrl,
  settingsUrl,
  webappUrl,
} from '../../lib/constants';
import { ReferralCampaignKey } from '../../lib/referral';
import { ReferralGrowthSurface } from '../../lib/referralGrowth';
import { ContextualReferralLink } from './ContextualReferralLink';

const demoSurfaces = [
  {
    surface: ReferralGrowthSurface.DevCard,
    title: 'DevCard invite',
    description:
      'Demo the tracked invite prompt shown after someone prepares their DevCard.',
    buttonText: 'Copy DevCard invite',
  },
  {
    surface: ReferralGrowthSurface.StreakMilestone,
    title: 'Streak challenge',
    description:
      'Demo the tracked invite prompt attached to a reading streak milestone.',
    buttonText: 'Copy streak invite',
  },
  {
    surface: ReferralGrowthSurface.TopReaderBadge,
    title: 'Top reader badge',
    description:
      'Demo the tracked invite prompt shown from the top-reader badge moment.',
    buttonText: 'Copy badge invite',
  },
  {
    surface: ReferralGrowthSurface.Brief,
    title: 'Brief share',
    description:
      'Demo the tracked invite prompt for sharing a useful brief with a colleague.',
    buttonText: 'Copy brief invite',
  },
];

export function ReferralGrowthTestingPanel(): ReactElement {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedSurface, setSelectedSurface] = useState(demoSurfaces[0]);
  const [showReviewStep, setShowReviewStep] = useState(false);
  const profileUrl = user?.username
    ? `${webappUrl}${user.username}`
    : webappUrl;

  if (isCollapsed) {
    return (
      <button
        type="button"
        className="text-text-inverted fixed bottom-4 right-4 z-max rounded-12 border border-border-subtlest-tertiary bg-accent-cabbage-default px-3 py-2 font-bold typo-footnote"
        onClick={() => setIsCollapsed(false)}
      >
        Open referral QA
      </button>
    );
  }

  return (
    <aside className="fixed bottom-4 right-4 z-max flex max-h-[calc(100dvh-2rem)] w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-3 overflow-auto rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2">
      {/*
        TEMPORARY QA PANEL: remove this component and its MainLayout render
        completely after referral/review preview testing is done.
      */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Callout}>
            Referral/review QA panel
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Temporary testing panel. Remove completely before this experiment is
            finalized.
          </Typography>
        </div>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          onClick={() => setIsCollapsed(true)}
        >
          Hide
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          tag="a"
          href={`${settingsUrl}/customization/devcard`}
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          DevCard
        </Button>
        <Button
          tag="a"
          href={`${settingsUrl}/invite`}
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          Invite page
        </Button>
        <Button
          tag="a"
          href={`${webappUrl}squads/new`}
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          New Squad
        </Button>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          onClick={() => openModal({ type: LazyModal.Feedback })}
        >
          Feedback
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Typography bold type={TypographyType.Footnote}>
          Demo invite prompt
        </Typography>
        <div className="flex flex-wrap gap-2">
          {demoSurfaces.map((item) => (
            <Button
              key={item.surface}
              type="button"
              size={ButtonSize.XSmall}
              variant={
                selectedSurface.surface === item.surface
                  ? ButtonVariant.Primary
                  : ButtonVariant.Tertiary
              }
              onClick={() => setSelectedSurface(item)}
            >
              {item.title}
            </Button>
          ))}
        </div>
        {!user?.id && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Log in to test tracked copy links.
          </Typography>
        )}
        <ContextualReferralLink
          url={profileUrl}
          campaignKey={ReferralCampaignKey.ShareProfile}
          surface={selectedSurface.surface}
          origin="temporary referral QA panel"
          title={selectedSurface.title}
          description={selectedSurface.description}
          buttonText={selectedSurface.buttonText}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
        <Typography bold type={TypographyType.Footnote}>
          Demo review ask
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          This mirrors the two-step Chrome Web Store ask without completing the
          one-time action.
        </Typography>
        {showReviewStep ? (
          <Button
            tag="a"
            href={chromeWebStoreReviewUrl}
            target="_blank"
            rel="noopener"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
          >
            Review on Chrome Web Store
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={() => setShowReviewStep(true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
              onClick={() => openModal({ type: LazyModal.Feedback })}
            >
              Not really
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
