// app/api/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import type { IAuth, IRegistrationForm } from '../types/auth.types';
import type { IUserModel } from '../types/user.types';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Auth', 'Attempts'],
    endpoints: (builder) => ({
        signIn: builder.mutation<{ token: string }, IAuth>({
            query: (creds) => ({
                url: '/login',
                method: 'POST',
                body: creds,
            }),
        }),
        signOut: builder.mutation<void, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth']
        }),
        signUp: builder.mutation<void, IRegistrationForm>({
            query: (creds) => ({
                url: '/register',
                method: 'POST',
                body: creds,
            }),
            invalidatesTags: ['Attempts']
        }),
        currentUser: builder.query<IUserModel, void>({
            query: () => ({
                url: '/user',
            }),
            providesTags: ['Auth']
        }),
    }),
});

export const { useSignInMutation, useSignOutMutation,useCurrentUserQuery, useSignUpMutation } = authApi