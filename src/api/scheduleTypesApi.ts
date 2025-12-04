// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { IScheduleType } from '../types/schedule-type.types';

export const scheduleTypesApi = createApi({
    reducerPath: 'scheduleTypesApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getAllScheduleTypes: builder.query<IScheduleType[], void>({
            query: () => ({
                url: '/schedule_types',
            }),
        }),
    }),
});

export const { useGetAllScheduleTypesQuery } = scheduleTypesApi