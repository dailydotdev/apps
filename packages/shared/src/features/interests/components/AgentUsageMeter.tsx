import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../../../components/popover/Popover';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { KeyIcon, PlusIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { plusUrl } from '../../../lib/constants';
import { useAgent } from '../AgentContext';

type Allowance = {
  label: string;
  used: number;
  limit: number;
  resets: string;
};

// Invented figures, so the meter is demo-only until the backend meters runs. An
// imaginary quota next to a paid upgrade is the costliest kind of placeholder.
const allowances: Allowance[] = [
  { label: 'Agent runs', used: 6, limit: 10, resets: 'Resets in 3h 24m' },
  { label: 'Deep research', used: 4, limit: 5, resets: 'Resets Monday' },
];

const nearLimit = 0.8;

const Meter = ({ label, used, limit, resets }: Allowance): ReactElement => {
  const ratio = Math.min(used / limit, 1);
  const isNearLimit = ratio >= nearLimit;

  return (
    <FlexCol className="gap-1">
      <FlexRow className="items-baseline justify-between gap-2">
        <Typography type={TypographyType.Footnote}>{label}</Typography>
        <Typography
          type={TypographyType.Caption1}
          color={
            isNearLimit ? TypographyColor.Primary : TypographyColor.Tertiary
          }
          className="tabular-nums"
        >
          {used} / {limit}
        </Typography>
      </FlexRow>
      <span className="h-1 w-full overflow-hidden rounded-6 bg-surface-float">
        <span
          className={classNames(
            'block h-full rounded-6',
            isNearLimit ? 'bg-status-warning' : 'bg-brand-default',
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </span>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
      >
        {resets}
      </Typography>
    </FlexCol>
  );
};

export const AgentUsageMeter = (): ReactElement | null => {
  const { isDemo } = useAgent();
  const [runs] = allowances;
  const ratio = Math.min(runs.used / runs.limit, 1);

  if (!isDemo) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Agent usage"
          className="flex shrink-0 items-center gap-1.5 rounded-8 px-1.5 py-1 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <span className="h-1 w-8 overflow-hidden rounded-6 bg-surface-float">
            <span
              className={classNames(
                'block h-full rounded-6',
                ratio >= nearLimit ? 'bg-status-warning' : 'bg-brand-default',
              )}
              style={{ width: `${ratio * 100}%` }}
            />
          </span>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            className="tabular-nums"
          >
            {runs.used}/{runs.limit} runs
          </Typography>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="z-popup w-72 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-3"
      >
        <FlexCol className="gap-3">
          <FlexRow className="items-center justify-between gap-2">
            <Typography type={TypographyType.Footnote} bold>
              This week
            </Typography>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              Free plan
            </Typography>
          </FlexRow>

          {allowances.map((allowance) => (
            <Meter key={allowance.label} {...allowance} />
          ))}

          <span className="h-px bg-border-subtlest-tertiary" />

          <FlexCol className="gap-2">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Plus raises the ceiling to 100 runs a day and keeps deep research
              uncapped.
            </Typography>
            <Link href={plusUrl} passHref>
              <Button
                tag="a"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                icon={<PlusIcon size={IconSize.Size16} />}
              >
                Upgrade to Plus
              </Button>
            </Link>
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Subtle}
              icon={<KeyIcon size={IconSize.Size16} />}
            >
              Use your own API key
            </Button>
          </FlexCol>
        </FlexCol>
      </PopoverContent>
    </Popover>
  );
};
