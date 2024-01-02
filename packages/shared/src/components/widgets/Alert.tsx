import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import FeedbackIcon from '../icons/Feedback/index';
import AlertIcon from '../icons/Alert';
import CheckIcon from '../icons/V';
import classed from '../../lib/classed';
import { IconSize } from '../Icon';

type AlertPropObject<T> = Record<AlertType, T>;

export enum AlertType {
  Info = 'info',
  Error = 'error',
  Success = 'success',
}

const fontColor: AlertPropObject<string> = {
  info: 'text-theme-color-bun',
  error: 'text-theme-status-error',
  success: 'text-theme-status-success',
};

const borderColor: AlertPropObject<string> = {
  info: 'border-l-theme-color-bun',
  error: 'border-l-theme-status-error',
  success: 'border-l-theme-status-success',
};

const iconType: AlertPropObject<typeof FeedbackIcon> = {
  info: FeedbackIcon,
  error: AlertIcon,
  success: CheckIcon,
};

interface AlertProps {
  className?: string;
  title?: ReactNode;
  type?: AlertType;
  children?: ReactNode;
  flexDirection?: 'flex-col' | 'flex-row';
}

export const AlertParagraph = classed('p', 'typo-callout mt-3');

function Alert({
  className,
  title,
  children,
  type = AlertType.Info,
  flexDirection = 'flex-col',
}: AlertProps): ReactElement {
  const Icon = iconType[type];

  return (
    <div
      className={classNames(
        'flex border border-l-4 border-theme-active p-3',
        flexDirection,
        borderColor[type],
        children ? 'rounded-16' : 'rounded-12',
        className,
      )}
    >
      <span className="flex flex-row items-center">
        <Icon
          size={IconSize.Small}
          className={classNames('mr-2', fontColor[type])}
        />
        <span
          className={classNames(
            'flex flex-1 typo-callout',
            children && 'font-bold',
            children && fontColor[type],
          )}
        >
          {title}
        </span>
      </span>
      {children}
    </div>
  );
}

export default Alert;
