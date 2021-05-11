import {
  HIDE_POST_MUTATION,
  REPORT_POST_MUTATION,
  ReportReason,
} from '../graphql/posts';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';

type UseReportPostRet = {
  reportPost: (variables: {
    id: string;
    reason: ReportReason;
  }) => Promise<void>;
  hidePost: (id: string) => Promise<void>;
};

export default function useReportPost(): UseReportPostRet {
  const { mutateAsync: reportPost } = useMutation<
    void,
    unknown,
    { id: string; reason: ReportReason }
  >((variables) =>
    request(`${apiUrl}/graphql`, REPORT_POST_MUTATION, variables),
  );

  const { mutateAsync: hidePost } = useMutation<void, unknown, string>((id) =>
    request(`${apiUrl}/graphql`, HIDE_POST_MUTATION, { id }),
  );

  return { reportPost, hidePost };
}
