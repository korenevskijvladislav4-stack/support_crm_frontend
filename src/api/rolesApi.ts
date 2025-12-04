// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type { IRoleForm, IRole } from '../types/role.types';

export const rolesApi = createApi({
    reducerPath: 'rolesApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Roles'],
    endpoints: (builder) => ({
        getAllRoles: builder.query<IRole[], void>({
            query: () => ({
                url: '/roles',
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

export const { useGetAllRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDestroyRoleMutation } = rolesApi