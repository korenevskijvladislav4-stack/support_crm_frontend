// app/api/baseQueries/baseQueryWithAuth.ts
import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from "../../store/store"

export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = fetchBaseQuery({
  baseUrl: 'http://127.0.0.1:8000/api',
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          searchParams.append(`${key}[]`, item.toString());
        });
      } else if (value !== null && value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  },
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});