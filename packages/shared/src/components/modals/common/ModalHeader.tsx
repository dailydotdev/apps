import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import { ShellSquare } from '../../shell/ShellSquare';
import { MiniCloseIcon, ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import classed from '../../../lib/classed';
import type { ModalTabsProps } from './ModalTabs';
import { ModalTabs } from './ModalTabs';
import { ModalClose } from './ModalClose';
import { ModalHeaderKind, ModalPropsContext } from './types';
import type { ButtonProps, IconType } from '../../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ModalStepsWrapper } from './ModalStepsWrapper';
import { ProgressBar } from '../../fields/ProgressBar';

export type ModalHeaderProps = {
  kind?: ModalHeaderKind;
  children?: ReactNode;
  className?: string;
  title?: string;
  showCloseButton?: boolean;
  // Replaces the phone's back chevron for modals that close rather than
  // go back (a gated sign-up).
  phoneCloseIcon?: IconType;
};

const headerKindToTitleClassName: Record<ModalHeaderKind, string> = {
  [ModalHeaderKind.Primary]: 'typo-title3',
  [ModalHeaderKind.Secondary]: 'typo-body',
  [ModalHeaderKind.Tertiary]: 'typo-callout text-text-tertiary',
  [ModalHeaderKind.Quaternary]: 'typo-callout text-text-tertiary',
};
const ModalHeaderTitle = classed('h3', 'font-bold');
const ModalHeaderOuter = classed('header', 'flex py-4 px-4 tablet:px-6 w-full');
const ModalHeaderSubtitle = classed('h3', 'font-bold typo-callout');

export function ModalHeader({
  kind = ModalHeaderKind.Primary,
  children,
  className,
  title,
  showCloseButton = true,
  phoneCloseIcon,
}: ModalHeaderProps): ReactElement | null {
  const {
    activeView,
    setActiveView,
    onRequestClose,
    tabs,
    isDrawer,
    isForm,
    isMobile,
  } = useContext(ModalPropsContext);

  if (isForm) {
    return null;
  }

  const modalTitle = title ?? (tabs ? activeView : undefined);
  const shouldShowClose = showCloseButton && !!onRequestClose;

  // In a sheet the header is the sheet's title row: the name at the left,
  // an X at the right for those who never swipe, pinned while the body
  // scrolls under it.
  if (isDrawer) {
    if (!modalTitle && !children) {
      return null;
    }

    return (
      <div
        className={classNames(
          'sticky top-0 z-2 -mx-4 mb-4 flex min-h-11 shrink-0 flex-row items-center gap-2 bg-background-default py-1 pl-4 pr-2',
          className,
        )}
      >
        {children}
        {!!modalTitle && (
          <h3 className="min-w-0 flex-1 truncate font-bold typo-title3">
            {modalTitle}
          </h3>
        )}
        {shouldShowClose && (
          <ShellSquare aria-label="Close" onClick={onRequestClose}>
            <MiniCloseIcon size={IconSize.Small} />
          </ShellSquare>
        )}
      </div>
    );
  }

  return (
    <ModalHeaderOuter
      className={classNames(
        'relative h-14 items-center',
        modalTitle || children
          ? 'border-b border-border-subtlest-tertiary'
          : undefined,
        className,
      )}
    >
      {shouldShowClose && (
        <Button
          type="button"
          size={ButtonSize.Small}
          className={classNames(
            'mr-2 flex tablet:hidden',
            !phoneCloseIcon && '-rotate-90',
          )}
          icon={phoneCloseIcon ?? <ArrowIcon />}
          aria-label={phoneCloseIcon ? 'Close' : 'Back'}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            if (isMobile && tabs && activeView) {
              setActiveView?.(undefined);
            } else {
              onRequestClose(event);
            }
          }}
        />
      )}
      {children}
      {!!modalTitle && (
        <ModalHeaderTitle
          className={classNames(
            headerKindToTitleClassName[kind],
            'flex-shrink truncate',
          )}
        >
          {modalTitle}
        </ModalHeaderTitle>
      )}
      {shouldShowClose && (
        <ModalClose
          type="button"
          className="hidden tablet:flex"
          onClick={onRequestClose}
        />
      )}
    </ModalHeaderOuter>
  );
}

export function ModalHeaderTabs(props: ModalTabsProps): ReactElement {
  const { onRequestClose } = useContext(ModalPropsContext);
  return (
    <ModalHeaderOuter className="h-auto flex-col items-start gap-2 border-b border-border-subtlest-tertiary tablet:h-14 tablet:flex-row tablet:items-center">
      {onRequestClose && (
        <Button
          type="button"
          size={ButtonSize.Small}
          className="flex -rotate-90 tablet:hidden"
          icon={<ArrowIcon />}
          onClick={onRequestClose}
        />
      )}
      <ModalTabs {...props} />
      {onRequestClose && <ModalClose onClick={onRequestClose} />}
    </ModalHeaderOuter>
  );
}

const ModalHeaderStepsButton = (props: ButtonProps<'button'>) => (
  <Button
    icon={<ArrowIcon className="-rotate-90" />}
    className="-ml-2 mr-2"
    variant={ButtonVariant.Tertiary}
    {...props}
  />
);

export function ModalHeaderSteps(props: ModalHeaderProps): ReactElement | null {
  const { activeView, steps = [] } = useContext(ModalPropsContext);
  const activeStepIndex = steps.findIndex(({ key }) => activeView === key);
  const activeStep = steps[activeStepIndex];
  if (!activeStep) {
    return null;
  }
  const stepperWidth = () => ((activeStepIndex + 1) / steps.length) * 100;
  const progress = activeStep.hideProgress ? null : (
    <ProgressBar
      percentage={stepperWidth()}
      className={{ bar: 'absolute left-1 top-[3.3rem] h-1' }}
    />
  );
  if (activeStep.title) {
    return (
      <ModalHeader {...props}>
        {activeStep.title}
        {progress}
      </ModalHeader>
    );
  }
  return (
    <ModalHeader {...props}>
      <ModalStepsWrapper>
        {({ previousStep }) =>
          previousStep ? (
            <ModalHeaderStepsButton onClick={previousStep} />
          ) : null
        }
      </ModalStepsWrapper>
      <ModalHeaderSubtitle>{activeView}</ModalHeaderSubtitle>
      {progress}
    </ModalHeader>
  );
}

ModalHeader.Title = ModalHeaderTitle;
ModalHeader.Subtitle = ModalHeaderSubtitle;
ModalHeader.Tabs = ModalHeaderTabs;
ModalHeader.Steps = ModalHeaderSteps;
ModalHeader.StepsButton = ModalHeaderStepsButton;
