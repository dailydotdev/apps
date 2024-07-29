import React, { PropsWithChildren, ReactElement } from 'react';
import classNames from 'classnames';

interface WidgetCardProps extends PropsWithChildren {
  heading?: string;
  className?: string;
}

export const WidgetCard = (props: WidgetCardProps): ReactElement => {
  const { heading, className, children } = props;
  return (
    <section
      className={classNames(
        'flex flex-col rounded-16 border border-border-subtlest-tertiary',
        className,
      )}
    >
      <header className="border-b border-b-border-subtlest-tertiary">
        <h4 className="my-0.5 px-4 py-3 text-text-tertiary typo-body">
          {heading}
        </h4>
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
};
