import React, { MutableRefObject, ReactElement } from 'react';
import { BaseTooltip } from './BaseTooltip';
import { Button } from '../buttons/Button';
import { ModalClose } from '../modals/common/ModalClose';
import classed from '../../lib/classed';
import styles from './ChangelogTooltip.module.css';

interface ChangelogTooltipProps<TRef> {
  visible: boolean;
  elementRef: MutableRefObject<TRef>;
  onRequestClose?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
}

const ChangelogTooltipContainer = classed(
  'div',
  'changelog flex flex-col relative focus:outline-none items-center bg-theme-bg-tertiary shadow-2 border border-theme-color-cabbage rounded-16',
);
const ChangelogTooltipHeader = classed(
  'header',
  'flex items-center px-4 py-3 w-full ',
);
const ChangelogTooltipBody = classed(
  'section',
  'overflow-auto relative w-full h-full shrink max-h-full p-5',
);
const ChangelogTooltipFooter = classed(
  'footer',
  'flex gap-3 items-center px-4 py-3 w-full h-16 border-t border-theme-divider-tertiary',
);

function ChangelogTooltip<TRef extends HTMLElement>({
  visible,
  elementRef,
  onRequestClose,
}: ChangelogTooltipProps<TRef>): ReactElement {
  // TODO WT-1054-changelog test extension
  const isExtension = true; // !!process.env.TARGET_BROWSER;

  return (
    <BaseTooltip
      content={
        <ChangelogTooltipContainer>
          <ChangelogTooltipHeader className="border-b border-theme-divider-tertiary">
            <Button className="bg-water-40 btn-primary small text-theme-label-secondary">
              New release
            </Button>
            {onRequestClose && <ModalClose onClick={onRequestClose} />}
          </ChangelogTooltipHeader>
          <ChangelogTooltipBody>Release article here</ChangelogTooltipBody>
          <ChangelogTooltipFooter>
            <Button className="btn-tertiary">Release notes</Button>
            {isExtension && (
              <Button className="bg-cabbage-40 btn-primary">
                Update extension
              </Button>
            )}
          </ChangelogTooltipFooter>
        </ChangelogTooltipContainer>
      }
      offset={[6 * 16, 2.5 * 16]}
      interactive
      container={{
        className: 'shadow',
        paddingClassName: 'p-0',
        roundedClassName: 'rounded-16',
        bgClassName: 'bg-cabbage-40',
        arrowClassName: styles.changelogTooltipArrow,
      }}
      reference={elementRef}
      arrow
      placement="right-end"
      visible={visible}
    />
  );
}

export default ChangelogTooltip;
