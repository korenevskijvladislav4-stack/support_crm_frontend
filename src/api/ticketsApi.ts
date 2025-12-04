import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  ITicket,
  ITicketType,
  ITicketStatus,
  ITicketComment,
  ITicketAttachment,
  ITicketFilters
} from '../types/ticket.types';
import { baseQueryWithReauth } from './baseQueries/baseQueryWithReauth';

export const ticketsApi = createApi({
  reducerPath: 'ticketsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Ticket', 'TicketType', 'TicketStatus'],
  endpoints: (builder) => ({
    // Типы тикетов
    getTicketTypes: builder.query<ITicketType[], void>({
      query: () => '/ticket-types',
      providesTags: ['TicketType'],
    }),

    createTicketType: builder.mutation<ITicketType, Partial<ITicketType>>({
      query: (body) => ({
        url: '/ticket-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TicketType'],
    }),

    updateTicketType: builder.mutation<ITicketType, { id: number; data: Partial<ITicketType> }>({
      query: ({ id, data }) => ({
        url: `/ticket-types/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['TicketType'],
    }),

    deleteTicketType: builder.mutation<void, number>({
      query: (id) => ({
        url: `/ticket-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TicketType'],
    }),

    // Статусы тикетов
    getTicketStatuses: builder.query<ITicketStatus[], void>({
      query: () => '/ticket-statuses',
      providesTags: ['TicketStatus'],
    }),

    // Тикеты
    getTickets: builder.query<{ data: ITicket[] }, ITicketFilters>({
      query: (filters) => ({
        url: '/tickets',
        params: filters,
      }),
      providesTags: ['Ticket'],
    }),

    getTicket: builder.query<ITicket, number>({
      query: (id) => `/tickets/${id}`,
      providesTags: ['Ticket'],
    }),

    createTicket: builder.mutation<ITicket, Partial<ITicket>>({
      query: (body) => ({
        url: '/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ticket'],
    }),

    updateTicket: builder.mutation<ITicket, { id: number; data: Partial<ITicket> }>({
      query: ({ id, data }) => ({
        url: `/tickets/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Ticket'],
    }),

    updateTicketStatus: builder.mutation<ITicket, { id: number; statusId: number }>({
      query: ({ id, statusId }) => ({
        url: `/tickets/${id}/status`,
        method: 'PUT',
        body: { status_id: statusId },
      }),
      invalidatesTags: ['Ticket'],
    }),

    // Комментарии
    createComment: builder.mutation<ITicketComment, { ticketId: number; data: Partial<ITicketComment> }>({
      query: ({ ticketId, data }) => ({
        url: `/tickets/${ticketId}/comments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Ticket'],
    }),

    // Вложения
    uploadAttachment: builder.mutation<ITicketAttachment, { ticketId: number; file: File }>({
      query: ({ ticketId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/tickets/${ticketId}/attachments`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Ticket'],
    }),

    deleteAttachment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/attachments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ticket'],
    }),

    // Скачивание файла
    downloadAttachment: builder.mutation<Blob, number>({
      query: (attachmentId) => ({
        url: `/attachments/${attachmentId}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
        cache: 'no-cache',
      }),
    }),

    // Превью файла
    previewAttachment: builder.mutation<Blob, number>({
      query: (attachmentId) => ({
        url: `/attachments/${attachmentId}/preview`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
        cache: 'no-cache',
      }),
    }),

    // Альтернативный вариант для скачивания через query (если нужно кэширование)
    getAttachmentDownloadUrl: builder.query<string, number>({
      query: (attachmentId) => `/attachments/${attachmentId}/download`,
      providesTags: ['Ticket'],
    }),

    getAttachmentPreviewUrl: builder.query<string, number>({
      query: (attachmentId) => `/attachments/${attachmentId}/preview`,
      providesTags: ['Ticket'],
    }),
  }),
});

export const {
  useGetTicketTypesQuery,
  useCreateTicketTypeMutation,
  useUpdateTicketTypeMutation,
  useDeleteTicketTypeMutation,
  useGetTicketStatusesQuery,
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useUpdateTicketStatusMutation,
  useCreateCommentMutation,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
  useDownloadAttachmentMutation,
  usePreviewAttachmentMutation,
  useGetAttachmentDownloadUrlQuery,
  useGetAttachmentPreviewUrlQuery,
} = ticketsApi;