import { gql } from 'graphql-request';
import { EmptyResponse } from './graphql/emptyResponse';
import { gqlClient } from './graphql/common';

export enum ReportEntity {
  Post = 'post',
  Source = 'source',
}

export enum CommonReportReason {
  Nsfw = 'NSFW',
  Other = 'OTHER',
}

export enum PostReportReason {
  Broken = 'BROKEN',
  Clickbait = 'CLICKBAIT',
  Low = 'LOW',
  Irrelevant = 'IRRELEVANT',
}

export enum SourceReportReason {
  Spam = 'SPAM',
  Bullying = 'BULLYING',
  Hateful = 'HATEFUL',
  Copyright = 'COPYRIGHT',
  Privacy = 'PRIVACY',
  Miscategorized = 'MISCATEGORIZED',
  Illegal = 'ILLEGAL',
}

export type PostReportReasonType = PostReportReason | CommonReportReason;
export type SourceReportReasonType = SourceReportReason | CommonReportReason;

export type ReportReason =
  | PostReportReason
  | SourceReportReason
  | CommonReportReason;

export const SEND_REPORT_MUTATION = gql`
  mutation SendReport(
    $type: ReportEntity!
    $id: ID!
    $reason: ReportReason!
    $comment: String
    $tags: [String]
  ) {
    sendReport(
      type: $type
      id: $id
      reason: $reason
      comment: $comment
      tags: $tags
    ) {
      _
    }
  }
`;

interface SendReportProps<T extends ReportReason> {
  type: ReportEntity;
  id: string;
  reason: T;
  comment?: string;
  tags?: string[];
}

export const sendReport = <T extends ReportReason>(
  params: SendReportProps<T>,
): Promise<EmptyResponse> => gqlClient.request(SEND_REPORT_MUTATION, params);
