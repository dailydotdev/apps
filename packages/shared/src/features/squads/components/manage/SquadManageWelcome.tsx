import type { FormEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import type { SquadWelcome } from '../../../../graphql/squadWelcomeAudience';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CameraIcon, LinkIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { TextField } from '../../../../components/fields/TextField';
import Textarea from '../../../../components/fields/Textarea';
import { Switch } from '../../../../components/fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { useFileInput } from '../../../../hooks/utils/useFileInput';
import { acceptedTypesList, ACCEPTED_TYPES } from '../../../../graphql/posts';
import { useSquadPageContext } from '../../SquadPageContext';
import {
  useSquadWelcome,
  useUpdateSquadWelcome,
} from '../../hooks/useSquadWelcome';
import { isValidSquadLink } from '../../lib/links';
import {
  getSquadWelcomeExamples,
  getSquadWelcomeView,
  SQUAD_WELCOME_CTA_LABEL_MAX,
  SQUAD_WELCOME_HEADLINE_MAX,
  SQUAD_WELCOME_RULES_SHOWN,
  SQUAD_WELCOME_TEXT_MAX,
} from '../../lib/welcome';
import { SquadManageSection } from '../../lib/routes';
import { SquadWelcomeCard } from '../welcome/SquadWelcomeCard';
import {
  SquadManageSaveButton,
  SquadManageSectionPanel,
} from './SquadManageLayout';

// Manage › Welcome pop-up: one template the company fills in, with a live
// preview. The pop-up opens once, right after someone joins.

const formId = 'squad-manage-welcome';
const IMAGE_SIZE_LIMIT_MB = 2;

const Label = ({ children }: { children: string }): ReactElement => (
  <Typography type={TypographyType.Callout} bold>
    {children}
  </Typography>
);

const Helper = ({ children }: { children: string }): ReactElement => (
  <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
    {children}
  </Typography>
);

type ImageState = { file?: File; preview?: string; reset?: boolean };

/** Upload an image, or go back to the squad's own. */
const ImageField = ({
  id,
  label,
  helper,
  current,
  fallback,
  isRound,
  resetLabel,
  value,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  current: string | null;
  fallback?: string;
  isRound?: boolean;
  resetLabel: string;
  value: ImageState;
  onChange: (value: ImageState) => void;
}): ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { onFileChange } = useFileInput({
    limitMb: IMAGE_SIZE_LIMIT_MB,
    acceptedTypes: acceptedTypesList,
    onChange: (preview, file) => onChange({ file, preview }),
  });
  const shown = value.preview ?? (value.reset ? fallback : current ?? fallback);
  const isCustom = !!value.preview || (!value.reset && !!current);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label={`Upload ${label.toLowerCase()}`}
        onClick={() => inputRef.current?.click()}
        className={classNames(
          'group relative shrink-0 overflow-hidden bg-surface-float',
          isRound ? 'size-16 rounded-full' : 'h-16 w-28 rounded-12',
        )}
      >
        {!!shown && (
          <img src={shown} alt="" className="size-full object-cover" />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-8 items-center justify-center rounded-10 bg-shadow-shadow3 text-text-primary">
            <CameraIcon size={IconSize.Medium} />
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(event) => onFileChange(event.target.files?.[0])}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Label>{label}</Label>
        <Helper>{helper}</Helper>
        {isCustom && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            className="self-start"
            onClick={() => onChange({ reset: true })}
          >
            {resetLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

const WelcomeForm = ({ saved }: { saved: SquadWelcome }): ReactElement => {
  const { squad } = useSquadPageContext();
  const { mutate: onSave, isPending } = useUpdateSquadWelcome(squad);
  const [enabled, setEnabled] = useState(saved.enabled);
  const [headline, setHeadline] = useState(saved.headline ?? '');
  const [text, setText] = useState(saved.text ?? '');
  const [showRules, setShowRules] = useState(saved.showRules);
  const [ctaLabel, setCtaLabel] = useState(saved.ctaLabel ?? '');
  const [ctaUrl, setCtaUrl] = useState(saved.ctaUrl ?? '');
  const [cover, setCover] = useState<ImageState>({});
  const [image, setImage] = useState<ImageState>({});
  const isLinkValid = !ctaUrl.trim() || isValidSquadLink(ctaUrl);
  const hasRules = !!squad.rules?.length;
  const view = getSquadWelcomeView(
    {
      headline: headline.trim() || null,
      text: text.trim() || null,
      showRules,
      ctaLabel: ctaLabel.trim() || null,
      ctaUrl: ctaUrl.trim() || null,
      coverUrl: cover.preview ?? (cover.reset ? null : saved.coverUrl),
      imageUrl: image.preview ?? (image.reset ? null : saved.imageUrl),
    },
    squad,
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isLinkValid) {
      return;
    }

    onSave(
      {
        input: {
          enabled,
          headline: headline.trim() || null,
          text: text.trim() || null,
          showRules,
          ctaLabel: ctaLabel.trim() || null,
          ctaUrl: ctaUrl.trim() || null,
          ...(cover.reset && { resetCover: true }),
          ...(image.reset && { resetImage: true }),
        },
        cover: cover.file,
        image: image.file,
      },
      {
        // Start from what was saved, so a second Save sends nothing again
        onSuccess: () => {
          setCover({});
          setImage({});
        },
      },
    );
  };

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Welcome}
      action={<SquadManageSaveButton formId={formId} isLoading={isPending} />}
    >
      <div className="flex flex-col gap-6 px-4 py-6 tablet:px-6 laptopL:flex-row">
        <form
          id={formId}
          onSubmit={onSubmit}
          noValidate
          className="flex min-w-0 flex-1 flex-col gap-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <Label>Show a pop-up when someone joins</Label>
              <Helper>Once per new member, right after Join.</Helper>
            </div>
            <Switch
              inputId="welcome-enabled"
              name="enabled"
              compact={false}
              checked={enabled}
              onToggle={() => setEnabled((value) => !value)}
              aria-label="Show a pop-up when someone joins"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Start from an example</Label>
            <Helper>
              The same template, filled in for you. Change anything after.
            </Helper>
            <div className="flex flex-wrap gap-2">
              {getSquadWelcomeExamples(squad).map((example) => (
                <Button
                  key={example.label}
                  type="button"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
                  onClick={() => {
                    setHeadline(example.text.headline ?? '');
                    setText(example.text.text ?? '');
                    setShowRules(example.text.showRules && hasRules);
                    setCtaLabel(example.text.ctaLabel ?? '');
                    setCtaUrl(example.text.ctaUrl ?? '');
                  }}
                >
                  {example.label}
                </Button>
              ))}
            </div>
          </div>
          <HorizontalSeparator />
          <ImageField
            id="welcome-cover"
            label="Cover image"
            helper="Wide, at the top. Your squad’s cover by default."
            current={saved.coverUrl}
            fallback={squad.headerImage}
            resetLabel="Use the squad’s cover"
            value={cover}
            onChange={setCover}
          />
          <ImageField
            id="welcome-image"
            label="Image"
            helper="The circle under the cover: your logo, or an event or product image."
            current={saved.imageUrl}
            fallback={squad.image}
            isRound
            resetLabel="Use the squad’s logo"
            value={image}
            onChange={setImage}
          />
          <TextField
            inputId="welcome-headline"
            name="headline"
            label="Headline"
            fieldType="secondary"
            maxLength={SQUAD_WELCOME_HEADLINE_MAX}
            placeholder={`Welcome to ${squad.name}`}
            value={headline}
            valueChanged={setHeadline}
          />
          <Textarea
            inputId="welcome-text"
            name="text"
            label="Text"
            rows={3}
            maxLength={SQUAD_WELCOME_TEXT_MAX}
            value={text}
            valueChanged={setText}
          />
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <Label>{`Show the first ${SQUAD_WELCOME_RULES_SHOWN} house rules`}</Label>
              <Helper>
                {hasRules
                  ? 'From Manage › Rules.'
                  : 'Add rules in Manage › Rules to show them here.'}
              </Helper>
            </div>
            <Switch
              inputId="welcome-rules"
              name="showRules"
              compact={false}
              checked={showRules && hasRules}
              disabled={!hasRules}
              onToggle={() => setShowRules((value) => !value)}
              aria-label="Show the house rules"
            />
          </div>
          <div className="flex flex-col gap-3 tablet:flex-row">
            <TextField
              inputId="welcome-cta-label"
              name="ctaLabel"
              label="Button label"
              fieldType="secondary"
              maxLength={SQUAD_WELCOME_CTA_LABEL_MAX}
              className={{ container: 'flex-1' }}
              value={ctaLabel}
              valueChanged={setCtaLabel}
            />
            <TextField
              inputId="welcome-cta-url"
              name="ctaUrl"
              label="Button link (optional)"
              type="url"
              fieldType="secondary"
              leftIcon={<LinkIcon />}
              className={{ container: 'flex-1' }}
              value={ctaUrl}
              valueChanged={setCtaUrl}
              valid={isLinkValid}
              hint={
                isLinkValid
                  ? undefined
                  : 'Use a full address starting with https://'
              }
            />
          </div>
          <Helper>No link: the button closes the pop-up.</Helper>
        </form>
        <div className="flex flex-col gap-2 laptopL:w-80 laptopL:shrink-0">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            Preview
          </Typography>
          <div
            aria-hidden
            className={classNames(
              'pointer-events-none overflow-hidden rounded-24 border border-border-subtlest-tertiary',
              !enabled && 'opacity-40',
            )}
          >
            <SquadWelcomeCard view={view} />
          </div>
        </div>
      </div>
    </SquadManageSectionPanel>
  );
};

export const SquadManageWelcome = (): ReactElement | null => {
  const { squad } = useSquadPageContext();
  const { welcome, isPending } = useSquadWelcome(squad);

  if (isPending) {
    return null;
  }

  return <WelcomeForm saved={welcome} />;
};
