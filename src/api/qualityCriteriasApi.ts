import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { 
  IQualityCriteriaForm, 
  IQualityCriteria, 
  IQualityCriteriaCategory,
  IQualityCriteriaFilters,
  QualityCriteriaResponse 
} from '../types/quality-criteria.types';

export const qualityCriteriasApi = createApi({
    reducerPath: 'qualityCriteriasApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['QualityCriteria', 'QualityCriteriaCategory'],
    endpoints: (builder) => ({
    // Получить список с пагинацией и фильтрами
    getQualityCriterias: builder.query<QualityCriteriaResponse, IQualityCriteriaFilters>({
      query: (params) => ({
        url: '/quality-criteria',
        params
      }),
      providesTags: ['QualityCriteria'],
    }),

    // Получить все критерии без пагинации (для форм)
    getAllQualityCriterias: builder.query<IQualityCriteria[], { team_id?: number } | void>({
      query: (params) => ({
        url: '/quality-criteria',
        params: { all: true, ...params }
      }),
      providesTags: ['QualityCriteria'],
    }),

    createQualityCriteria: builder.mutation<IQualityCriteria, IQualityCriteriaForm>({
      query: (body) => ({
        url: '/quality-criteria',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QualityCriteria'],
    }),

    updateQualityCriteria: builder.mutation<IQualityCriteria, { id: number } & IQualityCriteriaForm>({
      query: ({ id, ...body }) => ({
        url: `/quality-criteria/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['QualityCriteria'],
    }),

    destroyQualityCriteria: builder.mutation<void, number>({
      query: (id) => ({
        url: `/quality-criteria/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QualityCriteria'],
    }),

    // Категории критериев качества
    getAllQualityCriteriaCategories: builder.query<IQualityCriteriaCategory[], void>({
      query: () => '/quality-criteria-categories',
      providesTags: ['QualityCriteriaCategory'],
    }),

    createQualityCriteriaCategory: builder.mutation<IQualityCriteriaCategory, { name: string }>({
      query: (body) => ({
        url: '/quality-criteria-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QualityCriteriaCategory'],
    }),
  }),
});

export const {
  useGetQualityCriteriasQuery,
  useLazyGetQualityCriteriasQuery,
  useGetAllQualityCriteriasQuery,
  useCreateQualityCriteriaMutation,
  useUpdateQualityCriteriaMutation,
  useDestroyQualityCriteriaMutation,
  useGetAllQualityCriteriaCategoriesQuery,
  useCreateQualityCriteriaCategoryMutation,
} = qualityCriteriasApi;
