// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { IGroupForm, IGroupResource } from '../types/groups.types';

export const groupsApi = createApi({
    reducerPath: 'groupsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Groups'],
    endpoints: (builder) => ({
        getAllGroups: builder.query<IGroupResource[], void>({
            query: () => ({
                url: '/groups',
            }),
            providesTags: ['Groups']
        }),
        destroyGroup: builder.mutation<void, number>({
            query: (id) => ({
                url:  `/groups/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Groups']
        }),
        createGroup: builder.mutation<void, IGroupForm>({
            query: (form) => ({
                url:  `/groups`,
                method: 'POST',
                body: form
            }),
            invalidatesTags: ['Groups']
        }),
        updateGroup: builder.mutation<void, { id: number; data: IGroupForm }>({
            query: ({ id, data }) => ({
                url: `/groups/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['Groups']
        }),
    }),
});

export const { useGetAllGroupsQuery, useDestroyGroupMutation, useCreateGroupMutation, useUpdateGroupMutation } = groupsApi