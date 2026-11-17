import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ownArticle, PostPage } from '../../real/pages';
import type { ModalProps } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { boostDocsLink } from '@dailydotdev/shared/src/lib/constants';
import type { OwnPostState } from '../../flows/purchase/BoostFixed';
import stripArt from '../../assets/boost-strip-patchy-v2.png';
import { BoostStripCompact } from './BoostStrip';

// The first-boost screens around the boost form in the redesign's line: your
// own post with the boost strip, and the live screen with the rocket art.
// The form itself is BoostCompact.tsx.

/** The Patchy rocket, cropped to its left side where the art lives */
const RocketArt = ({ className }: { className?: string }) => (
  <div
    className={classNames(
      'relative overflow-hidden bg-gradient-to-r from-accent-cabbage-subtler to-transparent',
      className,
    )}
  >
    <img
      src={stripArt}
      alt=""
      className="pointer-events-none absolute inset-y-0 left-0 h-full w-auto max-w-none"
    />
  </div>
);

/** Your own article on the real post page, the strip where production puts it */
export const OwnPostRedesign = ({
  post,
  state,
  onBoost,
}: {
  post: Post;
  state: OwnPostState;
  onBoost: () => void;
}): ReactElement => {
  const [isDismissed, setDismissed] = useState(false);

  return (
    <PostPage
      post={ownArticle(post, state === 'new')}
      banner={
        !isDismissed && (
          <BoostStripCompact
            title={
              state === 'new' ? (
                <>
                  Boost to reach <strong>10k more devs</strong> now!
                </>
              ) : (
                <>
                  <strong>This post is taking off.</strong> Boost it now!
                </>
              )
            }
            onBoost={onBoost}
            onDismiss={() => setDismissed(true)}
          />
        )
      }
    />
  );
};

/** The success modal, with the rocket art in place of the cover image */
export const BoostLiveRedesign = ({
  onSeeBoost,
  onRequestClose,
  modalProps,
}: {
  onSeeBoost: () => void;
  onRequestClose: () => void;
  modalProps?: Pick<ModalProps, 'parentSelector' | 'bodyOpenClassName'>;
}): ReactElement => (
  <Modal
    {...modalProps}
    isOpen
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.Small}
    onRequestClose={onRequestClose}
    isDrawerOnMobile
  >
    <Modal.Body className="flex flex-col !p-0">
      <div className="relative">
        <RocketArt className="h-32 w-full rounded-t-16" />
        <ModalClose
          className="hidden tablet:flex"
          right="2"
          top="2"
          size={ButtonSize.Small}
          onClick={onRequestClose}
          variant={ButtonVariant.Tertiary}
        />
        <span className="absolute -bottom-6 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background-default bg-accent-blueCheese-default text-surface-invert">
          <VIcon size={IconSize.Medium} />
        </span>
      </div>
      <div className="flex flex-col items-center gap-2 px-5 pb-5 pt-9 text-center">
        <Typography type={TypographyType.Title3} bold>
          Boost is live!
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Your post is now reaching more developers. Find it any time in Boosts.
        </Typography>
        <Button
          variant={ButtonVariant.Primary}
          className="mt-3 w-full"
          onClick={onSeeBoost}
        >
          See your boost
        </Button>
        <Button
          variant={ButtonVariant.Tertiary}
          className="w-full"
          tag="a"
          href={boostDocsLink}
          target="_blank"
        >
          Learn more about boosting
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);
