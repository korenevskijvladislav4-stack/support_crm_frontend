// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';

export const permissionsApi = createApi({
    reducerPath: 'permissionsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Permissions'],
    endpoints: (builder) => ({
        getAllPermissions: builder.query<string[], void>({
            query: () => ({
                url: '/permissions',
            }),
            providesTags: ['Permissions']
        }),
    }),
});

export const { useGetAllPermissionsQuery } = permissionsApi