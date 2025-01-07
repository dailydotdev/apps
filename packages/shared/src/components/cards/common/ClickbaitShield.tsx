import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { Button, ButtonSize } from '../../buttons/Button';
import { ShieldCheckIcon, ShieldIcon, ShieldWarningIcon } from '../../icons';
import {
  useActions,
  usePlusSubscription,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import { SimpleTooltip } from '../../tooltips';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { ActionType } from '../../../graphql/actions';
import type { Post } from '../../../graphql/posts';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { FeedSettingsMenu } from '../../feeds/FeedSettings/types';
import { useAuthContext } from '../../../contexts/AuthContext';
import { webappUrl } from '../../../lib/constants';

export const ClickbaitShield = ({ post }: { post: Post }): ReactElement => {
  const { openModal } = useLazyModal();
  const { isPlus, showPlusSubscription } = usePlusSubscription();
  const { checkHasCompleted } = useActions();
  const { fetchSmartTitle, fetchedSmartTitle, shieldActive } =
    useSmartTitle(post);
  const isMobile = useViewSize(ViewSize.MobileL);
  const router = useRouter();
  const { user } = useAuthContext();

  if (!showPlusSubscription) {
    return null;
  }

  if (!isPlus) {
    const hasUsedFreeTrial = checkHasCompleted(ActionType.FetchedSmartTitle);
    return (
      <SimpleTooltip
        container={{
          className: 'max-w-70 text-center typo-subhead',
        }}
        content={
          fetchedSmartTitle ? (
            <>
              {hasUsedFreeTrial &&
                'Want to automatically optimize titles across your feed? Upgrade to Plus'}
            </>
          ) : (
            <>
              {hasUsedFreeTrial
                ? 'Potential issues detected in this title. To get clearer, more informative titles, enable Clickbait Shield'
                : 'This title could be clearer and more informative. Try out Clickbait Shield'}
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
              <ShieldWarningIcon />
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
      </SimpleTooltip>
    );
  }

  return (
    <SimpleTooltip
      container={{
        className: 'max-w-70 text-center typo-subhead',
      }}
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
    </SimpleTooltip>
  );
};
