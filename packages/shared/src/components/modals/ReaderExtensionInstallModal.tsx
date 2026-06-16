import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect } from 'react';
import { Modal } from './common/Modal';
import type { LazyModalCommonProps } from './common/Modal';
import { ModalKind, ModalSize } from './common/types';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ChromeIcon, EdgeIcon } from '../icons';
import { downloadBrowserExtension, isChrome } from '../../lib/constants';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetId } from '../../lib/log';
import { useSettingsContext } from '../../contexts/SettingsContext';

/**
 * Install nudge shown when a user tries to enable the reader (e.g. from the
 * appearance settings toggle) without the daily.dev extension installed. The
 * embedded reader needs the extension, so without it the only meaningful next
 * step is installing it — once installed, the permission grant happens inline.
 */
function ReaderExtensionInstallModal({
  isOpen,
  onRequestClose,
}: LazyModalCommonProps): ReactElement {
  const { logEvent } = useLogContext();
  const { updateFlags } = useSettingsContext();
  const isChromeBrowser = isChrome();
  const BrowserIcon = isChromeBrowser ? ChromeIcon : EdgeIcon;
  const browser = isChromeBrowser ? 'chrome' : 'edge';
  const installButtonLabel = isChromeBrowser
    ? 'Install Chrome extension'
    : 'Install Edge extension';

  useEffect(() => {
    logEvent({
      event_name: LogEvent.ImpressionReaderInstallPrompt,
      extra: JSON.stringify({ browser }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onInstallClick = (event: MouseEvent) => {
    logEvent({
      event_name: LogEvent.ClickReaderInstallExtension,
      extra: JSON.stringify({ browser }),
    });
    // Installing signals intent to read inside daily.dev, so enable it now
    // rather than waiting for a permission grant — the actual permission is
    // handled at the reader surface once the extension is present.
    updateFlags({
      legacyPostLayoutOptOut: false,
      readerInstallPromptAcknowledged: true,
    });
    logEvent({
      event_name: LogEvent.ToggleEmbeddedReader,
      target_id: TargetId.On,
    });
    onRequestClose(event);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Small}
    >
      <Modal.Body className="flex flex-col items-center gap-4 text-center">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
        >
          Read articles inside daily.dev
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="!mt-0 max-w-[24rem]"
        >
          Install the daily.dev browser extension to open articles inside
          daily.dev with the discussion right next to them.
        </Typography>
        <div className="mt-2 flex w-full max-w-[20rem] flex-col items-stretch gap-2">
          <Button
            tag="a"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            href={downloadBrowserExtension}
            target="_blank"
            rel="noopener noreferrer"
            icon={<BrowserIcon />}
            onClick={onInstallClick}
          >
            {installButtonLabel}
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            onClick={onRequestClose}
          >
            Maybe later
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ReaderExtensionInstallModal;
