import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherWorkflowApi } from '../api/teacherWorkflow.api';
import { TeacherContextInput, TopicStatus, WorkflowStatus } from '../types/teacherWorkflow.types';

const WORKFLOW_QUERY_KEY = ['teacher-workflow'];

/**
 * Single entry point the UI uses to drive the Context -> Agent -> Abanico flow.
 * Components never touch teacherWorkflowApi directly, so swapping the mock for
 * the real agent endpoint only requires changing teacherWorkflow.api.ts.
 */
export function useTeacherWorkflow() {
  const queryClient = useQueryClient();

  const workflowQuery = useQuery({
    queryKey: WORKFLOW_QUERY_KEY,
    queryFn: () => teacherWorkflowApi.getCurrentWorkflow(),
  });

  const submitContextMutation = useMutation({
    mutationFn: (input: TeacherContextInput) => teacherWorkflowApi.submitContext(input),
    onSuccess: (response) => {
      queryClient.setQueryData(WORKFLOW_QUERY_KEY, response);
    },
  });

  const updateTopicMutation = useMutation({
    mutationFn: ({ topicId, estado }: { topicId: string; estado: TopicStatus }) =>
      teacherWorkflowApi.updateTopicStatus(topicId, estado),
    onSuccess: (response) => {
      queryClient.setQueryData(WORKFLOW_QUERY_KEY, response);
    },
  });

  const status: WorkflowStatus = submitContextMutation.isPending
    ? 'SUBMITTING'
    : submitContextMutation.isError
    ? 'ERROR'
    : workflowQuery.data
    ? 'READY'
    : 'IDLE';

  return {
    status,
    workflow: workflowQuery.data ?? null,
    isLoadingWorkflow: workflowQuery.isLoading,
    submitContext: submitContextMutation.mutate,
    selectTopic: (topicId: string) => updateTopicMutation.mutate({ topicId, estado: 'SELECCIONADO' }),
    discardTopic: (topicId: string) => updateTopicMutation.mutate({ topicId, estado: 'DESCARTADO' }),
    resetTopic: (topicId: string) => updateTopicMutation.mutate({ topicId, estado: 'SUGERIDO' }),
    isUpdatingTopic: updateTopicMutation.isPending,
  };
}
