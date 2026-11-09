import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { mocked } from 'storybook/test';
import mockedRouter, { useRouter } from 'next/router';
import type { Paddle } from '@paddle/paddle-js';
import GiveAwardModal from '@dailydotdev/shared/src/components/modals/award/GiveAwardModal';
import { BuyCoresProcessing } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import type {
  BuyCoresContextData,
  Screens,
} from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import { BuyCoresContext } from '@dailydotdev/shared/src/contexts/BuyCoresContext/types';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Origin } from '@dailydotdev/shared/src/lib/log';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { noop } from '../real/providers';
import { awards } from '../real/catalog';
import { PostPage, samPost } from '../real/pages';

// Production screens the Today stories show, shared with the Redesign stories
// for the steps the redesign leaves as they are.

const awardOf = (name: string) =>
  awards.find((product) => product.name === name) as Product;
export const coffee = awardOf('Coffee Mug');

export const samReceiver = {
  id: 'sb-sam',
  name: 'Sam Rivera',
  username: 'samrivera',
  image: fallbackImages.avatar,
};

export const routeTo = (
  pathname: string,
  query: Record<string, string> = {},
) => {
  const search = new URLSearchParams(query).toString();

  mocked(useRouter).mockReturnValue({
    ...mockedRouter,
    isReady: true,
    pathname,
    asPath: search ? `${pathname}?${search}` : pathname,
    query,
  } as never);
};

/** Clicks through production UI to reach a state it only opens on clicks */
export const ClickThrough = ({
  targets,
}: {
  targets: (() => HTMLElement | null | undefined)[];
}): null => {
  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      const target = targets[index]?.();

      if (!target) {
        return;
      }

      target.click();
      index += 1;

      if (index >= targets.length) {
        window.clearInterval(timer);
      }
    }, 300);

    return () => window.clearInterval(timer);
  }, [targets]);

  return null;
};

export const awardTile = (name: string) => () =>
  document
    .querySelector<HTMLElement>(`[role="dialog"] img[alt="${name}"]`)
    ?.closest('button');

export const buttonWith = (text: string) => () =>
  [...document.querySelectorAll<HTMLElement>('[role="dialog"] button')].find(
    (button) => button.textContent?.includes(text),
  );

/** Production BuyCoresProcessing at a step: processing, timeout, completed */
export const Processing = ({
  step,
  origin,
  cores,
}: {
  step: Screens;
  origin: Origin;
  cores: number;
}): ReactElement => {
  const context: BuyCoresContextData = {
    paddle: {} as Paddle,
    activeStep: step,
    setActiveStep: noop,
    selectedProduct: { id: 'sb-pack', value: cores },
    setSelectedProduct: noop,
    onCompletion: noop,
    origin,
    error:
      step === 'PROCESSING_ERROR'
        ? {
            title: 'Processing timed out',
            description:
              'Please check the status of your transaction in your Core Wallet.',
          }
        : undefined,
  };

  return (
    <BuyCoresContext.Provider value={context}>
      <BuyCoresProcessing isOpen onRequestClose={noop} />
    </BuyCoresContext.Provider>
  );
};

type AwardReceiver = typeof samReceiver;

/** Production GiveAwardModal on a post, without the page behind it */
export const GiveAwardOnPost = ({
  post = samPost,
  receiver = samReceiver,
  onRequestClose = noop,
}: {
  post?: Post;
  receiver?: AwardReceiver;
  onRequestClose?: () => void;
}): ReactElement => (
  <GiveAwardModal
    isOpen
    onRequestClose={onRequestClose}
    type="POST"
    post={post}
    entity={{ id: post.id, receiver, numAwards: 0 }}
  />
);

/**
 * Production's award picker, where picking an award you can afford, or Buy
 * Cores, hands over to the caller's own note and Buy Cores screens.
 */
export const ProductionAwardPicker = ({
  post,
  receiver,
  balance,
  onPicked,
  onBuyCores,
  onRequestClose,
}: {
  post?: Post;
  receiver?: AwardReceiver;
  balance: number;
  onPicked: (product: Product) => void;
  onBuyCores: (product: Product) => void;
  onRequestClose?: () => void;
}): ReactElement => {
  const [picked, setPicked] = useState<Product>();

  const onClickCapture = (event: React.MouseEvent) => {
    const button = (event.target as HTMLElement).closest('button');
    const award = awardOf(button?.querySelector('img')?.alt ?? '');

    if (award) {
      setPicked(award);

      if (award.value <= balance) {
        event.stopPropagation();
        onPicked(award);
      }
      return;
    }

    if (picked && button?.textContent?.startsWith('Buy Cores')) {
      event.stopPropagation();
      onBuyCores(picked);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div onClickCapture={onClickCapture}>
      <GiveAwardOnPost
        post={post}
        receiver={receiver}
        onRequestClose={onRequestClose}
      />
    </div>
  );
};

/**
 * Production's award sent screen, reached by sending through the modal. The
 * caller has already paid for the award, so the balance covers it again while
 * the modal sends, and goes back once the success screen shows.
 */
export const ProductionAwardSent = ({
  post,
  receiver,
  product,
  onRequestClose,
}: {
  post?: Post;
  receiver?: AwardReceiver;
  product: Product;
  onRequestClose?: () => void;
}): ReactElement => {
  const { user, updateUser } = useAuthContext();
  const [paid] = useState(() => user?.balance.amount ?? 0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user) {
      updateUser({ ...user, balance: { amount: paid + product.value } });
    }
    setIsReady(true);
    const timer = window.setInterval(() => {
      if (
        document
          .querySelector('[role="dialog"]')
          ?.textContent?.includes('Congrats')
      ) {
        window.clearInterval(timer);
        if (user) {
          updateUser({ ...user, balance: { amount: paid } });
        }
      }
    }, 200);
    return () => window.clearInterval(timer);
    // Once: top up, then settle back after the send
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <GiveAwardOnPost
        post={post}
        receiver={receiver}
        onRequestClose={onRequestClose}
      />
      {isReady && (
        <ClickThrough
          targets={[awardTile(product.name), buttonWith('Send Award')]}
        />
      )}
    </>
  );
};

export const AwardModal = ({
  children,
}: {
  children?: ReactNode;
}): ReactElement => (
  <>
    <PostPage post={samPost} />
    <GiveAwardOnPost />
    {children}
  </>
);
