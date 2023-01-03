import React, { ReactElement, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { ModalTabs, ModalTabsProps } from './ModalTabs';
import { ModalClose } from './ModalClose';
import { ModalPropsContext } from './types';
import { Button, ButtonProps } from '../../buttons/Button';
import ArrowIcon from '../../icons/Arrow';
import { ModalStepsWrapper } from './ModalStepsWrapper';

export type ModalHeaderProps = {
  children?: ReactNode;
  className?: string;
  title?: string;
};

const ModalHeaderTitle = classed('h3', 'font-bold typo-title3');
const ModalHeaderOuter = classed(
  'header',
  'flex items-center py-4 px-6 w-full h-14',
);
const ModalHeaderSubtitle = classed('h3', 'font-bold typo-callout');

export function ModalHeader({
  children,
  className,
  title,
}: ModalHeaderProps): ReactElement {
  const { activeView, onRequestClose, tabs } = useContext(ModalPropsContext);
  const modalTitle = title ?? (tabs ? activeView : undefined);
  return (
    <ModalHeaderOuter
      className={classNames(
        (modalTitle || children) && 'border-b border-theme-divider-tertiary',
        className,
      )}
    >
      {children}
      {!!modalTitle && <ModalHeaderTitle>{modalTitle}</ModalHeaderTitle>}
      {onRequestClose && <ModalClose onClick={onRequestClose} />}
    </ModalHeaderOuter>
  );
}

export function ModalHeaderTabs(props: ModalTabsProps): ReactElement {
  const { onRequestClose } = useContext(ModalPropsContext);
  return (
    <ModalHeaderOuter className="border-b border-theme-divider-tertiary">
      <ModalTabs {...props} />
      {onRequestClose && <ModalClose onClick={onRequestClose} />}
    </ModalHeaderOuter>
  );
}

const ModalHeaderStepsButton = (props: ButtonProps<'button'>) => (
  <Button
    icon={<ArrowIcon className="-rotate-90" />}
    className="flex justify-center items-center mr-2 -ml-2 btn btn-tertiary iconOnly"
    {...props}
  />
);

export function ModalHeaderSteps(props: ModalHeaderProps): ReactElement {
  const { activeView, steps } = useContext(ModalPropsContext);
  const activeStepIndex = steps.findIndex(({ key }) => activeView === key);
  const activeStep = steps[activeStepIndex];
  if (!activeStep) return null;
  const stepperWidth = () => ((activeStepIndex + 1) / steps.length) * 100;
  const progress = activeStep.hideProgress ? null : (
    <div
      className="absolute left-0 h-1 top-[3.3rem] bg-theme-color-cabbage transition-[width]"
      style={{ width: `${stepperWidth()}%` }}
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
