import type { ReactElement } from 'react';
import React, { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { StreakRecoverModal } from '@dailydotdev/shared/src/components/modals/streaks/StreakRecoverModal';
import { StreakFreezePurchaseModal } from '@dailydotdev/shared/src/components/modals/streaks/StreakFreezePurchaseModal';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { UserStreakRecoverData } from '@dailydotdev/shared/src/graphql/users';
import { USER_STREAK_RECOVER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { publishTimeRelativeShort } from '@dailydotdev/shared/src/lib/dateFormat';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { realArticle, samPost } from '../../real/pages';
import type { AwardReceiver } from '../purchase/AwardRedesign';
import {
  AwardNoteRedesign,
  AwardPickerRedesign,
  AwardSentRedesign,
} from '../purchase/AwardRedesign';
import { BuyCoresRedesignModal } from '../purchase/BuyCoresRedesign';

// Where the wallet's award and streak tiles lead. An award always lands on
// someone's post, so the tile starts from what you read lately and then runs
// the award flow for its author. The streak tile restores a streak the day
// after it breaks and sells streak freezes on every other day.

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const readBy = (
  id: string,
  title: string,
  name: string,
  readHoursAgo: number,
): Post =>
  realArticle({
    id,
    title,
    titleHtml: undefined,
    image: cloudinaryPostImageCoverPlaceholder,
    createdAt: hoursAgo(readHoursAgo),
    author: {
      id: `sb-${id}-author`,
      name,
      username: name.toLowerCase().replace(' ', ''),
      image: fallbackImages.avatar,
      permalink: `https://app.daily.dev/${name.toLowerCase().replace(' ', '')}`,
    },
  } as Partial<Post>);

const recentReads: Post[] = [
  { ...samPost, createdAt: hoursAgo(2) },
  readBy(
    'sb-read-ido',
    'Type-safe env vars in every runtime',
    'Ido Kaplan',
    20,
  ),
  readBy(
    'sb-read-noa',
    'What I learned shipping a CLI in Rust',
    'Noa Levi',
    46,
  ),
  readBy('sb-read-maya', 'Designing APIs people enjoy', 'Maya Cohen', 70),
];

const RecentReadsPicker = ({
  onPick,
  onRequestClose,
}: {
  onPick: (post: Post) => void;
  onRequestClose: () => void;
}): ReactElement => (
  <Modal
    isOpen
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.Small}
    onRequestClose={onRequestClose}
    isDrawerOnMobile
  >
    <Modal.Header title="Pick a post to award" />
    <Modal.Body className="flex flex-col !gap-2">
      <span className="text-text-tertiary typo-callout">
        From what you read lately. The award goes to the post’s author.
      </span>
      <ul className="flex flex-col gap-2">
        {recentReads.map((post) => (
          <li key={post.id}>
            <button
              type="button"
              onClick={() => onPick(post)}
              className="flex w-full items-center gap-3 rounded-14 border border-border-subtlest-tertiary p-2 text-left transition-colors hover:bg-surface-hover"
            >
              <Image
                src={post.image}
                alt=""
                className="h-12 w-18 shrink-0 rounded-10 object-cover"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="line-clamp-2 font-bold typo-subhead">
                  {post.title}
                </span>
                <span className="flex min-w-0 items-center gap-1 text-text-tertiary typo-caption1">
                  <Image
                    src={post.author?.image}
                    alt=""
                    className="size-4 rounded-6"
                  />
                  <span className="truncate">{post.author?.name}</span>
                  <span aria-hidden>·</span>
                  <span className="whitespace-nowrap">
                    Read{' '}
                    {publishTimeRelativeShort(
                      new Date(post.createdAt ?? Date.now()),
                    )}
                  </span>
                </span>
              </span>
              <ArrowIcon
                size={IconSize.Small}
                className="shrink-0 rotate-90 text-text-quaternary"
              />
            </button>
          </li>
        ))}
      </ul>
    </Modal.Body>
  </Modal>
);

type AwardStep = 'posts' | 'pick' | 'buy' | 'note' | 'sent';

export const AwardTileFlow = ({
  onDone,
}: {
  onDone: () => void;
}): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const [step, setStep] = useState<AwardStep>('posts');
  const [receiver, setReceiver] = useState<AwardReceiver>();
  const [product, setProduct] = useState<Product>();
  const [bought, setBought] = useState(0);

  if (step === 'posts' || !receiver) {
    return (
      <RecentReadsPicker
        onPick={(post) => {
          setReceiver({
            name: post.author?.name ?? '',
            image: post.author?.image ?? fallbackImages.avatar,
          });
          setStep('pick');
        }}
        onRequestClose={onDone}
      />
    );
  }

  if (step === 'buy' && product) {
    return (
      <BuyCoresRedesignModal
        purpose="award"
        cost={product.value}
        product={product}
        onPay={(pack) => {
          if (user) {
            updateUser({
              ...user,
              balance: { amount: user.balance.amount + pack.value },
            });
          }
          setBought(pack.value);
          setStep('note');
        }}
        onRequestClose={() => setStep('pick')}
      />
    );
  }

  if (step === 'note' && product) {
    return (
      <AwardNoteRedesign
        product={product}
        coresAdded={bought}
        receiver={receiver}
        onBack={() => setStep('pick')}
        onSent={() => setStep('sent')}
        onRequestClose={onDone}
      />
    );
  }

  if (step === 'sent' && product) {
    return (
      <AwardSentRedesign
        product={product}
        receiver={receiver}
        onRequestClose={onDone}
      />
    );
  }

  return (
    <AwardPickerRedesign
      initialAward={product?.name}
      receiver={receiver}
      onBuyCores={(picked) => {
        setProduct(picked);
        setStep('buy');
      }}
      onPicked={(picked) => {
        setProduct(picked);
        setStep('note');
      }}
      onRequestClose={onDone}
    />
  );
};

/** Same key as production's useStreakRecover, so both read one answer */
export const useStreakRecoverState = (): UserStreakRecoverData | undefined => {
  const { user } = useAuthContext();
  const { data } = useQuery({
    queryKey: generateQueryKey(RequestKey.UserStreakRecover),
    queryFn: () =>
      gqlClient.request<{ streakRecover: UserStreakRecoverData }>(
        USER_STREAK_RECOVER_QUERY,
      ),
    enabled: !!user,
  });

  return data?.streakRecover;
};

export const StreakTileFlow = ({
  canRecover,
  onDone,
}: {
  canRecover: boolean;
  onDone: () => void;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const settings = useContext(SettingsContext);

  if (!user) {
    return null;
  }

  // Storybook's boot settings opt out of streaks and never count as loaded
  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        loadedSettings: true,
        optOutReadingStreak: false,
      }}
    >
      {canRecover ? (
        <StreakRecoverModal isOpen user={user} onRequestClose={onDone} />
      ) : (
        <StreakFreezePurchaseModal isOpen onRequestClose={onDone} />
      )}
    </SettingsContext.Provider>
  );
};
