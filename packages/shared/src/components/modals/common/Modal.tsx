import React, { ReactElement, useState } from 'react';
import ReactModal from 'react-modal';
import classNames from 'classnames';
import { ModalHeader } from './ModalHeader';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { ModalSidebar } from './ModalSidebar';
import {
  ModalKind,
  ModalPropsContext,
  ModalSize,
  ModalStep,
  ModalTabItem,
  modalTabTitle,
} from './types';
import classed from '../../../lib/classed';
import { ModalStepsWrapper } from './ModalStepsWrapper';

export interface ModalProps extends ReactModal.Props {
  children?: React.ReactNode;
  kind?: ModalKind;
  size?: ModalSize;
  tabs?: string[] | ModalTabItem[];
  steps?: ModalStep[];
  defaultView?: string;
  onViewChange?: (view: string) => void;
}

const modalKindToOverlayClassName: Record<ModalKind, string> = {
  [ModalKind.FixedCenter]: 'mobileL:justify-center pt-10 mobileL:pt-0',
  [ModalKind.FlexibleCenter]: 'justify-center',
  [ModalKind.FlexibleTop]: 'pt-10',
};
const modalKindAndSizeToOverlayClassName: Partial<
  Record<ModalKind, Partial<Record<ModalSize, string>>>
> = {
  [ModalKind.FlexibleTop]: {
    [ModalSize.Small]: 'mobileL:pt-20',
    [ModalSize.Medium]: 'mobileL:pt-14',
  },
};
const modalKindToClassName: Record<ModalKind, string> = {
  [ModalKind.FixedCenter]:
    'h-full max-h-[calc(100vh-2.5rem)] mobileL:h-[40rem] mobileL:max-h-[calc(100vh-5rem)]',
  [ModalKind.FlexibleCenter]:
    'mx-4 max-w-[calc(100vw-2rem)] max-h-[min(calc(100vh),40rem)] mobileL:max-h-[min(calc(100vh-5rem),40rem)]',
  [ModalKind.FlexibleTop]: 'max-h-full h-full mobileL:h-auto',
};
const modalKindAndSizeToClassName: Partial<
  Record<ModalKind, Partial<Record<ModalSize, string>>>
> = {
  [ModalKind.FlexibleTop]: {
    [ModalSize.Medium]:
      'mobileL:max-h-[calc(100vh-7.5rem)] max-h-[calc(100vh-2.5rem)] h-auto min-h-[25rem] mt-6',
    [ModalSize.Large]: 'laptop:mt-14 laptop:mb-10',
  },
};
const modalSizeToClassName: Record<ModalSize, string> = {
  [ModalSize.XSmall]: 'w-[21.25rem]',
  [ModalSize.Small]: 'w-[26.25rem]',
  [ModalSize.Medium]: 'w-[35rem]',
  [ModalSize.Large]: 'w-[63.75rem]',
};

export function Modal({
  defaultView,
  className,
  overlayClassName,
  children,
  kind = ModalKind.FlexibleCenter,
  size = ModalSize.Medium,
  onViewChange,
  onRequestClose,
  tabs,
  steps,
  ...props
}: ModalProps): ReactElement {
  const stepTitle = steps ? steps?.[0].key : undefined;
  const tabTitle = tabs ? modalTabTitle(tabs[0]) : undefined;
  const [activeView, setView] = useState<string | undefined>(
    defaultView ?? stepTitle ?? tabTitle,
  );
  const setActiveView = (view: string) => {
    if (onViewChange) onViewChange(view);
    setView(view);
  };
  const modalOverlayClassName = classNames(
    'overlay flex fixed flex-col inset-0 items-center bg-overlay-quaternary-onion z-[10]',
    modalKindAndSizeToOverlayClassName[kind]?.[size],
    modalKindToOverlayClassName[kind],
    overlayClassName,
  );
  const modalClassName = classNames(
    'modal flex flex-col relative focus:outline-none max-w-full items-center bg-theme-bg-tertiary shadow-2 border border-theme-divider-secondary rounded-16',
    modalKindToClassName[kind],
    modalSizeToClassName[size],
    modalKindAndSizeToClassName[kind]?.[size],
    className,
  );

  return (
    <ReactModal
      isOpen
      overlayClassName={modalOverlayClassName}
      onRequestClose={onRequestClose}
      className={modalClassName}
      {...props}
    >
      <ModalPropsContext.Provider
        value={{
          activeView,
          size,
          kind,
          onViewChange,
          onRequestClose,
          setActiveView,
          steps,
          tabs,
        }}
      >
        {children}
      </ModalPropsContext.Provider>
    </ReactModal>
  );
}

export const ModalTitle = classed(
  'h1',
  'typo-title1 font-bold text-center mb-4',
);
export const ModalSubtitle = classed('strong', 'typo-headline mb-2');
export const ModalText = classed('p', 'typo-callout text-theme-label-tertiary');

Modal.Size = ModalSize;
Modal.Kind = ModalKind;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Sidebar = ModalSidebar;
Modal.Subtitle = ModalSubtitle;
Modal.Text = ModalText;
Modal.Title = ModalTitle;
Modal.StepsWrapper = ModalStepsWrapper;
