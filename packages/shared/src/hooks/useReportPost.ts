import { useContext } from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import {
  HIDE_POST_MUTATION,
  REPORT_POST_MUTATION,
  ReportReason,
} from '../graphql/posts';
import { apiUrl } from '../lib/config';
import AuthContext from '../contexts/AuthContext';

type UseReportPostRet = {
  reportPost: (variables: {
    id: string;
    reason: ReportReason;
    comment?: string;
  }) => Promise<boolean>;
  hidePost: (id: string) => Promise<boolean>;
};

interface ReportPostProps {
  id: string;
  reason: ReportReason;
  comment: string;
}

export default function useReportPost(): UseReportPostRet {
  const { user, showLogin } = useContext(AuthContext);
  const { mutateAsync: reportPostAsync } = useMutation<
    void,
    unknown,
    ReportPostProps
  >((variables) =>
    request(`${apiUrl}/graphql`, REPORT_POST_MUTATION, variables),
  );

  const { mutateAsync: hidePostAsync } = useMutation<void, unknown, string>(
    (id) => request(`${apiUrl}/graphql`, HIDE_POST_MUTATION, { id }),
  );

  const reportPost = async (params: ReportPostProps) => {
    if (!user) {
      showLogin('report post');
      return false;
    }

    await reportPostAsync(params);

    return true;
  };

  const hidePost = async (id: string) => {
    if (!user) {
      showLogin('hide post');
      return false;
    }

    await hidePostAsync(id);

    return true;
  };

  return { reportPost, hidePost };
}
