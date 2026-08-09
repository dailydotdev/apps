import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';

/**
 * The card the sheet shows — which is the image the sheet copies.
 *
 * Not a DOM rendition of it: literally it. The preview used to be markup laid
 * out to resemble the export, and two descriptions of one design drift the first
 * time either is touched — the copied image stopped matching what the sheet was
 * showing. So the picture is drawn once and this displays it, and "does the copy
 * look like the preview" is not a question that can be answered wrongly.
 *
 * The trade is that the preview is not selectable or clickable. On a sheet whose
 * whole job is sending the thing, that is what it should be anyway: what is on
 * screen is what lands in the paste.
 */
export const AgentReplyCard = ({
  src,
  alt,
}: {
  /** An object URL for the drawn card, or nothing while it is being drawn. */
  src?: string;
  alt: string;
}): ReactElement =>
  src ? (
    <img
      src={src}
      alt={alt}
      // The ring and the shadow are the frame around a picture, not the
      // picture's own styling — the drawn card brings its own edges.
      className="agent-media-ring w-full rounded-16 shadow-3"
    />
  ) : (
    // Held at the export's own proportion, so nothing moves when it lands.
    <ElementPlaceholder className="agent-skeleton aspect-[16/10] w-full rounded-16" />
  );
