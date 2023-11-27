import React, { ReactElement } from 'react';
import { anchorDefaultRel } from '../../../../lib/strings';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { Ad } from '../../../../graphql/posts';

type AdLinkProps = {
  ad: Ad;
};
export default function AdLink({ ad }: AdLinkProps): ReactElement {
  return (
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Quaternary}
      className="mt-4 mb-2"
    >
      {ad.referralLink ? (
        <a href={ad.referralLink} target="_blank" rel={anchorDefaultRel}>
          Promoted by {ad.source}
        </a>
      ) : (
        'Promoted'
      )}
    </Typography>
  );
}
