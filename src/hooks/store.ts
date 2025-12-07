import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';

/**
 * Типизированный хук useSelector
 */
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Типизированный хук useDispatch
 */
export const useTypedDispatch = () => useDispatch<AppDispatch>();

/**
 * @deprecated Use useTypedDispatch instead
 */
export const useAppDispatch = useTypedDispatch;
