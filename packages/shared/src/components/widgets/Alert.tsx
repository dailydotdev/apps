import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import FeedbackIcon from '../icons/Feedback/index';
import AlertIcon from '../icons/Alert';
import classed from '../../lib/classed';

type AlertPropObject<T> = Record<AlertType, T>;

export enum AlertType {
  Info = 'info',
  Error = 'error',
}

const fontColor: AlertPropObject<string> = {
  info: 'text-theme-color-bun',
  error: 'text-theme-status-error',
};

const borderColor: AlertPropObject<string> = {
  info: 'border-l-theme-color-bun',
  error: 'border-l-theme-status-error',
};

const iconType: AlertPropObject<typeof FeedbackIcon> = {
  info: FeedbackIcon,
  error: AlertIcon,
};

interface AlertProps {
  className?: string;
  title?: string;
  type?: AlertType;
  children?: ReactNode;
}

export const AlertParagraph = classed('p', 'typo-callout mt-3');

function Alert({
  className,
  title,
  children,
  type = AlertType.Info,
}: AlertProps): ReactElement {
  const Icon = iconType[type];

  return (
    <div
      className={classNames(
        'flex flex-col p-3 border border-theme-active border-l-4',
        borderColor[type],
        children ? 'rounded-16' : 'rounded-12',
        className,
      )}
    >
      <span className="flex flex-row items-center typo-callout">
        <Icon size="medium" className={classNames('mr-2', fontColor[type])} />
        <span
          className={classNames(
            'typo-callout',
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
