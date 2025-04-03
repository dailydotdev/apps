import React from 'react';
import type { ReactElement } from 'react';
import { VIcon } from '../../../components/icons/V';
import { IconSize } from '../../../components/Icon';
import classed from '../../../lib/classed';

const Box = classed(
  'div',
  'flex flex-col gap-4 p-4 rounded-16 border border-border-subtlest-secondary bg-surface-float text-text-primary',
);

export interface BoxBaseProps {
  className?: string;
}

export interface BoxListProps extends BoxBaseProps {
  title: string;
  items: {
    text: string;
  }[];
}

export const BoxList = ({
  title,
  items,
  className,
}: BoxListProps): ReactElement => {
  return (
    <Box className={className}>
      <h3 className="font-bold typo-body">{title}</h3>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.text} className="flex flex-row items-center gap-1">
            <VIcon size={IconSize.XSmall} />
            <span className="typo-callout">{item.text}</span>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export interface BoxContentImageProps extends BoxBaseProps {
  title: string;
  content: string;
  image: string;
  imageAlt?: string;
}

export const BoxContentImage = ({
  title,
  content,
  image,
  imageAlt = '',
  className,
}: BoxContentImageProps): ReactElement => {
  return (
    <Box className={className}>
      <h3 className="font-bold typo-title3">{title}</h3>
      <div>
        <img
          src={image}
          alt={imageAlt}
          className="float-right mb-2 ml-2 h-20 w-20 object-contain"
        />
        <p className="text-text-tertiary typo-callout">{content}</p>
      </div>
    </Box>
  );
};

export interface BoxFaqProps extends BoxBaseProps {
  items: {
    question: string;
    answer: string;
  }[];
}

export const BoxFaq = ({ items, className }: BoxFaqProps): ReactElement => {
  return (
    <Box className={className}>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.question} className="flex flex-col gap-2">
            <h4 className="font-bold typo-callout">{item.question}</h4>
            <p className="text-text-tertiary typo-callout">{item.answer}</p>
          </li>
        ))}
      </ul>
    </Box>
  );
};
