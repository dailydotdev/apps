import React, { type ReactElement } from 'react';
import { Button, ButtonSize } from '../../buttons/Button';
import { ShieldCheckIcon, ShieldIcon, ShieldWarningIcon } from '../../icons';
import { useActions, usePlusSubscription } from '../../../hooks';
import { SimpleTooltip } from '../../tooltips';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { FilterMenuTitle } from '../../filters/helpers';
import { ActionType } from '../../../graphql/actions';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import type { Post } from '../../../graphql/posts';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';

export const ClickbaitShield = ({ post }: { post: Post }): ReactElement => {
  const { openModal } = useLazyModal();
  const { isPlus, showPlusSubscription } = usePlusSubscription();
  const { checkHasCompleted } = useActions();
  const { flags } = useSettingsContext();
  const { clickbaitShieldEnabled } = flags;
  const { fetchSmartTitle, usedTrial } = useSmartTitle(post);

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
        // visible
        content={
          hasUsedFreeTrial
            ? 'Potential issues detected in this title. To get clearer, more informative titles, enable Clickbait Shield'
            : 'This title could be clearer and more informative. Try out Clickbait Shield'
        }
      >
        <Button
          className="relative mr-2 text-accent-cheese-default"
          size={ButtonSize.XSmall}
          icon={
            usedTrial ? (
              <ShieldCheckIcon className="text-status-success" />
            ) : (
              <ShieldWarningIcon />
            )
          }
          iconSecondaryOnHover
          onClick={() => {
            if (hasUsedFreeTrial) {
              openModal({
                type: LazyModal.FeedFilters,
                props: {
                  defaultView: FilterMenuTitle.ContentTypes,
                },
              });
            } else {
              fetchSmartTitle();
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
        clickbaitShieldEnabled
          ? 'Click to see the original title'
          : 'Click to see the optimized title'
      }
    >
      <Button
        className="relative mr-2"
        size={ButtonSize.XSmall}
        icon={
          clickbaitShieldEnabled ? (
            <ShieldCheckIcon className="text-status-success" />
          ) : (
            <ShieldIcon />
          )
        }
        iconSecondaryOnHover
        onClick={() => {
          fetchSmartTitle();
        }}
      />
    </SimpleTooltip>
  );
};
