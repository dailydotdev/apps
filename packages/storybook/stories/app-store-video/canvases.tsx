import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Canvas, Dark } from './parts';
import type { Placement } from './parts';

// The canvas each video renders into: the header and search assets on the
// store's dark aurora at their aspect ratios, the preview as a bare phone
// screen, since previews may only be screen captures.

export const frameFor =
  (placement: Placement, safe = false) =>
  (content: ReactNode, id?: string): ReactElement =>
    placement === 'preview' ? (
      <div
        id={id}
        data-frame
        className="w-fit shrink-0 overflow-hidden rounded-24 border border-border-subtlest-tertiary"
      >
        <Dark>
          <div data-art>{content}</div>
        </Dark>
      </div>
    ) : (
      <Canvas placement={placement} safe={safe} id={id}>
        {content}
      </Canvas>
    );
