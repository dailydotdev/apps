import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface WidgetCardProps extends ComponentProps<'section'> {
  heading?: string;
  className?: string;
}

export const WidgetCard = (props: WidgetCardProps): ReactElement => {
  const { heading, className, children, ...attrs } = props;
  return (
    <section
      className={classNames(
        'rounded-16 border-border-subtlest-tertiary flex flex-col border',
        className,
      )}
      {...attrs}
    >
      <header className="border-b-border-subtlest-tertiary border-b">
        <h4 className="text-text-tertiary typo-body my-0.5 px-4 py-3">
          {heading}
        </h4>
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
};
