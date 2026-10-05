import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { TextField } from '../../../../components/fields/TextField';
import { Switch } from '../../../../components/fields/Switch';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { LinkIcon, VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import type { SquadBranding } from '../../../../graphql/squadBranding';
import { squadBrandingQueryOptions } from '../../../../graphql/squadBranding';
import { useSquadPageContext } from '../../SquadPageContext';
import { useUpdateSquadBranding } from '../../hooks/useSquadBranding';
import {
  getBrandInk,
  isHexColor,
  SQUAD_BUTTON_LABEL_MAX_LENGTH,
  squadBrandSwatches,
  squadButtonPresets,
} from '../../lib/branding';
import { isValidSquadLink } from '../../lib/links';
import { SQUAD_LINK_MAX_LENGTH } from '../../lib/limits';
import { SquadManageSection } from '../../lib/routes';
import {
  SquadManageSaveButton,
  SquadManageSectionPanel,
} from './SquadManageLayout';

const formId = 'squad-manage-branding';
const invalidLinkCopy = 'Use a full address starting with https://';

const FieldTitle = ({
  title,
  hint,
}: {
  title: string;
  hint: string;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {hint}
    </Typography>
  </div>
);

// Without a brand colour the button is the app's primary button.
const getSketchButtonStyle = (
  isButtonOn: boolean,
  color: string | null,
): React.CSSProperties | undefined => {
  if (!isButtonOn) {
    return undefined;
  }

  return color
    ? { background: color, color: getBrandInk(color).ink }
    : {
        background: 'var(--theme-text-primary)',
        color: 'var(--theme-background-default)',
      };
};

/**
 * A wireframe of the squad header: grey placeholders, with colour only on the
 * two things the brand colour changes. Not interactive, so it reads as a
 * sketch, not the page.
 */
const BrandPreview = ({
  color,
  label,
  isButtonOn,
}: {
  color: string | null;
  label: string;
  isButtonOn: boolean;
}): ReactElement => (
  <figure className="flex w-full max-w-sm flex-col gap-2">
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
    >
      <div className="h-14 bg-surface-float" />
      <div
        className="px-4 pb-4"
        style={
          color
            ? {
                background: `linear-gradient(to bottom, color-mix(in srgb, ${color}, transparent 78%), transparent 85%)`,
              }
            : undefined
        }
      >
        <div className="-mt-5 flex items-end justify-between">
          <span className="size-11 rounded-full bg-surface-hover ring-4 ring-background-default" />
          <span className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-6 rounded-8 bg-surface-float" />
            ))}
            <span
              className={classNames(
                'flex h-7 max-w-[9rem] items-center truncate rounded-10 px-3 font-bold typo-caption1',
                !isButtonOn && 'bg-surface-float text-text-tertiary',
              )}
              style={getSketchButtonStyle(isButtonOn, color)}
            >
              {isButtonOn ? label || 'Your button' : 'Joined'}
            </span>
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <span className="h-3 w-28 rounded-6 bg-surface-hover" />
          <span className="h-2 w-52 max-w-full rounded-6 bg-surface-float" />
          <span className="h-2 w-40 rounded-6 bg-surface-float" />
        </div>
      </div>
    </div>
    <figcaption className="text-text-quaternary typo-caption1">
      Sketch of your header: the gradient and the button take your colour.
    </figcaption>
  </figure>
);

const ColourField = ({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}): ReactElement => {
  const isValid = isHexColor(color);
  const ink = isValid ? getBrandInk(color) : null;

  return (
    <div className="flex flex-col gap-3">
      <FieldTitle
        title="Brand colour"
        hint="Used for your header gradient and header button."
      />
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Brand colour"
          className="flex items-center gap-2"
        >
          {squadBrandSwatches.map((swatch) => {
            const isPicked = color.toLowerCase() === swatch.toLowerCase();

            return (
              <button
                key={swatch}
                type="button"
                role="radio"
                aria-checked={isPicked}
                aria-label={swatch}
                onClick={() => onChange(swatch)}
                className={classNames(
                  'flex size-8 items-center justify-center rounded-full border border-border-subtlest-secondary ring-offset-2 ring-offset-background-default transition-shadow',
                  isPicked
                    ? 'ring-2 ring-text-primary'
                    : 'hover:ring-2 hover:ring-border-subtlest-secondary',
                )}
                style={{ background: swatch, color: getBrandInk(swatch).ink }}
              >
                {isPicked && <VIcon size={IconSize.Size16} />}
              </button>
            );
          })}
        </div>
        <span
          aria-hidden
          className="hidden h-6 w-px bg-border-subtlest-tertiary tablet:block"
        />
        <div
          className={classNames(
            'flex h-9 items-center gap-2 rounded-12 bg-surface-float pl-1.5 pr-3 focus-within:ring-2',
            isValid || !color
              ? 'focus-within:ring-accent-cabbage-default'
              : 'ring-2 ring-accent-ketchup-default',
          )}
        >
          <span
            className="relative size-6 overflow-hidden rounded-full border border-border-subtlest-secondary"
            style={{ background: isValid ? color : undefined }}
          >
            <input
              type="color"
              aria-label="Pick any colour"
              value={isValid ? color : '#000000'}
              onChange={(event) => onChange(event.target.value.toUpperCase())}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </span>
          <span className="font-mono text-text-quaternary typo-callout">#</span>
          <input
            aria-label="Hex colour"
            value={color.replace('#', '')}
            maxLength={6}
            spellCheck={false}
            placeholder="FF570A"
            onChange={(event) => {
              const hex = event.target.value
                .replace(/[^0-9a-f]/gi, '')
                .toUpperCase();
              onChange(hex ? `#${hex}` : '');
            }}
            className="w-16 bg-transparent font-mono uppercase text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
          />
        </div>
      </div>
      {!!color && !isValid && (
        <Typography
          type={TypographyType.Footnote}
          className="text-accent-ketchup-default"
        >
          Use six hex digits, like FF570A
        </Typography>
      )}
      {ink && (
        <span className="inline-flex w-fit items-center gap-2 rounded-10 bg-surface-float py-1 pl-1 pr-2 text-text-tertiary typo-caption1">
          <span
            className="flex h-5 items-center rounded-6 px-1.5 font-bold"
            style={{ background: color, color: ink.ink }}
          >
            Aa
          </span>
          {ink.isDark ? 'Dark' : 'White'} text · {ink.ratio.toFixed(1)}:1
          {ink.ratio >= 4.5 ? (
            <VIcon
              size={IconSize.Size16}
              className="text-accent-avocado-default"
              aria-label="Passes AA"
            />
          ) : (
            <span className="text-accent-bun-default">low contrast</span>
          )}
        </span>
      )}
    </div>
  );
};

