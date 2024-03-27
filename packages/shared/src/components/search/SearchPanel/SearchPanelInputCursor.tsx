import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { SearchPanelContext } from './SearchPanelContext';
import { useDomPurify } from '../../../hooks/useDomPurify';

export type SearchPanelInputCursorProps = {
  className?: Partial<{
    main: string;
    input: string;
  }>;
};

export const SearchPanelInputCursor = ({
  className,
}: SearchPanelInputCursorProps): ReactElement => {
  const searchPanel = useContext(SearchPanelContext);
  const purify = useDomPurify();

  if (!searchPanel.providerText) {
    return null;
  }

  const purifySanitize = purify?.sanitize;

  return (
    <div
      className={classNames(
        className?.main,
        'pointer-events-none absolute left-14 flex h-10',
      )}
    >
      <span
        aria-hidden="true"
        className={classNames(className?.input, 'invisible typo-body')}
      >
        {searchPanel.query}
      </span>
      {!!purifySanitize && (
        <div className="ml-0.5 flex items-center rounded-4 bg-overlay-quaternary-cabbage px-1">
          <span
            className="text-text-tertiary typo-footnote"
            dangerouslySetInnerHTML={{
              __html: purifySanitize(searchPanel.providerText),
            }}
          />
        </div>
      )}
    </div>
  );
};
