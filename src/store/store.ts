import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/Auth/authSlice"
import { authApi } from "../api/authApi";
import { usersApi } from "../api/usersApi";
import { attemptsApi } from "../api/attemptsApi";
import { groupsApi } from "../api/groupsApi";
import { teamsApi } from "../api/teamsApi";
import { rolesApi } from "../api/rolesApi";
import { scheduleTypesApi } from "../api/scheduleTypesApi";
import { scheduleApi } from "../api/scheduleApi";
import { permissionsApi } from "../api/permissionsApi";
import { qualityApi } from "../api/qualityApi";
import { qualityCriteriasApi } from "../api/qualityCriteriasApi";
import { shiftRequestApi } from "../api/shiftRequestApi";
import { penaltiesApi } from "../api/penaltiesApi";

const preloadedState = {
    auth: {
        token: localStorage.getItem("auth_token"),
        user: null,
        isLoading: false


    }
}

const rootReducer = combineReducers({
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [attemptsApi.reducerPath]: attemptsApi.reducer,
    [groupsApi.reducerPath]: groupsApi.reducer,
    [teamsApi.reducerPath]: teamsApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [scheduleTypesApi.reducerPath]: scheduleTypesApi.reducer,
    [scheduleApi.reducerPath]: scheduleApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [qualityApi.reducerPath]: qualityApi.reducer,
    [qualityCriteriasApi.reducerPath]: qualityCriteriasApi.reducer,
    [shiftRequestApi.reducerPath]: shiftRequestApi.reducer,
    [penaltiesApi.reducerPath]: penaltiesApi.reducer,
})

export const store = configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            [authApi.middleware,
            usersApi.middleware,
            attemptsApi.middleware,
            groupsApi.middleware,
            teamsApi.middleware,
            rolesApi.middleware,
            scheduleTypesApi.middleware,
            scheduleApi.middleware,
            permissionsApi.middleware,
            qualityApi.middleware, 
            qualityCriteriasApi.middleware,
            shiftRequestApi.middleware,
            penaltiesApi.middleware
            ])
})

if (localStorage.getItem('auth_token')) {
    store.dispatch(authApi.endpoints.currentUser.initiate());
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;