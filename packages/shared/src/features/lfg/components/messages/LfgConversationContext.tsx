import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import CloseButton from '../../../../components/CloseButton';
import { ButtonSize } from '../../../../components/buttons/Button';
import { IconSize } from '../../../../components/Icon';
import { ShieldWarningIcon } from '../../../../components/icons/ShieldWarning';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { lfgConversationPostQueryOptions } from '../../queries';
import { useLfgEnabled } from '../../hooks/useLfgEnabled';
import { getFirstName } from '../../lib/format';
import { LfgContextCard } from '../LfgContextCard';

// A chat that started from a reach-out says which post the two met on, with
// a safety note: strangers who just met are where repo-run scams start.
export const LfgConversationContext = ({
  peerId,
  peerName,
}: {
  peerId: string;
  peerName?: string;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const [isSafetyOpen, setSafetyOpen] = useState(true);
  const { data: post } = useQuery(
    lfgConversationPostQueryOptions(user, peerId, { enabled: isEnabled }),
  );

  if (!post) {
    return null;
  }

  return (
    <div className="mb-2 flex flex-col gap-2">
      <LfgContextCard
        post={post}
        label={
          post.author.id === user?.id
            ? 'You met through your post'
            : `You met through ${getFirstName(peerName)}'s post`
        }
      />
      {isSafetyOpen && (
        <div className="flex items-start gap-2 rounded-12 bg-surface-float px-3 py-2">
          <ShieldWarningIcon
            size={IconSize.Size16}
            className="mt-0.5 shrink-0 text-text-tertiary"
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="flex-1"
          >
            Never run code or install packages from someone you just met, and
            never pay to join a project. Report anything that feels off.
          </Typography>
          <CloseButton
            size={ButtonSize.XSmall}
            aria-label="Dismiss safety note"
            onClick={() => setSafetyOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
