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
import { Drawer } from '@dailydotdev/shared/src/components/drawers/Drawer';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { boostDocsLink } from '@dailydotdev/shared/src/lib/constants';
import type { OwnPostState } from '../../flows/purchase/BoostFixed';
import { boostStripArt as stripArt } from '../../assets/images';
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
                  Boost to reach <strong>more developers</strong> now!
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

interface BoostLiveProps {
  onSeeBoost: () => void;
  onRequestClose: () => void;
}

/** The rocket art, the check badge, the copy and the actions */
const BoostLiveBody = ({
  onSeeBoost,
  onRequestClose,
}: BoostLiveProps): ReactElement => (
  <>
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
      {/* On phones it's a drawer, closed from the bottom like the shared
          Drawer's Close button */}
      <Button
        variant={ButtonVariant.Float}
        className="mt-1 w-full tablet:hidden"
        onClick={onRequestClose}
      >
        Close
      </Button>
    </div>
  </>
);

/** The success modal, with the rocket art in place of the cover image. On
 * phones the Modal turns into a drawer by the window's width; `isDrawer` draws
 * the drawer directly, for a phone frame inside a wider window */
export const BoostLiveRedesign = ({
  onSeeBoost,
  onRequestClose,
  modalProps,
  isDrawer,
}: BoostLiveProps & {
  modalProps?: Pick<ModalProps, 'parentSelector' | 'bodyOpenClassName'>;
  isDrawer?: boolean;
}): ReactElement =>
  isDrawer ? (
    // The sheet sizes itself to the window's viewport; inside a phone frame
    // it fills the frame instead
    <Drawer isOpen onClose={onRequestClose} className={{ overlay: '!h-auto' }}>
      <BoostLiveBody onSeeBoost={onSeeBoost} onRequestClose={onRequestClose} />
    </Drawer>
  ) : (
    <Modal
      {...modalProps}
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <Modal.Body className="flex flex-col !p-0">
        <BoostLiveBody
          onSeeBoost={onSeeBoost}
          onRequestClose={onRequestClose}
        />
      </Modal.Body>
    </Modal>
  );
