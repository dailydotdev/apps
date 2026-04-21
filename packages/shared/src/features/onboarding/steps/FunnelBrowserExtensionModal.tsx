import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { FunnelStepBrowserExtensionModal } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { useLogContext } from '../../../contexts/LogContext';
import { useOnboardingExtension } from '../../../components/onboarding/Extension/useOnboardingExtension';
import { BrowserName } from '../../../lib/func';
import { cloudinaryOnboardingExtension } from '../../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { Button } from '../../../components/buttons/Button';
import { downloadBrowserExtension } from '../../../lib/constants';
import { ChromeIcon, EdgeIcon } from '../../../components/icons';
import { LogEvent, TargetType } from '../../../lib/log';
import { anchorDefaultRel } from '../../../lib/strings';
import { ButtonVariant } from '../../../components/buttons/common';
import { FunnelTargetId } from '../types/funnelEvents';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { sanitizeMessage } from '../lib/utils';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import { Modal } from '../../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../../components/modals/common/types';
import { ModalClose } from '../../../components/modals/common/ModalClose';

const BrowserExtensionModal = ({
  parameters: { headline, explainer },
  onTransition,
}: FunnelStepBrowserExtensionModal): ReactElement => {
  const { logEvent } = useLogContext();
  const { browserName } = useOnboardingExtension();
  const isEdge = browserName === BrowserName.Edge;
  const imageUrls =
    cloudinaryOnboardingExtension[
      browserName as keyof typeof cloudinaryOnboardingExtension
    ];

  const onSkip = () => onTransition?.({ type: FunnelStepTransitionType.Skip });

  return (
    <Modal
      isOpen
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Medium}
      onRequestClose={onSkip}
      shouldCloseOnOverlayClick
    >
      <ModalClose type="button" onClick={onSkip} right="3" top="3" />
      <div className="flex flex-col items-center gap-6 p-6 text-center">
        <figure className="pointer-events-none w-full">
          <img
            alt="Amazing daily.dev extension screenshot"
            className="w-full"
            loading="lazy"
            role="presentation"
            src={imageUrls.default}
            srcSet={`${imageUrls.default} 820w, ${imageUrls.retina} 1640w`}
          />
        </figure>
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.Title1}
          bold
          className="!px-0"
          dangerouslySetInnerHTML={{
            __html: sanitizeMessage(
              headline || 'Transform every new tab into a learning powerhouse',
            ),
          }}
        />
        <Typography
          className="text-balance text-text-tertiary typo-callout"
          color={TypographyColor.Secondary}
          tag={TypographyTag.H2}
          type={TypographyType.Callout}
          dangerouslySetInnerHTML={{
            __html: sanitizeMessage(
              explainer ||
                'Unlock the power of every new tab with daily.dev extension. Personalized feed, developer communities, AI search and more!',
            ),
          }}
        />
        <Button
          href={downloadBrowserExtension}
          icon={isEdge ? <EdgeIcon aria-hidden /> : <ChromeIcon aria-hidden />}
          data-funnel-track={FunnelTargetId.DownloadExtension}
          onClick={() => {
            logEvent({
              event_name: LogEvent.DownloadExtension,
              target_id: isEdge ? TargetType.Edge : TargetType.Chrome,
            });
            onTransition?.({
              type: FunnelStepTransitionType.Complete,
              details: { browserName },
            });
          }}
          rel={anchorDefaultRel}
          tag="a"
          target="_blank"
          variant={ButtonVariant.Primary}
        >
          <span>Get it for {isEdge ? 'Edge' : 'Chrome'}</span>
        </Button>
        <Button type="button" onClick={onSkip} variant={ButtonVariant.Tertiary}>
          Not now
        </Button>
      </div>
    </Modal>
  );
};

export const FunnelBrowserExtensionModal = withShouldSkipStepGuard(
  withIsActiveGuard(BrowserExtensionModal),
  () => {
    const { shouldShowExtensionOnboarding, isReady } = useOnboardingExtension();
    const router = useRouter();
    const redirectedFromExtension = router?.query?.r === 'extension';
    const shouldSkip =
      (!shouldShowExtensionOnboarding && isReady) || redirectedFromExtension;

    return { shouldSkip };
  },
);
