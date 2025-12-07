import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { 
    IScheduleForm, 
    ISchedule, 
    IScheduleFilterForm,
    IScheduleGenerationResponse,
    IScheduleGenerationStatus 
} from '../types/schedule.types';

export const scheduleApi = createApi({
    reducerPath: 'scheduleApi',
    tagTypes: ['Schedule', 'ScheduleGeneration'],
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        // baseQueryWithReauth уже автоматически разворачивает { data: ... }
        getSchedule: builder.query<ISchedule, IScheduleFilterForm>({
            query: ({ month, team_id, shift_type }) => ({
                url: '/schedule',
                params: { month, team_id, shift_type }
            }),
            providesTags: ['Schedule']
        }),
        
        // Запуск асинхронной генерации графика
        createSchedule: builder.mutation<IScheduleGenerationResponse, IScheduleForm>({
            query: (body) => ({
                url: '/schedule',
                body,
                method: 'POST'
            }),
        }),
        
        // Получить статус генерации
        getGenerationStatus: builder.query<IScheduleGenerationStatus, number>({
            query: (generationId) => `/schedule/generations/${generationId}`,
            providesTags: (_result, _error, id) => [{ type: 'ScheduleGeneration', id }],
        }),
        
        // Получить список генераций для команды
        getTeamGenerations: builder.query<IScheduleGenerationStatus[], number>({
            query: (teamId) => `/schedule/generations/team/${teamId}`,
            providesTags: ['ScheduleGeneration'],
        }),
    }),
});

export const { 
    useGetScheduleQuery, 
    useCreateScheduleMutation,
    useGetGenerationStatusQuery,
    useLazyGetGenerationStatusQuery,
    useGetTeamGenerationsQuery,
} = scheduleApi;