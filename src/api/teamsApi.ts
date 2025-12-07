import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { ITeamForm, ITeam, ITeamFilters, TeamsResponse } from '../types/team.types';

export const teamsApi = createApi({
    reducerPath: 'teamsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Teams'],
    endpoints: (builder) => ({
        // Получить список с пагинацией и фильтрами
        getTeams: builder.query<TeamsResponse, ITeamFilters>({
            query: (params) => ({
                url: '/teams',
                params
            }),
            providesTags: ['Teams']
        }),
        // Получить все команды без пагинации (для селектов)
        getAllTeams: builder.query<ITeam[], void>({
            query: () => ({
                url: '/teams',
                params: { all: true }
            }),
            providesTags: ['Teams']
        }),
        createTeam: builder.mutation<void, ITeamForm>({
            query: (form) => ({
                url: '/teams',
                method: 'POST',
                body: form
            }),
            invalidatesTags: ['Teams']
        }),
        updateTeam: builder.mutation<void, { id: number; data: ITeamForm }>({
            query: ({ id, data }) => ({
                url: `/teams/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['Teams']
        }),
        destroyTeam: builder.mutation<void, number>({
            query: (id) => ({
                url: `/teams/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Teams']
        }),
    }),
});

export const { 
    useGetTeamsQuery,
    useLazyGetTeamsQuery,
    useGetAllTeamsQuery, 
    useCreateTeamMutation, 
    useUpdateTeamMutation, 
    useDestroyTeamMutation 
} = teamsApi;
