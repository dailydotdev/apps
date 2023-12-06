import React, { HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import styles from './Card.module.css';
import classed from '../../lib/classed';
import { Post } from '../../graphql/posts';
import { Image, ImageProps } from '../image/Image';

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
        'font-bold text-theme-label-primary multi-truncate typo-title3',
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
  'my-2 break-words multi-truncate font-bold typo-title3',
);

export const CardTitle = classed(Title, 'my-2 break-words');

export const ListCardTitle = classed(Title, 'mr-2');

export const CardTextContainer = classed('div', 'flex flex-col mx-4');

interface CardImageProps extends Omit<ImageProps, 'className'> {
  className?: {
    image?: string;
    wrapper?: string;
  };
}

export const CardImage = ({
  className,
  ...props
}: CardImageProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex relative justify-center items-center w-full h-auto rounded-xl',
        className.wrapper,
      )}
    >
      <Image
        {...props}
        className={classNames('rounded-xl h-40', className.image)}
      />
    </div>
  );
};

export const CardSpace = classed('div', 'flex-1');

const clickableCardClasses = classNames(
  styles.link,
  'absolute inset-0 w-full h-full focus-outline',
);

export const CardButton = classed('button', clickableCardClasses);

export const CardLink = classed('a', clickableCardClasses);

export const Card = classed(
  'article',
  styles.card,
  'relative h-full flex flex-col p-2 rounded-2xl bg-theme-bg-secondary border border-theme-divider-tertiary hover:border-theme-divider-secondary shadow-2',
);

export const CardHeader = classed(
  'div',
  styles.header,
  'flex items-center h-8 items-center my-1 -mx-1.5',
);

export const ListCard = classed(
  'article',
  styles.card,
  'relative flex items-stretch pt-4 pb-3 pr-4 rounded-2xl bg-theme-bg-secondary border border-theme-divider-tertiary hover:border-theme-divider-secondary shadow-2',
);

export const ListCardMain = classed(
  'div',
  'flex-1 flex flex-col items-start ml-4',
);

export const ListCardAside = classed('div', 'flex flex-col items-center');

export const ListCardDivider = classed(
  'div',
  'w-px h-full bg-theme-divider-tertiary',
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
