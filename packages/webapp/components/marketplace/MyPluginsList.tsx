import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { TrashIcon } from '@dailydotdev/shared/src/components/icons/Trash';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import type {
  Plugin,
  PluginSubmission,
} from '@dailydotdev/shared/src/graphql/plugins';
import {
  CANCEL_PLUGIN_SUBMISSION_MUTATION,
  DELETE_PLUGIN_MUTATION,
  getMarketplacePluginUrl,
  PluginSubmissionStatus,
} from '@dailydotdev/shared/src/graphql/plugins';

const statusLabel: Record<PluginSubmissionStatus, string> = {
  [PluginSubmissionStatus.Pending]: 'In review',
  [PluginSubmissionStatus.Approved]: 'Approved',
  [PluginSubmissionStatus.Rejected]: 'Not approved',
  [PluginSubmissionStatus.Superseded]: 'Replaced',
};

interface MyPluginsListProps {
  plugins: Plugin[];
  submissions: PluginSubmission[];
  onEdit: (plugin: Plugin) => void;
}

export const MyPluginsList = ({
  plugins,
  submissions,
  onEdit,
}: MyPluginsListProps): ReactElement | null => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { showPrompt } = usePrompt();
  const { displayToast } = useToastNotification();

  const { mutate: deletePlugin } = useMutation({
    mutationFn: (id: string) =>
      gqlClient.request(DELETE_PLUGIN_MUTATION, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.MyPlugins, user),
      });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.MyPluginSubmissions, user),
      });
      displayToast('Plugin deleted');
    },
  });

  const { mutate: cancelSubmission } = useMutation({
    mutationFn: (id: string) =>
      gqlClient.request(CANCEL_PLUGIN_SUBMISSION_MUTATION, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.MyPluginSubmissions, user),
      });
    },
  });

  const onCancel = async (submission: PluginSubmission) => {
    if (submission.status === PluginSubmissionStatus.Pending) {
      const confirmed = await showPrompt({
        title: `Cancel ${submission.name}?`,
        description: 'The submission will be withdrawn from review.',
        okButton: { title: 'Withdraw', variant: ButtonVariant.Primary },
      });

      if (!confirmed) {
        return;
      }
    }

    cancelSubmission(submission.id);
  };

  const onDelete = async (plugin: Plugin) => {
    const confirmed = await showPrompt({
      title: `Delete ${plugin.name}?`,
      description:
        'It will be removed from the marketplace. This cannot be undone.',
      okButton: { title: 'Delete', variant: ButtonVariant.Primary },
    });

    if (confirmed) {
      deletePlugin(plugin.id);
    }
  };

  if (!plugins.length && !submissions.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {plugins.length > 0 && (
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Your plugins
          </Typography>
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex items-center justify-between gap-2 rounded-12 border border-border-subtlest-tertiary px-4 py-3"
            >
              <Link href={getMarketplacePluginUrl(plugin.id)} prefetch={false}>
                <a className="min-w-0 truncate typo-callout hover:underline">
                  {plugin.name}
                </a>
              </Link>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<EditIcon />}
                  onClick={() => onEdit(plugin)}
                  aria-label={`Edit ${plugin.name}`}
                />
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<TrashIcon />}
                  onClick={() => onDelete(plugin)}
                  aria-label={`Delete ${plugin.name}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {submissions.length > 0 && (
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Your submissions
          </Typography>
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="flex items-center justify-between gap-2 rounded-12 border border-border-subtlest-tertiary px-4 py-3"
            >
              <div className="flex min-w-0 flex-col">
                <Typography type={TypographyType.Callout} className="truncate">
                  {submission.name}
                </Typography>
                {submission.plugin && (
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    Update to {submission.plugin.name}
                  </Typography>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Typography
                  type={TypographyType.Footnote}
                  className={classNames(
                    'rounded-8 px-2 py-0.5',
                    submission.status === PluginSubmissionStatus.Rejected
                      ? 'bg-surface-float text-status-error'
                      : 'bg-surface-float text-text-tertiary',
                  )}
                >
                  {statusLabel[submission.status]}
                </Typography>
                <Button
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  onClick={() => onCancel(submission)}
                >
                  {submission.status === PluginSubmissionStatus.Pending
                    ? 'Cancel'
                    : 'Dismiss'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
