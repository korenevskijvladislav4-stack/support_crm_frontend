// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type {
  IQualityDeduction,
  IQualityCallDeduction,
  IQualityMap,
  Team,
  User,
  ICreateQualityMapRequest,
  ICreateDeductionRequest,
  ICreateCallDeductionRequest,
  IUpdateChatIdsRequest,
  IUpdateCallIdsRequest,
  QualityMapListResponse,
  IQualityMapsFilter,
  QualityDeductionListResponse,
  IQualityDeductionsFilter
} from '../types/quality.types';
import type { IQualityCriteria } from '../types/quality-criteria.types';
import type { IApiResponse } from '../types/common.types';

export const qualityApi = createApi({
  reducerPath: 'qualitiesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Criterion', 'QualityMap', 'Users', 'QualityMapList'],
  endpoints: (builder) => ({
    // Критерии
    getCriteria: builder.query<IQualityCriteria[], { team_id?: number }>({
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

    createCriterion: builder.mutation<IQualityCriteria, Partial<IQualityCriteria>>({
      query: (body) => ({
        url: '/quality-criteria',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Criterion'],
    }),

    updateCriterion: builder.mutation<IQualityCriteria, { id: number; data: Partial<IQualityCriteria> }>({
      query: ({ id, data }) => ({
        url: `/quality-criteria/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Criterion'],
    }),

    // Карты качества
    createQualityMap: builder.mutation<IApiResponse<IQualityMap>, ICreateQualityMapRequest>({
      query: (body) => ({
        url: '/quality-maps',
        method: 'POST',
        body,
      }),
    }),

    getQualityMap: builder.query<IQualityMap, number>({
      query: (id) => `/quality-maps/${id}`,
      providesTags: ['QualityMap'],
    }),

    updateQualityMapChatIds: builder.mutation<IQualityMap, { id: number; data: IUpdateChatIdsRequest }>({
      query: ({ id, data }) => ({
        url: `/quality-maps/${id}/chat-ids`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['QualityMap'],
    }),

    updateQualityMapCallIds: builder.mutation<IQualityMap, { id: number; data: IUpdateCallIdsRequest }>({
      query: ({ id, data }) => ({
        url: `/quality-maps/${id}/call-ids`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['QualityMap'],
    }),

    // Снятия для чатов
    createDeduction: builder.mutation<IApiResponse<IQualityDeduction>, ICreateDeductionRequest>({
      query: (body) => ({
        url: '/quality-deductions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QualityMap'],
    }),

    // Снятия для звонков
    createCallDeduction: builder.mutation<IApiResponse<IQualityCallDeduction>, ICreateCallDeductionRequest>({
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
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          return response.data;
        }
        // Если ответ уже массив, возвращаем как есть
        if (Array.isArray(response)) {
          return response;
        }
        // Если ответ объект с data, но data не массив
        if (response && typeof response === 'object' && 'data' in response) {
          return Array.isArray(response.data) ? response.data : [];
        }
        return [];
      },
    }),

    // Команды (для селектов)
    getTeams: builder.query<Team[], void>({
      query: () => ({
        url: '/teams',
        params: { all: true }
      }),
    }),

    deleteQualityMap: builder.mutation<void, number>({
      query: (id) => ({
        url: `/quality-maps/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QualityMapList'],
    }),
    getQualityMaps: builder.query<QualityMapListResponse, IQualityMapsFilter>({
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

    getQualityDeductions: builder.query<QualityDeductionListResponse, IQualityDeductionsFilter>({
      query: (filters = {}) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        return `/quality-deductions?${params.toString()}`;
      },
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
  useGetQualityMapsQuery,
  useGetQualityDeductionsQuery
} = qualityApi;