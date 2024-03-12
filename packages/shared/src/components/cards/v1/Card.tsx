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
        'multi-truncate font-bold text-theme-label-primary typo-title3',
        lineClamp,
        className,
      )}
    >
      {children}
    </h3>
  );
};

export const FreeformCardTitle = classed(
  'h3',
  'mt-2 break-words multi-truncate font-bold typo-title3',
);

export const CardTitle = classed(Title, 'mt-4 break-words');

export const ListCardTitle = classed(Title, 'mr-2');

export const CardTextContainer = classed('div', 'flex flex-col');
export const CardContainer = classed('div', 'flex flex-col');
export const CardContent = classed('div', 'flex flex-col mobileXL:flex-row');

export const CardImage = classed(
  Image,
  'rounded-12 max-h-[12.5rem] w-full mobileXL:aspect-auto mobileXL:max-h-40 mobileXL:w-40 mobileXXL:max-h-56 mobileXXL:w-56',
);

export const CardSpace = classed('div', 'flex-1');

const clickableCardClasses = classNames(
  'focus-outline absolute inset-0 block h-full w-full rounded-16',
);

export const CardButton = classed('button', clickableCardClasses);

export const CardLink = classed('a', clickableCardClasses);

export const Card = classed(
  'article',
  `group relative w-full flex flex-col py-6 px-4 border-t border-theme-divider-tertiary rounded-16
   hover:bg-theme-float
  `,
);

export const CardHeader = classed(
  'div',
  'flex flex-row items-center items-center mb-2',
);
