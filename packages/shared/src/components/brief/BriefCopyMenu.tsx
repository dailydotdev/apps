import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CopyIcon, DocsIcon, LinkIcon } from '../icons';
import { MenuIcon } from '../MenuIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { MenuItemProps } from '../dropdown/common';
import type { Post } from '../../graphql/posts';
import { useCopyText } from '../../hooks/useCopy';
import { useSharePost } from '../../hooks/useSharePost';
import { useShareCopyIcon } from '../../hooks/useShareCopyIcon';
import { useLogContext } from '../../contexts/LogContext';
import { usePostLogEvent } from '../../lib/feed';
import { LogEvent } from '../../lib/log';
import type { Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

export interface BriefCopyMenuProps {
  post: Post;
  origin: Origin;
  buttonSize?: ButtonSize;
  buttonVariant?: ButtonVariant;
  className?: string;
  label?: string;
}

// Copy affordances for a single briefing / digest post: the link itself, the
// generated summary, and a ready-to-paste title + link snippet. Grouped in a
// menu so a dense list row only grows by one control.
export const BriefCopyMenu = ({
  post,
  origin,
  buttonSize = ButtonSize.Small,
  buttonVariant = ButtonVariant.Tertiary,
  className,
  label = 'Copy',
}: BriefCopyMenuProps): ReactElement => {
  const { copyLink } = useSharePost(origin);
  const [, copyText] = useCopyText();
  const showCopyIcon = useShareCopyIcon();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();

  // Text copies log CopyText + a content discriminator so the three menu
  // actions stay distinguishable in analytics (copy link logs CopyLink via the
  // shared post-share path).
  const logCopyText = (content: 'summary' | 'title_link') =>
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider: ShareProvider.CopyText, origin, content },
      }),
    );

  const link = post.commentsPermalink;
  const options: MenuItemProps[] = [
    {
      icon: <MenuIcon Icon={showCopyIcon ? CopyIcon : LinkIcon} />,
      label: 'Copy link',
      action: () => copyLink({ post }),
    },
    ...(post.summary
      ? [
          {
            icon: <MenuIcon Icon={DocsIcon} />,
            label: 'Copy summary',
            action: () => {
              logCopyText('summary');
              copyText({
                textToCopy: post.summary,
                message: '✅ Copied summary to clipboard',
              });
            },
          },
        ]
      : []),
    {
      icon: <MenuIcon Icon={CopyIcon} />,
      label: 'Copy title and link',
      action: () => {
        logCopyText('title_link');
        copyText({
          textToCopy: `${post.title ?? ''}\n${link ?? ''}`.trim(),
          message: '✅ Copied to clipboard',
        });
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger tooltip={{ content: label }} asChild>
        <Button
          type="button"
          className={classNames('justify-center', className)}
          size={buttonSize}
          variant={buttonVariant}
          aria-label={label}
          icon={showCopyIcon ? <CopyIcon /> : <LinkIcon />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
