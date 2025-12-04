// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { IScheduleForm, ISchedule, IScheduleFilterForm } from '../types/schedule.types';

export const scheduleApi = createApi({
    reducerPath: 'scheduleApi',
    tagTypes: ['Schedule'],
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getSchedule: builder.query<ISchedule, IScheduleFilterForm>({
            query: ({ month, team_id, shift_type}) => ({
                url: '/schedule',
                params:{
                    month,
                    team_id,
                    shift_type
                }
            }),
            providesTags: ['Schedule']
        }),
        createSchedule: builder.mutation<void, IScheduleForm>({
            query: (body) => ({
                url: '/schedule',
                body,
                method: 'POST'
            }),
            invalidatesTags: ['Schedule']
        }),
    }),
});

export const { useGetScheduleQuery, useCreateScheduleMutation } = scheduleApi