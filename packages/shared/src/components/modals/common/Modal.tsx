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
import { LogEvent } from '../../../lib/log';
import { useViewSize, ViewSize } from '../../../hooks';
import { Drawer, DrawerOnMobileProps } from '../../drawers';
import { FormWrapper, FormWrapperProps } from '../../fields/form';
import ConditionalWrapper from '../../ConditionalWrapper';

export interface ModalProps extends ReactModal.Props, DrawerOnMobileProps {
  children?: React.ReactNode;
  kind?: ModalKind;
  size?: ModalSize;
  tabs?: string[] | ModalTabItem[];
  steps?: ModalStep[];
  defaultView?: string;
  onViewChange?: (view: string) => void;
  onLogNext?: LogEvent;
  onLogPrev?: LogEvent;
  isDrawerOnMobile?: boolean;
  formProps?: Omit<FormWrapperProps, 'children'>;
}

export type LazyModalCommonProps = Pick<
  ModalProps,
  'isOpen' | 'onRequestClose' | 'parentSelector' | 'onAfterClose'
> & { onRequestClose: (e?: React.MouseEvent | React.KeyboardEvent) => void };

const modalKindToOverlayClassName: Record<ModalKind, string> = {
  [ModalKind.FixedCenter]: 'tablet:justify-center',
  [ModalKind.FlexibleCenter]: 'justify-center',
  [ModalKind.FlexibleTop]: '',
  [ModalKind.FixedBottom]: 'justify-end',
};
const modalKindAndSizeToOverlayClassName: Partial<
  Record<ModalKind, Partial<Record<ModalSize, string>>>
> = {
  [ModalKind.FlexibleTop]: {
    [ModalSize.Small]: 'tablet:pt-20',
    [ModalSize.Medium]: 'tablet:pt-20',
  },
};
const modalKindToClassName: Record<ModalKind, string> = {
  [ModalKind.FixedCenter]: 'tablet:h-[40rem] tablet:max-h-[calc(100vh-5rem)]',
  [ModalKind.FlexibleCenter]:
    'tablet:mx-4 max-w-[calc(100vw-2rem)] tablet:max-h-[min(calc(100vh-5rem),40rem)]',
  [ModalKind.FlexibleTop]: '',
  [ModalKind.FixedBottom]: 'rounded-b-none max-h-[34.75rem]',
};
const modalKindAndSizeToClassName: Partial<
  Record<ModalKind, Partial<Record<ModalSize, string>>>
> = {
  [ModalKind.FlexibleTop]: {
    [ModalSize.XSmall]: 'laptop:mt-16 laptop:mb-10',
    [ModalSize.Medium]: 'min-h-[25rem] tablet:max-h-[calc(100vh-10rem)]',
    [ModalSize.Large]: 'laptop:mt-16 laptop:mb-10',
    [ModalSize.XLarge]: 'laptop:mt-16 laptop:mb-10',
  },
};
export const modalSizeToClassName: Record<ModalSize, string> = {
  [ModalSize.XSmall]: 'tablet:w-[21.25rem]',
  [ModalSize.Small]: 'tablet:w-[26.25rem]',
  [ModalSize.Medium]: 'tablet:w-[35rem]',
  [ModalSize.Large]: 'tablet:w-[42.5rem]',
  [ModalSize.XLarge]: 'tablet:w-[63.75rem]',
};

export function Modal({
  defaultView,
  className,
  overlayClassName,
  children,
  kind = ModalKind.FlexibleCenter,
  size = ModalSize.Medium,
  onViewChange,
  onLogNext,
  onLogPrev,
  onRequestClose,
  tabs,
  steps,
  isDrawerOnMobile,
  drawerProps,
  shouldCloseOnOverlayClick,
  formProps,
  ...props
}: ModalProps): ReactElement {
  const stepTitle = steps ? steps?.[0].key : undefined;
  const tabTitle = tabs ? modalTabTitle(tabs[0]) : undefined;
  const isMobile = useViewSize(ViewSize.MobileL);
  const isDrawerOpen = isDrawerOnMobile && isMobile;
  const isForm = formProps && isMobile;
  const [activeView, setView] = useState<string | undefined>(
    isMobile && tabs ? defaultView : defaultView ?? stepTitle ?? tabTitle,
  );
  const setActiveView = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
    setView(view);
  };

  const content = (
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
        onLogNext,
        onLogPrev,
        isDrawer: isDrawerOpen,
        isForm,
        isMobile,
      }}
    >
      <ConditionalWrapper
        condition={isForm}
        wrapper={(component) => (
          <FormWrapper
            {...formProps}
            leftButtonProps={{
              ...(formProps.leftButtonProps ?? {}),
              onClick: onRequestClose,
            }}
          >
            {component}
          </FormWrapper>
        )}
      >
        {children}
      </ConditionalWrapper>
    </ModalPropsContext.Provider>
  );

  if (isDrawerOpen) {
    return (
      <Drawer
        displayCloseButton
        {...drawerProps}
        isOpen
        onClose={() => {
          if (onRequestClose) {
            onRequestClose(null);
          }

          if (props.onAfterClose) {
            props.onAfterClose();
          }
        }}
        closeOnOutsideClick={shouldCloseOnOverlayClick}
      >
        {content}
      </Drawer>
    );
  }

  const modalOverlayClassName = classNames(
    'overlay fixed inset-0 z-modal flex flex-col items-center bg-overlay-quaternary-onion',
    modalKindAndSizeToOverlayClassName[kind]?.[size],
    modalKindToOverlayClassName[kind],
    overlayClassName,
  );
  const modalClassName = classNames(
    'modal relative flex max-w-full flex-col items-center border-border-subtlest-secondary bg-background-default antialiased shadow-2 focus:outline-none tablet:border tablet:bg-accent-pepper-subtlest',
    'h-full w-full tablet:h-auto tablet:rounded-16',
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
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      {...props}
    >
      {content}
    </ReactModal>
  );
}

export const ModalTitle = classed('h1', 'typo-title1 font-bold text-center');
export const ModalSubtitle = classed('strong', 'typo-body font-bold');
export const ModalText = classed('p', 'typo-callout text-text-tertiary');

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
