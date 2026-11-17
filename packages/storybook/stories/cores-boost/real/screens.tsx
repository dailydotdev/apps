import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import GiveAwardModal from '@dailydotdev/shared/src/components/modals/award/GiveAwardModal';
import { BuyCoresModal } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import { BoostPostModal } from '@dailydotdev/shared/src/features/boost/BoostPostModal';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { awards } from './catalog';

// Production components, mounted as the app mounts them. Only the data and
// the providers around them are stand-ins (see providers.tsx, handlers.ts).

/** Reopens a closed modal, so a reviewer can walk the flow again */
const Reopen = ({
  label,
  children,
}: {
  label: string;
  children: (close: () => void) => ReactNode;
}): ReactElement => {
  // react-modal binds to #__next, so open once that element is in the DOM
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => setIsOpen(true), []);

  return (
    <div id="__next" className="min-h-screen bg-background-default p-6">
      {!isOpen && (
        <Button variant={ButtonVariant.Primary} onClick={() => setIsOpen(true)}>
          {label}
        </Button>
      )}
      {isOpen && children(() => setIsOpen(false))}
    </div>
  );
};

const receiver = {
  id: 'sb-sam',
  name: 'Sam Rivera',
  username: 'samrivera',
  image: fallbackImages.avatar,
};

export const GiveAwardScreen = ({
  numAwards = 0,
}: {
  numAwards?: number;
}): ReactElement => (
  <Reopen label="Give an award">
    {(close) => (
      <GiveAwardModal
        isOpen
        onRequestClose={close}
        type="POST"
        entity={{ id: 'sb-post', receiver, numAwards }}
      />
    )}
  </Reopen>
);

export const BuyCoresScreen = ({
  origin = Origin.Award,
  awardName,
  minCoresToBuy,
}: {
  origin?: Origin;
  awardName?: string;
  minCoresToBuy?: number;
}): ReactElement => (
  <Reopen label="Buy Cores">
    {(close) => (
      <BuyCoresModal
        isOpen
        onRequestClose={close}
        onCompletion={close}
        origin={origin}
        product={awards.find((award) => award.name === awardName)}
        minCoresToBuy={minCoresToBuy}
      />
    )}
  </Reopen>
);

const createdAt = '2026-11-01T09:00:00.000Z';

export const boostablePost = {
  id: 'sb-boost-post',
  type: PostType.Article,
  title: 'How we cut our CI time in half with remote caching',
  image: cloudinaryPostImageCoverPlaceholder,
  createdAt,
  tags: ['ci', 'devops', 'monorepo'],
  source: {
    id: 'sb-user-source',
    type: SourceType.User,
    name: 'Dev Dana',
    handle: 'devdana',
    image: fallbackImages.avatar,
  },
  flags: {},
} as unknown as Post;

export const squadPost = {
  ...boostablePost,
  id: 'sb-squad-post',
  source: {
    id: 'sb-squad',
    type: SourceType.Squad,
    name: 'Platform Guild',
    handle: 'platformguild',
    image: fallbackImages.avatar,
  },
} as unknown as Post;

export const BoostPostScreen = ({
  post = boostablePost,
}: {
  post?: Post;
}): ReactElement => (
  <Reopen label="Boost post">
    {(close) => (
      <BoostPostModal
        isOpen
        onRequestClose={close}
        post={post}
        origin={Origin.PostBoostButton}
      />
    )}
  </Reopen>
);
