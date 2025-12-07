import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { IRoleForm, IRole, IRoleFilters, RolesResponse } from '../types/role.types';

export const rolesApi = createApi({
    reducerPath: 'rolesApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Roles'],
    endpoints: (builder) => ({
        // Получить список с пагинацией и фильтрами
        getRoles: builder.query<RolesResponse, IRoleFilters>({
            query: (params) => ({
                url: '/roles',
                params
            }),
            providesTags: ['Roles']
        }),
        // Получить все роли без пагинации (для селектов)
        getAllRoles: builder.query<IRole[], void>({
            query: () => ({
                url: '/roles',
                params: { all: true }
            }),
            providesTags: ['Roles']
        }),
        createRole: builder.mutation<void, IRoleForm>({
            query: (form) => ({
                url: '/roles',
                method: 'POST',
                body: form
            }),
            invalidatesTags: ['Roles']
        }),
        updateRole: builder.mutation<void, { id: number; data: IRoleForm }>({
            query: ({ id, data }) => ({
                url: `/roles/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['Roles']
        }),
        destroyRole: builder.mutation<void, number>({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Roles']
        }),
    }),
});

export const { 
    useGetRolesQuery,
    useLazyGetRolesQuery,
    useGetAllRolesQuery, 
    useCreateRoleMutation, 
    useUpdateRoleMutation, 
    useDestroyRoleMutation 
} = rolesApi;
