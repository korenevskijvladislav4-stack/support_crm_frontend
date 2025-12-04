// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import type { IUser, IUserFilters, IUserForm, IUserModel, UsersResponse } from '../types/user.types';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';

export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        allUsers: builder.query<UsersResponse, IUserFilters>({
            query: (params) => ({
                url: `/users`,
                params
            }),
            providesTags: ['Users']
        }),
        getUser: builder.query<IUserModel, string>({
            query: (id) => ({
                url: `/users/${id}/edit`,
            })
        }),
        getShowUser: builder.query<IUser, string>({
            query: (id) => ({
                url: `/users/${id}/show`,
            })
        }),
        updateUser: builder.mutation<void, {form:IUserForm, id:string}>({
            query: ({form, id}) => ({
                url: `/users/${id}`,
                body: form,
                method: 'PATCH'
            }),
            invalidatesTags: ['Users'],
        }),
        destroyUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Users'],
        }),
        deactivateUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/users/${id}/deactivate`,
                method: 'POST'
            }),
            invalidatesTags: ['Users'],
        }),
        activateUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/users/${id}/activate`,
                method: 'POST'
            }),
            invalidatesTags: ['Users'],
        }),
        transferUserGroup: builder.mutation<void, { userId: number; newGroupId: number; transferDate: string }>({
            query: ({ userId, newGroupId, transferDate }) => ({
                url: `/users/${userId}/transfer-group`,
                method: 'POST',
                body: {
                    new_group_id: newGroupId,
                    transfer_date: transferDate
                }
            }),
            invalidatesTags: ['Users', 'Schedule'],
        }),
    }),
});

export const { 
    useAllUsersQuery, 
    useGetUserQuery, 
    useUpdateUserMutation, 
    useDestroyUserMutation, 
    useLazyAllUsersQuery, 
    useGetShowUserQuery,
    useDeactivateUserMutation,
    useActivateUserMutation,
    useTransferUserGroupMutation
} = usersApi