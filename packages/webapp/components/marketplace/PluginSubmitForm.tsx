import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import RichTextInput from '@dailydotdev/shared/src/components/fields/RichTextInput';
import { MarkdownCommand } from '@dailydotdev/shared/src/hooks/input/useMarkdownInput';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import type {
  Plugin,
  PluginInput,
} from '@dailydotdev/shared/src/graphql/plugins';
import {
  PLUGIN_ABOUT_MAX_LENGTH,
  PLUGIN_DESCRIPTION_MAX_LENGTH,
  PLUGIN_NAME_MAX_LENGTH,
  PLUGIN_SKILL_MD_MAX_LENGTH,
  PLUGIN_URL_MAX_LENGTH,
  SUBMIT_PLUGIN_MUTATION,
  SUBMIT_PLUGIN_UPDATE_MUTATION,
} from '@dailydotdev/shared/src/graphql/plugins';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';

interface PluginSubmitFormProps {
  plugin?: Plugin;
  onSubmitted: () => void;
}

const toFormState = (plugin?: Plugin): PluginInput => ({
  name: plugin?.name ?? '',
  description: plugin?.description ?? '',
  about: plugin?.about ?? '',
  skillMd: plugin?.skillMd ?? '',
  url: plugin?.url ?? '',
});

const toInput = (state: PluginInput): PluginInput => ({
  name: state.name.trim(),
  description: state.description.trim(),
  about: state.about.trim(),
  skillMd: state.skillMd?.trim() || null,
  url: state.url?.trim() || null,
});

export const PluginSubmitForm = ({
  plugin,
  onSubmitted,
}: PluginSubmitFormProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const logSubmit = (extra: Record<string, unknown>) =>
    logEvent({
      event_name: LogEvent.SubmitPlugin,
      target_type: TargetType.Plugin,
      target_id: plugin?.id,
      extra: JSON.stringify({ update: !!plugin, ...extra }),
    });
  const [form, setForm] = useState<PluginInput>(() => toFormState(plugin));
  const setField = (field: keyof PluginInput) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const { mutate, isPending, error } = useMutation<
    unknown,
    GraphQLError,
    PluginInput
  >({
    mutationFn: (input: PluginInput) =>
      plugin
        ? gqlClient.request(SUBMIT_PLUGIN_UPDATE_MUTATION, {
            pluginId: plugin.id,
            input,
          })
        : gqlClient.request(SUBMIT_PLUGIN_MUTATION, { input }),
    onSuccess: () => {
      logSubmit({ success: true });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.MyPluginSubmissions, user),
      });
      displayToast(
        plugin
          ? 'Update submitted. It goes live once the team approves it.'
          : 'Plugin submitted. It goes live once the team approves it.',
      );
      setForm(toFormState());
      onSubmitted();
    },
    onError: (submitError) => {
      logSubmit({
        success: false,
        error: submitError?.response?.errors?.[0]?.extensions?.code,
      });
    },
  });

  const errorMessage = error?.response?.errors?.[0]?.message;
  const hasSource = !!form.skillMd?.trim() || !!form.url?.trim();
  const canSubmit =
    form.name.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.about.trim().length > 0;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!user) {
      showLogin({ trigger: AuthTriggers.Marketplace });
      return;
    }

    mutate(toInput(form));
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <TextField
        label="Name"
        inputId="plugin-name"
        name="name"
        value={form.name}
        valueChanged={setField('name')}
        maxLength={PLUGIN_NAME_MAX_LENGTH}
      />
      <Textarea
        label="Short description"
        inputId="plugin-description"
        name="description"
        value={form.description}
        valueChanged={setField('description')}
        maxLength={PLUGIN_DESCRIPTION_MAX_LENGTH}
        hint="Your pitch in 1-3 sentences. This short version is what people see on marketplace cards, so sell it."
        rows={2}
      />
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Callout} bold>
          About
        </Typography>
        <RichTextInput
          inputId="plugin-about"
          initialContent={form.about}
          onValueUpdate={setField('about')}
          maxInputLength={PLUGIN_ABOUT_MAX_LENGTH}
          enabledCommand={{ [MarkdownCommand.Emoji]: true }}
          disallowLinks
          textareaProps={{
            name: 'about',
            placeholder: 'What it does and how to use it',
          }}
        />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Shown on the plugin page. Links and images are not allowed here, use
          the Link field instead.
        </Typography>
      </div>
      <Textarea
        label="SKILL.md (optional)"
        inputId="plugin-skill-md"
        name="skillMd"
        value={form.skillMd ?? ''}
        valueChanged={setField('skillMd')}
        maxLength={PLUGIN_SKILL_MD_MAX_LENGTH}
        hint="Agent instructions. Agents can load them from the plugin's skill.md URL."
        rows={10}
      />
      <TextField
        label="Link (optional)"
        inputId="plugin-url"
        name="url"
        type="url"
        placeholder="https://"
        value={form.url ?? ''}
        valueChanged={setField('url')}
        maxLength={PLUGIN_URL_MAX_LENGTH}
        hint="Homepage, repository or anything else."
      />
      {!hasSource && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Add a SKILL.md, a link, or both.
        </Typography>
      )}
      {errorMessage && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.StatusError}
        >
          {errorMessage}
        </Typography>
      )}
      <Button
        type="submit"
        variant={ButtonVariant.Primary}
        className="w-fit"
        loading={isPending}
        disabled={!canSubmit || !hasSource}
      >
        {plugin ? 'Submit update' : 'Submit for review'}
      </Button>
    </form>
  );
};
