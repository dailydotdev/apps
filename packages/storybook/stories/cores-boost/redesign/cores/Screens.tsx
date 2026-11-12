import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { bunPost, PostPage } from '../../real/pages';
import { BoostStripCompact } from '../purchase/BoostStrip';

// The Cores flow screens in the new look: on your own post, the nudge is the
// same one-row boost strip as the boost flow.
// The quest page and the award notification stay as production has them.

/** The real daily quests page (the quest card is production) */
export { QuestScreen } from '../../flows/cores/screens';

/** Your own post on the real post page, with the nudge where the strip goes */
export const OwnPostScreen = ({
  balance,
  onBoost,
  showNudge = true,
}: {
  balance: number;
  onBoost?: () => void;
  showNudge?: boolean;
}): ReactElement => {
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <PostPage
      post={bunPost}
      banner={
        showNudge &&
        !isDismissed && (
          <BoostStripCompact
            title={
              <>
                You have{' '}
                <strong className="tabular-nums">
                  <CoreIcon
                    size={IconSize.Size16}
                    className="mr-0.5 inline-block align-text-bottom"
                  />
                  {formatCoresCurrency(balance)} Cores
                </strong>
                , enough to boost this post
              </>
            }
            onBoost={() => onBoost?.()}
            onDismiss={() => setIsDismissed(true)}
          />
        )
      }
    />
  );
};
