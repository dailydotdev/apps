import React, { ReactElement } from 'react';
import { useQuery } from 'react-query';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import { graphqlUrl } from '../../lib/config';
import { PREVIEW_COMMENT_MUTATION } from '../../graphql/comments';
import Markdown from '../Markdown';

export interface MarkdownPreviewProps {
  input: string;
  sourceId: string;
  parentSelector: () => HTMLElement;
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
        graphqlUrl,
        PREVIEW_COMMENT_MUTATION,
        { content: input, sourceId },
        { requestKey: isCompanion ? JSON.stringify(query) : undefined },
      ),
    { enabled: input?.length > 0 && enabled },
  );

  return (
    <Markdown
      content={previewContent?.preview}
      appendTooltipTo={parentSelector}
    />
  );
}

export default MarkdownPreview;
