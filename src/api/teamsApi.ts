// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { ITeamForm, ITeam } from '../types/teams.type';

export const teamsApi = createApi({
    reducerPath: 'teamsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Teams'],
    endpoints: (builder) => ({
        getAllTeams: builder.query<ITeam[], void>({
            query: () => ({
                url: '/teams',
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

export const { useGetAllTeamsQuery, useCreateTeamMutation, useUpdateTeamMutation, useDestroyTeamMutation } = teamsApi