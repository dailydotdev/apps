import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { CopyIcon, ArrowIcon } from '../../../components/icons';
import Link from '../../../components/utilities/Link';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId } from '../../../lib/log';
import { plusUrl, webappUrl } from '../../../lib/constants';

const REPO_URL = 'https://github.com/dailydotdev/daily.git';

interface InstallMethod {
  tool: string;
  description: string;
  code?: string;
  multilineCode?: boolean;
  copyValue?: string;
  steps?: string[];
  note?: string;
}

const methods: InstallMethod[] = [
  {
    tool: 'OpenClaw',
    description: 'Copy this instruction to your agent to get started:',
    code: 'Install daily-dev-ask from clawhub and ask about my topic',
    copyValue: 'Install daily-dev-ask from clawhub and ask about my topic',
  },
  {
    tool: 'Claude Code',
    description:
      'Add daily.dev to Claude Code as a plugin, then use /daily-dev-ask:',
    code: [
      `claude plugin marketplace add ${REPO_URL}`,
      'claude plugin install daily.dev@daily.dev',
      'claude "/daily-dev-ask your question here"',
    ].join('\n'),
    multilineCode: true,
    copyValue: [
      `claude plugin marketplace add ${REPO_URL}`,
      'claude plugin install daily.dev@daily.dev',
      'claude "/daily-dev-ask your question here"',
    ].join(' && '),
    note: 'After setup, use /daily-dev-ask to search and answer questions from daily.dev articles.',
  },
  {
    tool: 'Codex',
    description: 'Install the daily-dev-ask skill in Codex with this command:',
    code: `$skill-installer install the daily-dev-ask skill from ${REPO_URL}`,
    copyValue: `$skill-installer install the daily-dev-ask skill from ${REPO_URL}`,
    note: 'Restart Codex after installation, then use $daily-dev-ask.',
  },
  {
    tool: 'Cursor',
    description: 'Add daily.dev as a remote skill in Cursor:',
    steps: [
      'Open Cursor Settings -> Rules (Cmd+Shift+J on Mac, Ctrl+Shift+J on Windows/Linux)',
      'Click "Add Rule" -> "Remote Rule (Github)"',
      'Enter the repository URL below',
    ],
    code: REPO_URL,
    copyValue: REPO_URL,
    note: 'Use /daily-dev-ask in Agent chat to search and answer questions.',
  },
];

export const AskInstall = (): ReactElement => {
  const { displayToast } = useToastNotification();
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const handleToggleTool = (tool: string) => {
    const isExpanding = expandedTool !== tool;
    setExpandedTool(isExpanding ? tool : null);
    if (isExpanding) {
      logEvent({
        event_name: LogEvent.Click,
        target_id: TargetId.AskPage,
        extra: JSON.stringify({ install_tool: tool }),
      });
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      displayToast('Copied to clipboard');
    } catch {
      displayToast('Failed to copy');
    }
  };

  return (
    <FlexCol className="gap-4">
      <Typography type={TypographyType.Title3} bold center>
        Get started
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        center
      >
        {isPlus ? (
          <>
            You&apos;ll need an{' '}
            <Link href={`${webappUrl}settings/api`} passHref>
              <a className="font-bold text-text-primary underline">API token</a>
            </Link>
            . Pick your tool and install in seconds.
          </>
        ) : (
          <>
            Requires a{' '}
            <Link href={plusUrl} passHref>
              <a className="font-bold text-text-primary underline">
                Plus subscription
              </a>
            </Link>{' '}
            and an{' '}
            <Link href={`${webappUrl}settings/api`} passHref>
              <a className="font-bold text-text-primary underline">API token</a>
            </Link>
            . Pick your tool and install in seconds.
          </>
        )}
      </Typography>
      <div className="flex flex-col gap-3">
        {methods.map((method) => {
          const isExpanded = expandedTool === method.tool;

          return (
            <div
              key={method.tool}
              className="flex flex-col rounded-12 border border-border-subtlest-tertiary p-4"
            >
              <button
                type="button"
                onClick={() => handleToggleTool(method.tool)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between rounded-8 py-1 text-left"
              >
                <Typography type={TypographyType.Callout} bold>
                  {method.tool}
                </Typography>
                <ArrowIcon
                  className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform ${
                    isExpanded ? 'rotate-180' : 'rotate-90'
                  }`}
                />
              </button>

              <div
                className={`flex flex-col overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? 'mt-3 max-h-[600px] gap-3 opacity-100'
                    : 'mt-0 max-h-0 gap-0 opacity-0'
                }`}
              >
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  {method.description}
                </Typography>
                {method.steps && (
                  <ol className="list-inside list-decimal text-text-tertiary typo-callout">
                    {method.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}
                {method.code && method.copyValue && (
                  <div className="flex items-start gap-2 rounded-12 bg-surface-float p-3">
                    <code
                      className={`min-w-0 flex-1 break-words text-text-tertiary ${
                        method.multilineCode ? 'whitespace-pre-wrap' : ''
                      }`}
                    >
                      {method.code}
                    </code>
                    <Button
                      variant={ButtonVariant.Tertiary}
                      size={ButtonSize.Small}
                      icon={<CopyIcon />}
                      onClick={() => handleCopy(method.copyValue as string)}
                      className="shrink-0"
                    />
                  </div>
                )}
                {method.note && (
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Tertiary}
                  >
                    {method.note}
                  </Typography>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </FlexCol>
  );
};
