import React, { ReactElement, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { ModalTabs, ModalTabsProps } from './ModalTabs';
import { ModalClose } from './ModalClose';
import { ModalHeaderKind, ModalPropsContext } from './types';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { ArrowIcon } from '../../icons';
import { ModalStepsWrapper } from './ModalStepsWrapper';
import { ProgressBar } from '../../fields/ProgressBar';

export type ModalHeaderProps = {
  kind?: ModalHeaderKind;
  children?: ReactNode;
  className?: string;
  title?: string;
  showCloseButton?: boolean;
};

const headerKindToTitleClassName: Record<ModalHeaderKind, string> = {
  [ModalHeaderKind.Primary]: 'typo-title3',
  [ModalHeaderKind.Secondary]: 'typo-body',
  [ModalHeaderKind.Tertiary]: 'typo-callout text-theme-label-tertiary',
  [ModalHeaderKind.Quaternary]: 'typo-callout text-theme-label-tertiary',
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
}: ModalHeaderProps): ReactElement {
  const { activeView, onRequestClose, tabs, isDrawer } =
    useContext(ModalPropsContext);

  if (isDrawer) {
    return null;
  }

  const modalTitle = title ?? (tabs ? activeView : undefined);
  const shouldShowClose = showCloseButton && !!onRequestClose;

  return (
    <ModalHeaderOuter
      className={classNames(
        'relative h-14 items-center',
        (modalTitle || children) && 'border-b border-theme-divider-tertiary',
        className,
      )}
    >
      {shouldShowClose && (
        <Button
          size={ButtonSize.Small}
          className="mr-2 flex -rotate-90 tablet:hidden"
          icon={<ArrowIcon />}
          onClick={onRequestClose}
        />
      )}
      {children}
      {!!modalTitle && (
        <ModalHeaderTitle className={headerKindToTitleClassName[kind]}>
          {modalTitle}
        </ModalHeaderTitle>
      )}
      {shouldShowClose && (
        <ModalClose className="hidden tablet:flex" onClick={onRequestClose} />
      )}
    </ModalHeaderOuter>
  );
}

export function ModalHeaderTabs(props: ModalTabsProps): ReactElement {
  const { onRequestClose } = useContext(ModalPropsContext);
  return (
    <ModalHeaderOuter className="h-auto flex-col items-start gap-2 border-b border-theme-divider-tertiary tablet:h-14 tablet:flex-row tablet:items-center">
      {onRequestClose && (
        <Button
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

export function ModalHeaderSteps(props: ModalHeaderProps): ReactElement {
  const { activeView, steps } = useContext(ModalPropsContext);
  const activeStepIndex = steps.findIndex(({ key }) => activeView === key);
  const activeStep = steps[activeStepIndex];
  if (!activeStep) {
    return null;
  }
  const stepperWidth = () => ((activeStepIndex + 1) / steps.length) * 100;
  const progress = activeStep.hideProgress ? null : (
    <ProgressBar percentage={stepperWidth()} className="top-[3.3rem]" />
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
          previousStep && <ModalHeaderStepsButton onClick={previousStep} />
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
