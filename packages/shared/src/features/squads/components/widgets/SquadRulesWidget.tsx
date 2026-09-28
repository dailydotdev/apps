import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import Link from '../../../../components/utilities/Link';
import { getSquadRulesUrl } from '../../lib/routes';
import { SquadWidget } from './SquadWidget';

interface SquadRulesWidgetProps {
  squad: Squad;
}

export const SquadRulesWidget = ({
  squad,
}: SquadRulesWidgetProps): ReactElement | null => {
  const rules = squad.rules ?? [];

  if (!rules.length) {
    return null;
  }

  const url = getSquadRulesUrl(squad.handle);

  return (
    <SquadWidget title="Rules">
      <ol className="mt-2 flex flex-col divide-y divide-border-subtlest-tertiary">
        {rules.map(({ title }, index) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="flex items-center gap-3 py-2"
          >
            <span className="w-4 shrink-0 tabular-nums text-text-quaternary typo-caption1">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
              {title}
            </span>
          </li>
        ))}
      </ol>
      <Link href={url} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Subtle}
          size={ButtonSize.Small}
          className="mt-2"
        >
          All rules
        </Button>
      </Link>
    </SquadWidget>
  );
};
