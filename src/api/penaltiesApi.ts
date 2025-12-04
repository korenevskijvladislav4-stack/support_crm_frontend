import { createApi } from '@reduxjs/toolkit/query/react';
import type { IPenalty, IPenaltyForm, PenaltyStatus, PenaltiesResponse, IPenaltiesFilter } from '../types/penalty.types';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';

export const penaltiesApi = createApi({
    reducerPath: 'penaltiesApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Penalties'],
    endpoints: (builder) => ({
        getPenalties: builder.query<PenaltiesResponse, IPenaltiesFilter>({
            query: (filters = {}) => {
                const params = new URLSearchParams();

                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        params.append(key, value.toString());
                    }
                });

                return `/penalties?${params.toString()}`;
            },
            providesTags: ['Penalties']
        }),
        getPenalty: builder.query<IPenalty, number>({
            query: (id) => ({
                url: `/penalties/${id}`,
            }),
            providesTags: ['Penalties']
        }),
        createPenalty: builder.mutation<IPenalty, IPenaltyForm>({
            query: (form) => ({
                url: `/penalties`,
                method: 'POST',
                body: form
            }),
            invalidatesTags: ['Penalties'],
        }),
        updatePenalty: builder.mutation<IPenalty, { id: number; form: IPenaltyForm }>({
            query: ({ id, form }) => ({
                url: `/penalties/${id}`,
                method: 'PATCH',
                body: form
            }),
            invalidatesTags: ['Penalties'],
        }),
        approvePenalty: builder.mutation<IPenalty, number>({
            query: (id) => ({
                url: `/penalties/${id}/approve`,
                method: 'POST'
            }),
            invalidatesTags: ['Penalties'],
        }),
        rejectPenalty: builder.mutation<IPenalty, number>({
            query: (id) => ({
                url: `/penalties/${id}/reject`,
                method: 'POST'
            }),
            invalidatesTags: ['Penalties'],
        }),
    }),
});

export const {
    useGetPenaltiesQuery,
    useGetPenaltyQuery,
    useCreatePenaltyMutation,
    useUpdatePenaltyMutation,
    useApprovePenaltyMutation,
    useRejectPenaltyMutation,
} = penaltiesApi;

