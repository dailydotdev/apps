import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { contentGuidelines, webappUrl } from '../../lib/constants';

export type FooterLinksProps = {
  className?: string;
};

export const FooterLinks = ({ className }: FooterLinksProps): ReactElement => {
  return (
    <ul
      className={classNames(
        className,
        'm-0 flex flex-row flex-wrap justify-center gap-3 p-0 text-text-tertiary typo-caption1',
      )}
    >
      <li>© 2024 Daily Dev Ltd.</li>
      <li>
        <a href={contentGuidelines}>Guidelines</a>
      </li>
      <li>
        <a href={`${webappUrl}tags`}>Tags</a>
      </li>
      <li>
        <a href={`${webappUrl}sources`}>Sources</a>
      </li>
      <li>
        <a href={`${webappUrl}squads`}>Squads</a>
      </li>
    </ul>
  );
};
