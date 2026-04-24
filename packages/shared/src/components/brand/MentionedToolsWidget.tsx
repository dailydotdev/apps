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
import { AuthTriggers } from '../../lib/auth';
import type { PublicProfile } from '../../lib/user';
import { useEngagementAdsContext } from '../../contexts/EngagementAdsContext';

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

/**
 * MentionedToolsWidget Component
 *
 * Displays tools from the matching engagement creative that users can add
 * to their profile. The sponsored tools appear first with special styling.
 */
export const MentionedToolsWidget = ({
  postTags,
  className,
}: MentionedToolsWidgetProps): ReactElement | null => {
  const router = useRouter();
  const { user, showLogin } = useAuthContext();
  const { getHighlightedWordConfig, hasAnySponsoredTag } =
    useBrandSponsorship();
  const { getCreativeForTags } = useEngagementAdsContext();
  const { displayToast } = useToastNotification();

  const { stackItems, add, remove } = useUserStack(user as PublicProfile);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToolName, setSelectedToolName] = useState<string | null>(null);

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

  // Extract tools from the matching creative
  const mentionedTools = useMemo(() => {
    const creative = getCreativeForTags(postTags);

    if (!creative?.tools?.length) {
      return [];
    }

    return creative.tools.map(
      (toolName): Tool => ({
        id: toolName,
        name: toolName,
        icon: creative.icon,
        isSponsored: true,
      }),
    );
  }, [postTags, getCreativeForTags]);

  const handleToolClick = useCallback(
    (tool: Tool) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.AddToStack });
        return;
      }

      if (isToolInStack(tool.name)) {
        router.push(`${webappUrl}${user.username}`);
        return;
      }

      setSelectedToolName(tool.name);
      setIsModalOpen(true);
    },
    [user, showLogin, isToolInStack, router],
  );

  const handleAddToStack = useCallback(
    async (input: AddUserStackInput) => {
      try {
        const result = await add(input);

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

  if (mentionedTools.length === 0) {
    return null;
  }

  const highlightedWordResult = getHighlightedWordConfig(postTags);

  return (
    <>
      <div
        className={classNames(
          'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4',
          className,
        )}
      >
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          Mentioned tools
        </Typography>

        <div className="flex flex-col gap-2">
          {mentionedTools.map((tool) => {
            const isSponsored =
              tool.isSponsored && hasAnySponsoredTag(postTags);
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
                    <div className="rounded size-6 flex-shrink-0 bg-surface-float" />
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
                        Powered by
                      </Typography>
                    )}
                  </div>
                </div>

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

            if (isSponsored && highlightedWordResult.config) {
              return (
                <Tooltip
                  key={tool.id}
                  content={
                    <SponsoredTooltip
                      config={highlightedWordResult.config}
                      brandName={highlightedWordResult.brandName}
                      brandLogo={highlightedWordResult.brandLogo}
                      colors={highlightedWordResult.colors}
                    />
                  }
                  side="left"
                  noArrow
                  className="!max-w-none !rounded-16 !bg-transparent !p-0"
                >
                  {toolItem}
                </Tooltip>
              );
            }

            return toolItem;
          })}
        </div>
      </div>

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
