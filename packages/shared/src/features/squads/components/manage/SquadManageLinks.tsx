import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { TextField } from '../../../../components/fields/TextField';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  LinkIcon,
  MiniCloseIcon,
  PlusIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { useSquadPageContext } from '../../SquadPageContext';
import { useUpdateSquadLinks } from '../../hooks/useUpdateSquadLinks';
import {
  getDisplayUrl,
  getSquadLinkMeta,
  isValidSquadLink,
} from '../../lib/links';
import { SQUAD_LINK_MAX_LENGTH, SQUAD_LINKS_MAX } from '../../lib/limits';
import { SquadManageSection } from '../../lib/routes';
import {
  SquadManageSaveButton,
  SquadManageSectionPanel,
} from './SquadManageLayout';

const formId = 'squad-manage-links';
const invalidLinkCopy = 'Use a full address starting with https://';

export const SquadManageLinks = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { mutate: onSave, isPending } = useUpdateSquadLinks(squad);
  const [website, setWebsite] = useState(squad.website ?? '');
  const [links, setLinks] = useState<string[]>(squad.links ?? []);
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState<string>();
  const isWebsiteValid = !website.trim() || isValidSquadLink(website);
  const isFull = links.length >= SQUAD_LINKS_MAX;

  const onAdd = () => {
    const link = draft.trim();

    if (!isValidSquadLink(link)) {
      setDraftError(invalidLinkCopy);
      return;
    }

    if (links.includes(link)) {
      setDraftError('This link is already on the list');
      return;
    }

    setLinks((current) => [...current, link]);
    setDraft('');
    setDraftError(undefined);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!isWebsiteValid) {
      return;
    }

    onSave({ website: website.trim() || null, links });
  };

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Links}
      action={<SquadManageSaveButton formId={formId} isLoading={isPending} />}
    >
      <form
        id={formId}
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-6 px-4 py-6 tablet:px-6"
      >
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Website
          </Typography>
          <TextField
            inputId="squad-website"
            name="website"
            label="Website"
            type="url"
            fieldType="secondary"
            leftIcon={<LinkIcon />}
            maxLength={SQUAD_LINK_MAX_LENGTH}
            showMaxLength={false}
            value={website}
            valueChanged={setWebsite}
            valid={isWebsiteValid}
            hint={isWebsiteValid ? undefined : invalidLinkCopy}
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Shown in the page header and first in the Links widget.
          </Typography>
        </div>
        <HorizontalSeparator />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Links
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {`Up to ${SQUAD_LINKS_MAX} links, shown in the Links widget in this order.`}
          </Typography>
          {!isFull && (
            <TextField
              inputId="squad-link-url"
              name="link"
              label="Add link"
              type="url"
              fieldType="secondary"
              placeholder="Paste a URL"
              maxLength={SQUAD_LINK_MAX_LENGTH}
              showMaxLength={false}
              value={draft}
              valueChanged={(value) => {
                setDraft(value);
                setDraftError(undefined);
              }}
              valid={!draftError}
              hint={draftError}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onAdd();
                }
              }}
              actionButton={
                <Button
                  type="button"
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.XSmall}
                  icon={<PlusIcon />}
                  disabled={!draft.trim()}
                  onClick={onAdd}
                >
                  Add
                </Button>
              }
            />
          )}
          <ul className="mt-2 flex flex-col gap-4">
            {links.map((link) => {
              const { name, Icon } = getSquadLinkMeta(link);

              return (
                <li key={link} className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-secondary">
                    <Icon size={IconSize.Small} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <Typography type={TypographyType.Subhead} bold>
                      {name}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      truncate
                    >
                      {getDisplayUrl(link)}
                    </Typography>
                  </span>
                  <Button
                    type="button"
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.XSmall}
                    icon={<MiniCloseIcon />}
                    aria-label={`Remove ${name}`}
                    onClick={() =>
                      setLinks((current) =>
                        current.filter((item) => item !== link),
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </form>
    </SquadManageSectionPanel>
  );
};
