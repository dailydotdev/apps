import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonSize } from '../../buttons/Button';
import { ShieldCheckIcon, ShieldIcon, ShieldWarningIcon } from '../../icons';
import {
  usePlusSubscription,
  useViewSize,
  ViewSize,
  useClickbaitTries,
  useConditionalFeature,
} from '../../../hooks';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import type { Post } from '../../../graphql/posts';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { FeedSettingsMenu } from '../../feeds/FeedSettings/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { webappUrl } from '../../../lib/constants';
import { Tooltip } from '../../tooltip/Tooltip';
import { featureFeedClickbaitShieldWarning } from '../../../lib/featureManagement';

export const ClickbaitShield = ({
  post,
}: {
  post: Post;
}): ReactElement | null => {
  const { openModal } = useLazyModal();
  const { isPlus } = usePlusSubscription();
  const { fetchSmartTitle, fetchedSmartTitle, shieldActive } =
    useSmartTitle(post);
  const isMobile = useViewSize(ViewSize.MobileL);
  const router = useRouter();
  const { user } = useAuthContext();
  const { hasUsedFreeTrial, triesLeft } = useClickbaitTries();
  const { value: showWarningShield } = useConditionalFeature({
    feature: featureFeedClickbaitShieldWarning,
    shouldEvaluate: !isPlus,
  });

  if (!isPlus) {
    if (!fetchedSmartTitle && !showWarningShield) {
      return null;
    }

    return (
      <Tooltip
        className="max-w-70 text-center !typo-subhead"
        content={
          fetchedSmartTitle ? (
            <>
              {hasUsedFreeTrial &&
                'Want to automatically optimize titles across your feed? Upgrade to Plus'}
            </>
          ) : (
            <>
              {hasUsedFreeTrial
                ? `Potential issues detected in this title. To get clearer, more informative titles, enable Clickbait Shield`
                : `This title could be clearer and more informative. Try out Clickbait Shield for free (${triesLeft} uses left this month).`}
            </>
          )
        }
      >
        <Button
          className="relative mr-2 text-accent-cheese-default"
          size={ButtonSize.XSmall}
          icon={
            fetchedSmartTitle ? (
              <ShieldCheckIcon className="text-status-success" />
            ) : (
              <ShieldWarningIcon
                className={
                  hasUsedFreeTrial
                    ? 'text-accent-ketchup-default'
                    : 'text-accent-cheese-default'
                }
              />
            )
          }
          iconSecondaryOnHover
          onClick={async () => {
            if (hasUsedFreeTrial) {
              if (isMobile) {
                openModal({
                  type: LazyModal.ClickbaitShield,
                });
              } else {
                if (!user) {
                  throw new Error(
                    'ClickbaitShield requires an authenticated user to edit feed settings',
                  );
                }

                router.push(
                  `${webappUrl}feeds/${user.id}/edit?dview=${FeedSettingsMenu.AI}`,
                );
              }
            } else if (isMobile) {
              openModal({
                type: LazyModal.ClickbaitShield,
                props: {
                  hasUsedFreeTrial,
                  fetchSmartTitle,
                },
              });
            } else {
              await fetchSmartTitle();
            }
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip
      className="max-w-70 text-center !typo-subhead"
      content={
        shieldActive
          ? 'Click to see the original title'
          : 'Click to see the optimized title'
      }
    >
      <Button
        className="relative mr-2"
        size={ButtonSize.XSmall}
        icon={
          shieldActive ? (
            <ShieldCheckIcon className="text-status-success" />
          ) : (
            <ShieldIcon />
          )
        }
        iconSecondaryOnHover
        onClick={fetchSmartTitle}
      />
    </Tooltip>
  );
};
