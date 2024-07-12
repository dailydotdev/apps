import React, { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { PREVIEW_COMMENT_MUTATION } from '../../graphql/comments';
import Markdown from '../Markdown';
import { useBackgroundRequest } from '../../hooks/companion';

export interface MarkdownPreviewProps {
  input: string;
  sourceId: string;
  parentSelector?: () => HTMLElement;
  enabled?: boolean;
}

interface QueryResult {
  preview: string;
}

function MarkdownPreview({
  input,
  sourceId,
  parentSelector,
  enabled = true,
}: MarkdownPreviewProps): ReactElement {
  const { requestMethod, isCompanion } = useRequestProtocol();
  const query = ['markdown_preview', input];
  const { data: previewContent } = useQuery<QueryResult>(
    query,
    () =>
      requestMethod(
        PREVIEW_COMMENT_MUTATION,
        { content: input, sourceId },
        { requestKey: isCompanion ? JSON.stringify(query) : undefined },
      ),
    { enabled: input?.length > 0 && enabled },
  );

  useBackgroundRequest(query, { enabled: input?.length > 0 && enabled });

  return (
    <Markdown
      content={previewContent?.preview}
      appendTooltipTo={parentSelector}
    />
  );
}

export default MarkdownPreview;
