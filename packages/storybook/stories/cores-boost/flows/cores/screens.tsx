import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  pageBorders,
  pageContainerClassNames,
} from '@dailydotdev/shared/src/components/utilities/common';
import SquadPostAuthor from '@dailydotdev/shared/src/components/post/SquadPostAuthor';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import type { Author } from '@dailydotdev/shared/src/graphql/comments';
import { viewer } from '../../real/providers';
import { GatedQuestCard } from './GatedEntryPoints';
import { CoresNudgeStrip } from './CoresNudgeStrip';
import { ownPost, readQuest } from './fixtures';
import { useAnimateCores } from './Shell';
import { AwardNotificationRow } from './AwardNotification';

// Screens the Cores flow stories share, inside the story Shell.

const popoverClass =
  'flex w-full max-w-[26rem] flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4';

/** The quest dropdown with today's claimable quest */
export const QuestScreen = ({
  isClaimed: initiallyClaimed = false,
  onClaimed,
}: {
  isClaimed?: boolean;
  onClaimed?: () => void;
}): ReactElement => {
  const animateCores = useAnimateCores();
  const [isClaimed, setIsClaimed] = useState(initiallyClaimed);
  const reward =
    readQuest.rewards.find(({ type }) => type === 'cores')?.amount ?? 0;

  return (
    <div className="flex justify-end p-4">
      <div className={popoverClass}>
        <h4 className="font-bold text-text-primary typo-callout">
          Daily quests
        </h4>
        <GatedQuestCard
          quest={readQuest}
          isClaimed={isClaimed}
          onClaim={() => {
            setIsClaimed(true);
            animateCores(reward);
            window.setTimeout(() => onClaimed?.(), 1400);
          }}
        />
      </div>
    </div>
  );
};

const author = {
  id: viewer.id,
  name: viewer.name,
  username: viewer.username,
  image: viewer.image,
  permalink: viewer.permalink,
} as Author;

/** Your own post, laid out like the post page column (SquadPostContent) */
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
    <div className="mx-auto flex w-full max-w-[42.5rem] flex-col px-4 pt-6 tablet:px-6 laptop:px-8">
      <SquadPostAuthor
        author={author}
        date={new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()}
        size={ProfileImageSize.Large}
        className={{ container: 'mb-4' }}
      />
      {showNudge && !isDismissed && (
        <CoresNudgeStrip
          balance={balance}
          onBoost={() => onBoost?.()}
          onClose={() => setIsDismissed(true)}
          className="mb-6"
        />
      )}
      <h1 className="mb-6 text-balance break-words font-bold typo-large-title">
        {ownPost.title}
      </h1>
      <Image
        type={ImageType.Post}
        src={ownPost.image}
        alt={ownPost.title}
        className="w-full rounded-16 object-cover"
      />
    </div>
  );
};

/** The notifications page column (webapp NotificationsFeed), today's group */
export const NotificationsScreen = ({
  onViewWallet,
}: {
  onViewWallet?: () => void;
}): ReactElement => (
  <main className={classNames(pageBorders, pageContainerClassNames, 'pb-12')}>
    <div className="hidden items-center justify-between px-4 pb-2 pt-4 tablet:flex">
      <h2 className="font-bold typo-body">Notifications</h2>
    </div>
    <section>
      <h3 className="px-4 pb-1 pt-6 font-bold text-text-tertiary typo-footnote first:pt-4">
        Today
      </h3>
      <AwardNotificationRow onViewWallet={onViewWallet} />
    </section>
  </main>
);
