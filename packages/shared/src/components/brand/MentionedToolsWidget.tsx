import type { ReactElement } from 'react';
import React, { useMemo, useCallback, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { VIcon, PlusIcon } from '../icons';
import { IconSize } from '../Icon';
import { useToastNotification } from '../../hooks/useToastNotification';
import { Tooltip } from '../tooltip/Tooltip';
import { SponsoredTooltip } from './SponsoredTooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUserStack } from '../../features/profile/hooks/useUserStack';
import { UserStackModal } from '../../features/profile/components/stack/UserStackModal';
import type { AddUserStackInput } from '../../graphql/user/userStack';
import { webappUrl } from '../../lib/constants';

interface Tool {
  id: string;
  name: string;
  icon?: string;
  isSponsored?: boolean;
}

interface MentionedToolsWidgetProps {
  postTags: string[];
  className?: string;
}

// Mock tool data based on common developer tools
// In production, this would come from post content analysis
const TOOL_DATABASE: Record<string, Tool> = {
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    icon: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
  },
  vscode: {
    id: 'vscode',
    name: 'VS Code',
    icon: 'https://code.visualstudio.com/favicon.ico',
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    icon: 'https://cursor.sh/favicon.ico',
  },
  react: {
    id: 'react',
    name: 'React',
    icon: 'https://react.dev/favicon.ico',
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'https://www.typescriptlang.org/favicon-32x32.png',
  },
  nodejs: {
    id: 'nodejs',
    name: 'Node.js',
    icon: 'https://nodejs.org/static/images/favicons/favicon.png',
  },
  docker: {
    id: 'docker',
    name: 'Docker',
    icon: 'https://www.docker.com/wp-content/uploads/2024/02/cropped-docker-logo-favicon-32x32.png',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: 'https://github.githubassets.com/favicons/favicon.svg',
  },
};

// Map tags to tools
const TAG_TO_TOOL: Record<string, string> = {
  ai: 'copilot',
  copilot: 'copilot',
  'github-copilot': 'copilot',
  'machine-learning': 'copilot',
  llm: 'copilot',
  vscode: 'vscode',
  'visual-studio-code': 'vscode',
  cursor: 'cursor',
  react: 'react',
  reactjs: 'react',
  typescript: 'typescript',
  ts: 'typescript',
  nodejs: 'nodejs',
  node: 'nodejs',
  docker: 'docker',
  containers: 'docker',
  github: 'github',
  git: 'github',
};

/**
 * MentionedToolsWidget Component
 *
 * Displays tools mentioned in the article that users can add to their profile.
 * The sponsored tool appears first with special styling.
 */
