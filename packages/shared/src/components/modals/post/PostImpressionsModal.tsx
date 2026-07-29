import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '../common/Modal';
import type { LazyModalCommonProps } from '../common/Modal';
import { ModalClose } from '../common/ModalClose';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { AnalyticsIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { docs } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';

/**
 * X/Twitter-style "Views" explainer shown to non-authors when they tap the
 * impressions stat — daily.dev's own modal styling, X-like messaging.
 */
function PostImpressionsModal(props: LazyModalCommonProps): ReactElement {
  const { onRequestClose } = props;

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
      {...props}
    >
      <ModalClose top="2" right="2" onClick={onRequestClose} />
      <Modal.Body className="flex flex-col items-center gap-2 text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-primary">
          <AnalyticsIcon size={IconSize.Large} />
        </div>
        <Typography tag={TypographyTag.H2} type={TypographyType.Title2} bold>
          Impressions
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          The number of times this post was seen across daily.dev. To learn
          more, visit our{' '}
          <a
            className="font-bold text-text-link underline"
            href={docs}
            target="_blank"
            rel={anchorDefaultRel}
          >
            docs
          </a>
          .
        </Typography>
        <Button
          className="mt-4 w-full"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={onRequestClose}
        >
          Got it
        </Button>
      </Modal.Body>
    </Modal>
  );
}

export default PostImpressionsModal;
