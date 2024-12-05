import React, { type ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ShieldCheckIcon, ShieldIcon, ShieldWarningIcon } from '../../icons';
import { useActions, usePlusSubscription } from '../../../hooks';
import { SimpleTooltip } from '../../tooltips';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { ActionType } from '../../../graphql/actions';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { LazyModal } from '../../modals/common/types';
import { FilterMenuTitle } from '../../filters/helpers';

import { ClickbaitTrial } from '../../plus/ClickbaitTrial';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import type { Post } from '../../../graphql/posts';

export const PostClickbaitShield = ({ post }: { post: Post }): ReactElement => {
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
      <div
        className={classNames(
          'mt-6 flex flex-wrap items-center text-text-tertiary typo-callout tablet:mt-1',
          !usedTrial &&
            'rounded-12 border border-border-subtlest-tertiary px-3 py-2',
        )}
      >
        <Button
          className="relative mr-2 font-normal"
          size={ButtonSize.XSmall}
          icon={
            usedTrial ? (
              <ShieldCheckIcon className="text-status-success" />
            ) : (
              <ShieldWarningIcon className="text-accent-cheese-default" />
            )
          }
          iconSecondaryOnHover
        />

        {usedTrial ? (
          <>
            This title was optimized with Clickbait Shield
            <ClickbaitTrial />
          </>
        ) : (
          <>
            This title could be clearer and more informative.
            <Button
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Option}
              className="!underline"
              onClick={async () => {
                if (hasUsedFreeTrial) {
                  openModal({
                    type: LazyModal.FeedFilters,
                    props: {
                      defaultView: FilterMenuTitle.ContentTypes,
                    },
                  });
                } else {
                  await fetchSmartTitle();
                }
              }}
            >
              {hasUsedFreeTrial
                ? 'Enable Clickbait Shield.'
                : 'Try out Clickbait Shield'}
            </Button>
          </>
        )}
      </div>
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
        className="relative mr-2 mt-1 font-normal"
        size={ButtonSize.XSmall}
        icon={
          clickbaitShieldEnabled ? (
            <ShieldCheckIcon className="text-status-success" />
          ) : (
            <ShieldIcon />
          )
        }
        iconSecondaryOnHover
        onClick={async () => {
          await fetchSmartTitle();
        }}
      >
        {clickbaitShieldEnabled
          ? 'Optimized title'
          : 'Clickbait Shield disabled'}
      </Button>
    </SimpleTooltip>
  );
};
