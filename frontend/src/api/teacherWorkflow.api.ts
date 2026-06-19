import { apiClient } from './api.client';
import {
  AgentWorkflowResponse,
  TeacherContextInput,
  TopicStatus,
} from '../types/teacherWorkflow.types';

/**
 * Data service for the Teacher Workflow module.
 * The agent itself ("planDeTrabajo" + "abanicoDeTemas") is still mocked server-side
 * (see backend/services/teacherWorkflowService.ts), but persistence is real:
 * every submission and topic decision is stored in Postgres via the API below.
 * Once the real agent is ready, only the backend service needs to change —
 * these signatures and the response shape stay the same.
 */
export const teacherWorkflowApi = {
  submitContext: async (input: TeacherContextInput): Promise<AgentWorkflowResponse> => {
    const { data } = await apiClient.post('/teacher-workflows', input);
    return data.data;
  },

  getCurrentWorkflow: async (): Promise<AgentWorkflowResponse | null> => {
    const { data } = await apiClient.get('/teacher-workflows/current');
    return data.data;
  },

  updateTopicStatus: async (topicId: string, estado: TopicStatus): Promise<AgentWorkflowResponse> => {
    const { data } = await apiClient.patch(`/teacher-workflows/topics/${topicId}`, { estado });
    return data.data;
  },
};
