import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  HIDE_POST_MUTATION,
  REPORT_POST_MUTATION,
  UNHIDE_POST_MUTATION,
} from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import type { BooleanPromise } from '../components/filters/common';
import { AuthTriggers } from '../lib/auth';
import { useRequestProtocol } from './useRequestProtocol';
import { gqlClient } from '../graphql/common';
import type { ReportReason } from '../report';

type UseReportPostRet = {
  reportPost: (variables: {
    id: string;
    reason: ReportReason;
    comment?: string;
    tags?: string[];
  }) => BooleanPromise;
  hidePost: (id: string) => BooleanPromise;
  unhidePost: (id: string) => BooleanPromise;
};

interface ReportPostProps {
  id: string;
  reason: ReportReason;
  comment: string;
}

export default function useReportPost(): UseReportPostRet {
  const { user, showLogin } = useContext(AuthContext);
  const { requestMethod } = useRequestProtocol();
  const { mutateAsync: reportPostAsync } = useMutation<
    void,
    unknown,
    ReportPostProps
  >({
    mutationFn: (variables) => requestMethod(REPORT_POST_MUTATION, variables),
  });

  const { mutateAsync: hidePostAsync } = useMutation<void, unknown, string>({
    mutationFn: (id) => gqlClient.request(HIDE_POST_MUTATION, { id }),
  });

  const { mutateAsync: unhidePostAsync } = useMutation<void, unknown, string>({
    mutationFn: (id) => gqlClient.request(UNHIDE_POST_MUTATION, { id }),
  });

  const reportPost = async (params: ReportPostProps) => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.ReportPost });
      return { successful: false };
    }

    await reportPostAsync(params);

    return { successful: true };
  };

  const hidePost = async (id: string) => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.HidePost });
      return { successful: false };
    }

    await hidePostAsync(id);

    return { successful: true };
  };

  const unhidePost = async (id: string) => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.HidePost });
      return { successful: false };
    }

    await unhidePostAsync(id);

    return { successful: true };
  };

  return { reportPost, hidePost, unhidePost };
}
