import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { IGroupForm, IGroup, IGroupFilters, GroupsResponse, IGroupStatsFilters, GroupStatsResponse } from '../types/group.types';

export const groupsApi = createApi({
    reducerPath: 'groupsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Groups', 'GroupStats'],
    endpoints: (builder) => ({
        // Получить список с пагинацией и фильтрами
        getGroups: builder.query<GroupsResponse, IGroupFilters>({
            query: (params) => ({
                url: '/groups',
                params
            }),
            providesTags: ['Groups']
        }),
        // Получить все группы без пагинации (для селектов)
        getAllGroups: builder.query<IGroup[], void>({
            query: () => ({
                url: '/groups',
                params: { all: true }
            }),
            providesTags: ['Groups']
        }),
        // Получить статистику групп
        getGroupStats: builder.query<GroupStatsResponse, IGroupStatsFilters>({
            query: (params) => ({
                url: '/group-stats',
                params
            }),
            providesTags: ['GroupStats']
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

export const { 
    useGetGroupsQuery,
    useLazyGetGroupsQuery,
    useGetAllGroupsQuery,
    useGetGroupStatsQuery,
    useDestroyGroupMutation, 
    useCreateGroupMutation, 
    useUpdateGroupMutation 
} = groupsApi;
