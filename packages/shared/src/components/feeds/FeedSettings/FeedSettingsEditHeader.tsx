import { useRouter } from 'next/router';
import React, { ReactElement, useContext } from 'react';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import { webappUrl } from '../../../lib/constants';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Modal } from '../../modals/common/Modal';
import { ModalPropsContext } from '../../modals/common/types';
import { Typography, TypographyType } from '../../typography/Typography';
import { HashtagIcon } from '../../icons';
import { IconSize } from '../../Icon';

export const FeedSettingsEditHeader = (): ReactElement => {
  const router = useRouter();
  const { feed, onSubmit, onDiscard, isSubmitPending, isDirty } = useContext(
    FeedSettingsEditContext,
  );
  const { activeView, setActiveView } = useContext(ModalPropsContext);
  const isMobile = useViewSizeClient(ViewSize.MobileL);

  if (!activeView) {
    return null;
  }

  return (
    <Modal.Header
      title=""
      className="justify-between !p-4"
      showCloseButton={false}
    >
      {/* TODO AS-814 - feed icon and check if main feed for "My feed" */}
      <Typography
        className="hidden items-center justify-center gap-2 tablet:flex"
        type={TypographyType.Body}
        bold
      >
        <div>
          {feed.flags.icon ? (
            <Typography type={TypographyType.Title2}>
              {feed.flags.icon}
            </Typography>
          ) : (
            <HashtagIcon size={IconSize.Medium} />
          )}
        </div>
        {feed.flags.name || 'My feed'}
      </Typography>
      <div className="flex w-full justify-between gap-2 tablet:w-auto tablet:justify-start">
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={isMobile ? ButtonVariant.Tertiary : ButtonVariant.Float}
          onClick={async () => {
            const shouldDiscard = await onDiscard();

            if (!shouldDiscard) {
              return;
            }

            if (isMobile) {
              setActiveView(undefined);
            } else {
              router.push(`${webappUrl}feeds/${feed.id}`);
            }
          }}
        >
          {isMobile ? 'Cancel' : 'Discard'}
        </Button>
        <Button
          type="submit"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          loading={isSubmitPending}
          onClick={onSubmit}
          disabled={!isDirty}
        >
          Save
        </Button>
      </div>
    </Modal.Header>
  );
};
