import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

type FilterValue = string | number | boolean | null | undefined | string[] | number[];

interface UseUrlFiltersOptions<T> {
  /** Значения по умолчанию */
  defaults: T;
  /** Преобразователи для чтения из URL */
  parsers?: Partial<Record<keyof T, (value: string) => FilterValue>>;
}

/**
 * Хук для синхронизации фильтров с URL query params
 * Сохраняет состояние фильтров при обновлении страницы
 */
export function useUrlFilters<T extends Record<string, any>>({
  defaults,
  parsers = {},
}: UseUrlFiltersOptions<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Стабилизируем defaults и parsers через useRef
  const defaultsRef = useRef(defaults);
  const parsersRef = useRef(parsers);
  
  // Обновляем ref только если значение реально изменилось
  const defaultsKey = JSON.stringify(defaults);
  const parsersKey = JSON.stringify(Object.keys(parsers));
  
  useMemo(() => {
    defaultsRef.current = defaults;
  }, [defaultsKey]);
  
  useMemo(() => {
    parsersRef.current = parsers;
  }, [parsersKey, parsers]);

  /**
   * Парсинг значения из URL
   */
  const parseValue = useCallback((key: keyof T, value: string | null): FilterValue => {
    const currentDefaults = defaultsRef.current;
    const currentParsers = parsersRef.current;
    
    if (value === null || value === '') {
      return currentDefaults[key];
    }

    // Используем кастомный парсер если есть
    const customParser = currentParsers[key];
    if (customParser) {
      return customParser(value);
    }

    const defaultValue = currentDefaults[key];

    // Автоматический парсинг на основе типа default значения
    if (typeof defaultValue === 'number') {
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    }

    if (typeof defaultValue === 'boolean') {
      return value === 'true';
    }

    if (Array.isArray(defaultValue)) {
      if (!value) return [];
      const arr = value.split(',').filter(Boolean);
      // Если массив чисел
      if (defaultValue.length > 0 && typeof defaultValue[0] === 'number') {
        return arr.map(Number).filter(n => !isNaN(n));
      }
      return arr;
    }

    return value;
  }, []);

  /**
   * Текущие фильтры из URL
   */
  const filters = useMemo((): T => {
    const currentDefaults = defaultsRef.current;
    const result = { ...currentDefaults };

    for (const key of Object.keys(currentDefaults) as (keyof T)[]) {
      const urlValue = searchParams.get(String(key));
      result[key] = parseValue(key, urlValue) as T[keyof T];
    }

    return result;
  }, [searchParams, parseValue, defaultsKey]);

  /**
   * Установить один фильтр
   */
  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    const currentDefaults = defaultsRef.current;
    
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0) ||
          value === currentDefaults[key]) {
        // Удаляем параметр если значение пустое или равно дефолтному
        newParams.delete(String(key));
      } else if (Array.isArray(value)) {
        newParams.set(String(key), value.join(','));
      } else {
        newParams.set(String(key), String(value));
      }
      
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  /**
   * Установить несколько фильтров сразу
   */
  const setFilters = useCallback((newFilters: Partial<T>) => {
    const currentDefaults = defaultsRef.current;
    
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      for (const [key, value] of Object.entries(newFilters)) {
        if (value === null || value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0) ||
            value === currentDefaults[key as keyof T]) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, String(value));
        }
      }
      
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  /**
   * Сбросить все фильтры
   */
  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  /**
   * Проверка наличия активных фильтров
   */
  const hasActiveFilters = useMemo(() => {
    const currentDefaults = defaultsRef.current;
    
    for (const key of Object.keys(currentDefaults) as (keyof T)[]) {
      const value = filters[key];
      const defaultValue = currentDefaults[key];
      
      if (Array.isArray(value) && Array.isArray(defaultValue)) {
        if (value.length !== defaultValue.length) return true;
      } else if (value !== defaultValue) {
        return true;
      }
    }
    return false;
  }, [filters]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
}

export default useUrlFilters;
