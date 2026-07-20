import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { CardSpace, CardTextContainer } from '../common/Card';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import classed from '../../../lib/classed';
import type { PlaceholderProps } from './common/common';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';

const Text = classed(ElementPlaceholder, 'h-3 rounded-12 my-2');

export const PlaceholderGrid = forwardRef(function PlaceholderCard(
  { className, ...props }: PlaceholderProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const glassActions = useFeedCardGlassActions();

  return (
    <article
      aria-busy
      className={classNames(
        className,
        'flex flex-col rounded-16 bg-background-subtle p-2',
        glassActions ? 'min-h-cardGlass' : 'min-h-card',
      )}
      {...props}
      ref={ref}
    >
      <CardTextContainer>
        <ElementPlaceholder className="my-2 size-6 rounded-full" />
        <Text style={{ width: '100%' }} />
        <Text style={{ width: '100%' }} />
        {!glassActions && <Text style={{ width: '80%' }} />}
      </CardTextContainer>
      <CardSpace className="my-2" />
      {glassActions ? (
        // Full-bleed cover matching the glass card: the action bar floats over
        // the image, so there's no separate footer row beneath it.
        <ElementPlaceholder className="-mx-2 -mb-2 mt-2 h-40 rounded-b-16" />
      ) : (
        <>
          <ElementPlaceholder className="my-2 h-40 rounded-12" />
          <CardTextContainer>
            <Text style={{ width: '32%' }} />
          </CardTextContainer>
        </>
      )}
    </article>
  );
});