export const MentionedToolsWidget = ({
  postTags,
  className,
}: MentionedToolsWidgetProps): ReactElement | null => {
  const router = useRouter();
  const { user, showLogin } = useAuthContext();
  const { activeBrand, isTagSponsored, getHighlightedWordConfig } =
    useBrandSponsorship();
  const { displayToast } = useToastNotification();

  const { stackItems, add, remove } = useUserStack(user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToolName, setSelectedToolName] = useState<string | null>(null);

  // Check if a tool is already in the user's stack
  const isToolInStack = useCallback(
    (toolName: string): boolean => {
      return stackItems.some(
        (item) =>
          item.tool.title.toLowerCase() === toolName.toLowerCase() ||
          item.title?.toLowerCase() === toolName.toLowerCase(),
      );
    },
    [stackItems],
  );

  // Extract tools from post tags
  const mentionedTools = useMemo(() => {
    const toolSet = new Set<string>();
    const tools: Tool[] = [];

    // Add the sponsored tool first only when the post has a sponsored tag
    const hasSponsoredTag =
      activeBrand && postTags.some((tag) => isTagSponsored(tag));
    if (hasSponsoredTag) {
      const sponsoredTool = TOOL_DATABASE.copilot;
      if (sponsoredTool) {
        tools.push({ ...sponsoredTool, isSponsored: true });
        toolSet.add(sponsoredTool.id);
      }
    }

    // Add tools based on post tags
    postTags.forEach((tag) => {
      const toolId = TAG_TO_TOOL[tag.toLowerCase()];
      if (toolId && !toolSet.has(toolId)) {
        const tool = TOOL_DATABASE[toolId];
        if (tool) {
          tools.push(tool);
          toolSet.add(toolId);
        }
      }
    });

    return tools;
  }, [postTags, activeBrand, isTagSponsored]);

  const handleToolClick = useCallback(
    (tool: Tool) => {
      if (!user) {
        showLogin({ trigger: 'add_to_stack' });
        return;
      }

      // If tool is already in stack, navigate to profile
      if (isToolInStack(tool.name)) {
        router.push(`${webappUrl}${user.username}`);
        return;
      }

      // Open the modal to add the tool
      setSelectedToolName(tool.name);
      setIsModalOpen(true);
    },
    [user, showLogin, isToolInStack, router],
  );

  const handleAddToStack = useCallback(
    async (input: AddUserStackInput) => {
      try {
        const result = await add(input);

        // Store the added item info for potential undo
        // The result contains the newly created item
        const newItemId = result?.id;
        const toolName = input.title;

        displayToast(`Added ${toolName} to your stack`, {
          action: newItemId
            ? {
                onClick: async () => {
                  try {
                    await remove(newItemId);
                    displayToast(`Removed ${toolName} from your stack`);
                  } catch (error) {
                    displayToast('Failed to undo');
                  }
                },
                copy: 'Undo',
              }
            : undefined,
        });
      } catch (error) {
        displayToast('Failed to add to stack');
        throw error;
      }
    },
    [add, remove, displayToast],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedToolName(null);
  }, []);

  // Don't render if no tools found
  if (mentionedTools.length === 0) {
    return null;
  }

  const highlightedWordResult = getHighlightedWordConfig();

  return (
    <>
      <div
        className={classNames(
          'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4',
          className,
        )}
      >
        {/* Header */}
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          Mentioned tools
        </Typography>

        {/* Tool list */}
        <div className="flex flex-col gap-2">
          {mentionedTools.map((tool) => {
            const isSponsored = tool.isSponsored && activeBrand;
            const isInStack = isToolInStack(tool.name);

            const toolItem = (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool)}
                className="group flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-12 px-3 text-left transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-center gap-2">
                  {tool.icon ? (
                    <img
                      src={tool.icon}
                      alt=""
                      className="size-6 flex-shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="size-6 flex-shrink-0 rounded bg-surface-float" />
                  )}
                  <div className="flex flex-col">
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Primary}
                      bold
                    >
                      {tool.name}
                    </Typography>
                    {isSponsored && (
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        Sponsored
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Action button / status */}
                {isInStack ? (
                  <div className="flex items-center gap-1 text-accent-avocado-default">
                    <VIcon size={IconSize.Small} />
                    <Typography
                      type={TypographyType.Caption1}
                      className="text-accent-avocado-default"
                    >
                      Added
                    </Typography>
                  </div>
                ) : (
                  <PlusIcon
                    size={IconSize.Small}
                    className="text-text-tertiary"
                  />
                )}
              </button>
            );

            // Wrap sponsored tool with tooltip
            if (isSponsored && activeBrand && highlightedWordResult.config) {
              return (
                <Tooltip
                  key={tool.id}
                  content={
                    <SponsoredTooltip
                      config={highlightedWordResult.config}
                      brandName={activeBrand.name}
                      brandLogo={activeBrand.logo}
                      colors={activeBrand.colors}
                    />
                  }
                  side="left"
                  className="no-arrow !max-w-none !rounded-16 !bg-transparent !p-0"
                >
                  {toolItem}
                </Tooltip>
              );
            }

            return toolItem;
          })}
        </div>
      </div>

      {/* Add to Stack Modal */}
      {isModalOpen && (
        <UserStackModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSubmit={handleAddToStack}
          defaultTitle={selectedToolName || undefined}
          modalTitle="Add stack/tool to profile"
        />
      )}
    </>
  );
};

export default MentionedToolsWidget;
