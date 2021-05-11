import classed from '../../lib/classed';
import styled from '@emotion/styled';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import { tablet } from '../../styles/media';
import { typoCallout } from '../../styles/typography';
import { multilineTextOverflow } from '../../styles/helpers';

export const EmptyMessage = classed(
  'span',
  'typo-callout text-theme-label-tertiary',
);

export const CommentContainer = styled.article`
  display: flex;
  flex-direction: row;
  padding: ${sizeN(3)} 0;
  align-items: flex-start;

  ${tablet} {
    align-items: center;
  }
`;

export const commentInfoClass =
  'flex flex-col flex-1 ml-4 no-underline tablet:flex-row tablet:items-center';

export const CommentContent = styled.p`
  max-height: ${sizeN(15)};
  padding: 0;
  margin: 0;
  color: var(--theme-label-primary);
  word-break: break-word;
  white-space: pre-wrap;
  ${typoCallout}
  ${multilineTextOverflow}
  -webkit-line-clamp: 3;

  ${tablet} {
    flex: 1;
    margin-right: ${sizeN(6)};
    max-width: ${sizeN(77)};
  }
`;

export const CommentTime = classed(
  'time',
  'mt-2 text-theme-label-tertiary typo-subhead tablet:mt-0',
);
