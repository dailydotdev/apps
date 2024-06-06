import React, { HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import classed from '../../../lib/classed';
import { Image } from '../../image/Image';

type TitleProps = HTMLAttributes<HTMLHeadingElement> & {
  lineClamp?: `line-clamp-${number}`;
  children: ReactNode;
};

const Title = ({
  className,
  lineClamp = 'line-clamp-3',
  children,
  ...rest
}: TitleProps): ReactElement => {
  return (
    <h3
      {...rest}
      className={classNames(
        'multi-truncate font-bold text-text-primary typo-title3',
        lineClamp,
        className,
      )}
    >
      {children}
    </h3>
  );
};

export const CardTitle = classed(Title, 'mt-4 break-words');

export const CardTextContainer = classed('div', 'flex flex-col');
export const CardContainer = classed('div', 'flex flex-col');
export const CardContent = classed('div', 'flex flex-col mobileXL:flex-row');

export const CardImage = classed(
  Image,
  'rounded-12 min-h-[10rem] max-h-[12.5rem] object-cover w-full h-auto mobileXL:max-h-40 mobileXL:w-40 mobileXXL:max-h-56 mobileXXL:w-56',
);

export const CardSpace = classed('div', 'flex-1');

const clickableCardClasses = classNames(
  'focus-outline absolute inset-0 block h-full w-full rounded-16',
);

export const CardLink = classed('a', clickableCardClasses);

export const ListCard = classed(
  'article',
  `group relative w-full flex flex-col py-6 px-4 border-t border-border-subtlest-tertiary rounded-16
   hover:bg-surface-float
  `,
);

export const CardHeader = classed('div', 'flex flex-row items-center mb-2');
