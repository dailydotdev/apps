import { useMutation } from 'react-query';
import request from 'graphql-request';
import {
  HIDE_POST_MUTATION,
  REPORT_POST_MUTATION,
  ReportReason,
} from '../graphql/posts';
import { apiUrl } from '../lib/config';

type UseReportPostRet = {
  reportPost: (variables: {
    id: string;
    reason: ReportReason;
    comment?: string;
  }) => Promise<void>;
  hidePost: (id: string) => Promise<void>;
};

export default function useReportPost(): UseReportPostRet {
  const { mutateAsync: reportPost } = useMutation<
    void,
    unknown,
    { id: string; reason: ReportReason; comment: string }
  >((variables) =>
    request(`${apiUrl}/graphql`, REPORT_POST_MUTATION, variables),
  );

  const { mutateAsync: hidePost } = useMutation<void, unknown, string>((id) =>
    request(`${apiUrl}/graphql`, HIDE_POST_MUTATION, { id }),
  );

  return { reportPost, hidePost };
}
