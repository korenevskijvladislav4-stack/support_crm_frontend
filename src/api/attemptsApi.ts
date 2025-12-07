// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { IAttempt, IAttemptForm, IAttemptsFilter, AttemptsResponse } from '../types/attempt.types';

export const attemptsApi = createApi({
    reducerPath: 'attemptsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Attempts'],
    endpoints: (builder) => ({
        allAttempts: builder.query<AttemptsResponse, IAttemptsFilter>({
            query: (filters = {}) => {
                const params = new URLSearchParams();

                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        // Для boolean значений преобразуем в строку "true" или "false"
                        if (typeof value === 'boolean') {
                            params.append(key, value ? 'true' : 'false');
                        } else {
                            params.append(key, value.toString());
                        }
                    }
                });

                return `/attempts?${params.toString()}`;
            },
            providesTags:['Attempts']
        }),
        getAttempt: builder.query<IAttempt, string>({
            query: (id) => ({
                url:  `/attempts/${id}`,
            }),
        }),
        approveAttempt: builder.mutation<void, { id: string; body: IAttemptForm }>({
            query: ({body, id}) => ({
                url:  `/attempts/${id}/approve`,
                body,
                method: 'POST',
            }),
            invalidatesTags: ['Attempts']
        }),
        destroyAttempt: builder.mutation<void, number>({
            query: (id) => ({
                url:  `/attempts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Attempts']
        }),
    }),
});

export const { 
    useAllAttemptsQuery, 
    useLazyAllAttemptsQuery,
    useGetAttemptQuery, 
    useApproveAttemptMutation, 
    useDestroyAttemptMutation 
} = attemptsApi