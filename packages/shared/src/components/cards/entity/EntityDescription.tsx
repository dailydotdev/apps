import React, { useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

const EntityDescription = ({
  copy,
  length,
}: {
  copy: string;
  length?: number;
}) => {
  const [expanded, setExpanded] = useState(length && copy.length <= length);
  const text = expanded ? copy : copy.slice(0, length);

  return (
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
    >
      {text}
      {!expanded && (
        <>
          ...{' '}
          <button
            type="button"
            className="text-text-link"
            onClick={() => setExpanded(true)}
          >
            Read more
          </button>
        </>
      )}
    </Typography>
  );
};

export default EntityDescription;
