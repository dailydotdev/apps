import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  Ref,
  useContext,
} from 'react';
import classNames from 'classnames';
import { CardSpace, CardTextContainer } from './Card';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';
import FeaturesContext from '../../contexts/FeaturesContext';

const Text = classed(ElementPlaceholder, 'h-3 rounded-xl my-2');

export type PlaceholderCardProps = {
  showImage?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export const PlaceholderCard = forwardRef(function PlaceholderCard(
  { className, showImage, ...props }: PlaceholderCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { postEngagementNonClickable } = useContext(FeaturesContext);

  return (
    <article
      aria-busy
      className={classNames(
        className,
        'flex flex-col rounded-2xl p-2 bg-theme-post-disabled',
      )}
      {...props}
      ref={ref}
    >
      <CardTextContainer>
        <ElementPlaceholder className="my-2 w-6 h-6 rounded-full" />
        <Text style={{ width: '100%' }} />
        <Text style={{ width: '100%' }} />
        <Text style={{ width: '80%' }} />
      </CardTextContainer>
      <CardSpace className={showImage ? 'my-2' : 'my-6'} />
      {postEngagementNonClickable && (
        <CardTextContainer>
          <Text style={{ width: '32%' }} />
        </CardTextContainer>
      )}
      {showImage && <ElementPlaceholder className="my-2 h-40 rounded-xl" />}
      {!postEngagementNonClickable && (
        <CardTextContainer>
          <Text style={{ width: '32%' }} />
        </CardTextContainer>
      )}
    </article>
  );
});
