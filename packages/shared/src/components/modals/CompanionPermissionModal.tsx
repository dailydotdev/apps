import type { ReactElement } from 'react';
import React from 'react';
import type { LazyModalCommonProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalHeader } from './common/ModalHeader';
import { ModalBody } from './common/ModalBody';
import { ModalSize } from './common/types';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ClickableText } from '../buttons/ClickableText';
import { PlayIcon } from '../icons';
import { IconSize } from '../Icon';
import { Typography, TypographyType } from '../typography/Typography';
import { useExtensionContext } from '../../contexts/ExtensionContext';
import { companionExplainerVideo } from '../../lib/constants';

export interface CompanionPermissionModalProps extends LazyModalCommonProps {
  /**
   * Fires after the user explicitly opts in via the Activate button. Use it
   * to flip the underlying setting — we never flip it eagerly because the
   * modal exists precisely to gate the permission request behind consent.
   */
  onActivated?: () => void;
}

/**
 * Confirmation modal for enabling the Companion. Renders the same value
 * proposition as the legacy in-tab tooltip (preview thumbnail + explainer
 * link + "Activate companion" button) but uses our standard Modal shell so
 * it works as a real consent step instead of a passive popover.
 *
 * Activation only flips the user's setting (via `onActivated`) when they
 * click the primary button — closing the modal without confirming leaves
 * the toggle in its current state. This is the legal & UX-safe shape for a
 * permission request: nothing happens behind the user's back.
 */
export const CompanionPermissionModal = ({
  isOpen,
  onRequestClose,
  onActivated,
}: CompanionPermissionModalProps): ReactElement => {
  const { requestContentScripts } = useExtensionContext();

  const handleActivate = async (event: React.MouseEvent) => {
    if (requestContentScripts) {
      const granted = await requestContentScripts({
        origin: 'companion permission modal',
      });
      // Only mark the setting as opted-in when Chrome actually granted the
      // permission. If the user dismissed Chrome's prompt we leave the
      // toggle off so the next click re-prompts cleanly.
      if (!granted) {
        onRequestClose(event);
        return;
      }
    }
    onActivated?.();
    onRequestClose(event);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      size={ModalSize.Small}
      isDrawerOnMobile={isOpen}
      drawerProps={{
        title: 'Try the companion',
        className: {
          title: '!block text-center border-transparent !typo-title2 pb-2',
        },
      }}
    >
      <ModalHeader title="Try the companion" />
      <ModalBody className="flex flex-col gap-4">
        <Typography type={TypographyType.Callout}>
          The companion floats on top of any article you open so you can upvote,
          bookmark and discuss without leaving the page. We&apos;ll ask Chrome
          for one extra permission so it can show up there.
        </Typography>

        <a
          target="_blank"
          rel="noopener noreferrer"
          href={companionExplainerVideo}
          className="relative mx-auto flex w-full max-w-[18rem] items-center justify-center"
        >
          <img
            src="https://media.daily.dev/image/upload/v1655218347/public/companion_preview_v2.png"
            alt="Companion preview"
            className="aspect-[180/110] w-full rounded-10 object-cover"
          />
          <PlayIcon
            secondary
            className="absolute text-white"
            size={IconSize.XLarge}
          />
        </a>
        <ClickableText
          tag="a"
          target="_blank"
          rel="noopener noreferrer"
          defaultTypo={false}
          href={companionExplainerVideo}
          className="mx-auto"
          textClassName="text-accent-cabbage-default typo-footnote"
        >
          Watch the overview
        </ClickableText>

        <div className="flex flex-col-reverse gap-2 pt-1 tablet:flex-row tablet:justify-end">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={onRequestClose}
          >
            Maybe later
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={handleActivate}
          >
            Activate companion
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CompanionPermissionModal;
