import { useEffect } from 'react';
import { useCurrentUserQuery } from '../api/authApi';
import { useTypedSelector } from './store';
import { selectAuthToken, selectCurrentUser, selectIsAuthenticated, selectIsLoading } from '../features/Auth/authSlice';

export const useAuth = () => {
    const isAuthenticated = useTypedSelector(selectIsAuthenticated)
    const token = useTypedSelector(selectAuthToken)
    const user = useTypedSelector(selectCurrentUser)
    const isLoading = useTypedSelector(selectIsLoading)
    const { refetch } = useCurrentUserQuery(undefined, {
        skip: !token || !!user, // Пропускаем запрос если нет токена
    });

    useEffect(() => {
        try {
            if (token && !user) {
                refetch();
            }
        } catch (e) {
            console.error(e)
        }
    }, [token, refetch, user]);

    return { isAuthenticated, user, isLoading }
};