// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type {
  ApiResponse,
  QualityCriterion,
  QualityDeduction,
  QualityCallDeduction,
  QualityMap,
  Team,
  User,
  CreateQualityMapRequest,
  CreateDeductionRequest,
  CreateCallDeductionRequest,
  UpdateChatIdsRequest,
  UpdateCallIdsRequest,
  QualityMapListResponse,
  QualityMapsFilter
} from '../types/quality.types';

export const qualityApi = createApi({
  reducerPath: 'qualitiesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Criterion', 'QualityMap', 'Users', 'QualityMapList'],
  endpoints: (builder) => ({
    // Критерии
    getCriteria: builder.query<QualityCriterion[], { team_id?: number }>({
      query: (filters = {}) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'string' && value !== '') {
              params.append(key, value);
            } else if (typeof value === 'number') {
              params.append(key, value.toString());
            }
          }
        });

        return `/quality-criteria?${params.toString()}`;
      },
      providesTags: ['Criterion'],
    }),

    createCriterion: builder.mutation<QualityCriterion, Partial<QualityCriterion>>({
      query: (body) => ({
        url: '/quality-criteria',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Criterion'],
    }),

    updateCriterion: builder.mutation<QualityCriterion, { id: number; data: Partial<QualityCriterion> }>({
      query: ({ id, data }) => ({
        url: `/quality-criteria/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Criterion'],
    }),

    // Карты качества
    createQualityMap: builder.mutation<ApiResponse<QualityMap>, CreateQualityMapRequest>({
      query: (body) => ({
        url: '/quality-maps',
        method: 'POST',
        body,
      }),
    }),

    getQualityMap: builder.query<QualityMap, number>({
      query: (id) => `/quality-maps/${id}`,
      providesTags: ['QualityMap'],
    }),

    updateQualityMapChatIds: builder.mutation<QualityMap, { id: number; data: UpdateChatIdsRequest }>({
      query: ({ id, data }) => ({
        url: `/quality-maps/${id}/chat-ids`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['QualityMap'],
    }),

    updateQualityMapCallIds: builder.mutation<QualityMap, { id: number; data: UpdateCallIdsRequest }>({
      query: ({ id, data }) => ({
        url: `/quality-maps/${id}/call-ids`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['QualityMap'],
    }),

    // Снятия для чатов
    createDeduction: builder.mutation<ApiResponse<QualityDeduction>, CreateDeductionRequest>({
      query: (body) => ({
        url: '/quality-deductions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QualityMap'],
    }),

    // Снятия для звонков
    createCallDeduction: builder.mutation<ApiResponse<QualityCallDeduction>, CreateCallDeductionRequest>({
      query: (body) => ({
        url: '/quality-call-deductions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QualityMap'],
    }),

    // Пользователи с фильтрацией по команде
    getUsersByTeam: builder.query<User[], number | null>({
      query: (teamId) => ({
        url: '/users',
        params: teamId ? { team: [teamId] } : {},
      }),
      providesTags: ['Users'],
      transformResponse: (response: unknown) => {
        // Если ответ содержит data, извлекаем массив
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        // Если ответ уже массив, возвращаем как есть
        if (Array.isArray(response)) {
          return response;
        }
        // Если ответ объект с data, но data не массив
        if (response && response.data) {
          return Array.isArray(response.data) ? response.data : [];
        }
        return [];
      },
    }),

    // Команды
    getTeams: builder.query<Team[], void>({
      query: () => '/teams',
    }),

    deleteQualityMap: builder.mutation<void, number>({
      query: (id) => ({
        url: `/quality-maps/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QualityMapList'],
    }),
    getQualityMaps: builder.query<QualityMapListResponse, QualityMapsFilter>({
      query: (filters = {}) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        return `/quality-maps?${params.toString()}`;
      },
      providesTags: ['QualityMapList'],
    }),

  }),
});

export const {
  useGetCriteriaQuery,
  useCreateCriterionMutation,
  useUpdateCriterionMutation,
  useCreateQualityMapMutation,
  useGetQualityMapQuery,
  useCreateDeductionMutation,
  useCreateCallDeductionMutation,
  useGetUsersByTeamQuery,
  useGetTeamsQuery,
  useUpdateQualityMapChatIdsMutation,
  useUpdateQualityMapCallIdsMutation,
  useDeleteQualityMapMutation,
  useGetQualityMapsQuery
} = qualityApi;