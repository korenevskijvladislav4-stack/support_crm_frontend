import { createSlice, type SerializedError } from "@reduxjs/toolkit";
import type { IAuthStore } from "../../types/auth.types";
import { authApi } from "../../api/authApi";
import type { RootState } from "../../store/store";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const initialState: IAuthStore = {
    token: null,
    user: null,
    isLoading: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

        logout: (state) => {
            state.user = null;
            state.token = null;
        },

    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                authApi.endpoints.signIn.matchFulfilled,
                (state, { payload }) => {
                    state.token = payload.token;
                }
            )
            .addMatcher(
                authApi.endpoints.signOut.matchFulfilled,
                (state) => {
                    state.token = null;
                    state.user = null;
                }
            )
            .addMatcher(
                authApi.endpoints.currentUser.matchPending,
                (state)=>{
                    state.isLoading = true
                }
            )
            .addMatcher(
                authApi.endpoints.currentUser.matchFulfilled,
                (state, { payload }) => {
                    state.user = payload;
                    state.isLoading = false
                }
            )
            .addMatcher(
                authApi.endpoints.currentUser.matchRejected,
                (state, { error }: { error: FetchBaseQueryError | SerializedError }) => {
                    if ('name' in error && error.name === 'ConditionError') {
                        return;
                    }
                    if ('status' in error) {
                        if (error.status === 401) {
                            state.user = null;
                            state.token = null;
                            state.isLoading = false;
                        }
                        return;
                    }
                    state.user = null;
                    state.token = null;
                    state.isLoading = false;
                }
            )
    }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
    !!state.auth.token && !!state.auth.user;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;