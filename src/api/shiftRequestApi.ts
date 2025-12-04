import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';
import type {
  IShiftRequest,
  ICreateShiftRequest,
  ICreateDirectShiftRequest
} from '../types/shifts.types';

export const shiftRequestApi = createApi({
    reducerPath: 'shiftRequestApi',
    tagTypes: ['ShiftRequest', 'Schedule'],
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getShiftRequests: builder.query<IShiftRequest[], void>({
            query: () => ({
                url: '/shift-requests',
            }),
            providesTags: ['ShiftRequest'],
        }),
        createShiftRequest: builder.mutation<IShiftRequest, ICreateShiftRequest>({
            query: (body) => ({
                url: '/shift-requests',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ShiftRequest', 'Schedule'],
        }),
        approveShiftRequest: builder.mutation<IShiftRequest, number>({
            query: (id) => ({
                url: `/shift-requests/${id}/approve`,
                method: 'POST',
            }),
            invalidatesTags: ['ShiftRequest', 'Schedule'],
        }),
        rejectShiftRequest: builder.mutation<void, number>({
            query: (id) => ({
                url: `/shift-requests/${id}/reject`,
                method: 'POST',
            }),
            invalidatesTags: ['ShiftRequest', 'Schedule'],
        }),
        updateShift: builder.mutation<IShiftRequest, { id: number; duration: number }>({
            query: ({ id, duration }) => ({
                url: `/shift-requests/${id}`,
                method: 'PUT',
                body: { duration },
            }),
            invalidatesTags: ['ShiftRequest', 'Schedule'],
        }),
        deleteShift: builder.mutation<void, number>({
            query: (id) => ({
                url: `/shift-requests/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ShiftRequest', 'Schedule'],
        }),
        createDirectShift: builder.mutation<IShiftRequest, ICreateDirectShiftRequest>({
            query: (body) => ({
                url: '/shift-requests/create-direct',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ShiftRequest', 'Schedule'],
        }),
    }),
});

export const {
    useGetShiftRequestsQuery,
    useCreateShiftRequestMutation,
    useApproveShiftRequestMutation,
    useRejectShiftRequestMutation,
    useUpdateShiftMutation,
    useDeleteShiftMutation,
    useCreateDirectShiftMutation,
} = shiftRequestApi;

