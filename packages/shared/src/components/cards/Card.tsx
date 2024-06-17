import React, { HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import styles from './Card.module.css';
import classed from '../../lib/classed';
import { Post } from '../../graphql/posts';
import { Image } from '../image/Image';

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
        styles.title,
        'multi-truncate font-bold text-text-primary typo-title3',
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

export const CardTitle = classed(Title, 'mt-2 break-words');

export const CardTextContainer = classed('div', 'flex flex-col mx-2');

export const CardImage = classed(Image, 'rounded-12 h-40 object-cover');
export const CardSpace = classed('div', 'flex-1');

const clickableCardClasses = classNames(
  styles.link,
  'focus-outline absolute inset-0 h-full w-full',
);

export const CardButton = classed('button', clickableCardClasses);

export const CardLink = classed('a', clickableCardClasses);

export const Card = classed(
  'article',
  styles.card,
  'snap-start relative max-h-cardLarge h-full flex flex-col p-2 rounded-16 bg-background-subtle border border-border-subtlest-tertiary hover:border-border-subtlest-secondary shadow-2',
);

export const ChecklistCardComponent = classed(
  'article',
  styles.card,
  'tablet:max-w-[21.5rem] w-full relative max-h-fit h-full flex flex-col bg-background-subtle tablet:border border-accent-cabbage-default hover:border-accent-cabbage-default shadow-2',
);

export const CardHeader = classed(
  'div',
  styles.header,
  'flex items-center h-8 items-center my-1 mt-2 -mx-1.5',
);

export const ListCard = classed(
  'article',
  styles.card,
  'relative flex items-stretch pt-4 pb-3 pr-4 rounded-16 bg-background-subtle border border-border-subtlest-tertiary hover:border-border-subtlest-secondary shadow-2',
);

export const ListCardDivider = classed(
  'div',
  'w-px h-full bg-border-subtlest-tertiary',
);

export const getPostClassNames = (
  post: Post,
  ...postClassNames: string[]
): string =>
  classNames(
    { [styles.read]: post.read, [styles.trending]: post.trending > 0 },
    styles.post,
    'group',
    ...postClassNames,
  );
