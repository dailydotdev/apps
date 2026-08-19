import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { getAdAttributionText } from '../../../components/cards/ad/common/AdAttribution';
import type { Ad } from '../../../graphql/posts';
import { useAdLabel } from '../../monetization/useAdLabel';

interface DealsAdLabelProps {
  ad: Ad;
  className?: string;
}

/**
 * The promoted disclosure for the deals surfaces. It shares its wording with
 * `AdAttribution`, but renders the string as-is: the deals pages are statically
 * rendered, and the character scrambling `AdAttribution` uses against ad
 * blockers produces different markup on the server and the client, which fails
 * hydration and drops the whole page to client rendering.
 */
export const DealsAdLabel = ({
  ad,
  className,
}: DealsAdLabelProps): ReactElement => {
  const { hideAdvertiser } = useAdLabel();
  const text = getAdAttributionText(ad, hideAdvertiser);
  const elementClass = classNames(
    'text-text-quaternary no-underline',
    className,
  );

  if (ad.referralLink && !hideAdvertiser) {
    return (
      <a
        href={ad.referralLink}
        target="_blank"
        rel="noopener"
        className={elementClass}
      >
        {text}
      </a>
    );
  }

  return <span className={elementClass}>{text}</span>;
};
