// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { IQualityCriteriaForm, IQualityCriteria, IQualityCriteriaCategory } from '../types/qualityCriterias.types';

export const qualityCriteriasApi = createApi({
    reducerPath: 'qualityCriteriasApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['QualityCriteria', 'QualityCriteriaCategory'],
    endpoints: (builder) => ({
    getAllQualityCriterias: builder.query<IQualityCriteria[], void>({
      query: () => '/quality-criteria',
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
  useGetAllQualityCriteriasQuery,
  useCreateQualityCriteriaMutation,
  useUpdateQualityCriteriaMutation,
  useDestroyQualityCriteriaMutation,
  useGetAllQualityCriteriaCategoriesQuery,
  useCreateQualityCriteriaCategoryMutation,
} = qualityCriteriasApi;