const SquadManageBrandingForm = ({
  branding,
}: {
  branding?: SquadBranding;
}): ReactElement => {
  const { squad } = useSquadPageContext();
  const { mutate: onSave, isPending } = useUpdateSquadBranding(squad);
  const { displayToast } = useToastNotification();
  const [color, setColor] = useState(branding?.color ?? '');
  const [isButtonOn, setIsButtonOn] = useState(!!branding?.button?.enabled);
  const [label, setLabel] = useState(
    branding?.button?.label ?? squadButtonPresets[0],
  );
  const [url, setUrl] = useState(branding?.button?.url ?? squad.website ?? '');
  const isColorValid = !color || isHexColor(color);
  // The link only matters while the button is on: a hidden field must never
  // block Save.
  const isUrlValid = !isButtonOn || isValidSquadLink(url);
  const isLabelValid = !isButtonOn || !!label.trim();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!isColorValid || !isUrlValid || !isLabelValid) {
      displayToast('Fix the highlighted field to save');
      return;
    }

    const draft =
      label.trim() && isValidSquadLink(url)
        ? { label: label.trim(), url: url.trim() }
        : null;
    // Turned off: keep the saved button so turning it back on restores it
    const kept = draft ?? branding?.button ?? null;

    onSave({
      color: color ? color.toUpperCase() : null,
      button: isButtonOn
        ? { ...(draft as { label: string; url: string }), enabled: true }
        : kept && { label: kept.label, url: kept.url, enabled: false },
    });
  };

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Branding}
      action={<SquadManageSaveButton formId={formId} isLoading={isPending} />}
    >
      <form
        id={formId}
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-6 px-4 py-6 tablet:px-6"
      >
        <BrandPreview
          color={isHexColor(color) ? color : null}
          label={label}
          isButtonOn={isButtonOn}
        />
        <ColourField color={color} onChange={setColor} />
        <HorizontalSeparator />
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <FieldTitle
                title="Header button"
                hint="Replaces Join Squad once someone joins. Off: members see Joined. Clicks show in Analytics."
              />
            </div>
            <Switch
              inputId="squad-header-button"
              name="headerButton"
              checked={isButtonOn}
              onToggle={() => setIsButtonOn((value) => !value)}
              compact={false}
              aria-label="Show the header button"
            />
          </div>
          {isButtonOn && (
            <>
              <div className="flex flex-wrap gap-2">
                {squadButtonPresets.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={
                      preset === label
                        ? ButtonVariant.Primary
                        : ButtonVariant.Float
                    }
                    size={ButtonSize.Small}
                    onClick={() => setLabel(preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              <TextField
                inputId="squad-header-button-label"
                name="label"
                label="Button label"
                fieldType="secondary"
                maxLength={SQUAD_BUTTON_LABEL_MAX_LENGTH}
                value={label}
                valueChanged={setLabel}
                valid={isLabelValid}
                hint={isLabelValid ? undefined : 'Add a label'}
              />
              <TextField
                inputId="squad-header-button-url"
                name="url"
                label="Link"
                type="url"
                fieldType="secondary"
                leftIcon={<LinkIcon />}
                maxLength={SQUAD_LINK_MAX_LENGTH}
                showMaxLength={false}
                value={url}
                valueChanged={setUrl}
                valid={isUrlValid}
                hint={isUrlValid ? undefined : invalidLinkCopy}
              />
            </>
          )}
        </div>
      </form>
    </SquadManageSectionPanel>
  );
};

export const SquadManageBranding = (): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  // A failed load is not "no branding": never show an empty form whose Save
  // would overwrite what is stored. Retry a few times, then offer a retry.
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    ...squadBrandingQueryOptions({ squad, user }),
    retry: 2,
  });

  if (isError && !data) {
    return (
      <SquadManageSectionPanel section={SquadManageSection.Branding}>
        <div className="flex flex-col items-start gap-3 px-4 py-6 tablet:px-6">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            We couldn’t load your branding. Nothing has changed.
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            loading={isRefetching}
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      </SquadManageSectionPanel>
    );
  }

  if (isPending || !data) {
    return null;
  }

  return <SquadManageBrandingForm branding={data} />;
};
