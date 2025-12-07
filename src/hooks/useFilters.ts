import { useState, useCallback, useMemo } from 'react';

interface UseFiltersOptions<T> {
  defaultFilters: T;
  onFilterChange?: (filters: T) => void;
}

interface UseFiltersReturn<T> {
  filters: T;
  setFilters: React.Dispatch<React.SetStateAction<T>>;
  updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  updateFilters: (updates: Partial<T>) => void;
  reset: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
}

/**
 * Хук для управления фильтрами
 */
export const useFilters = <T extends Record<string, unknown>>(
  options: UseFiltersOptions<T>
): UseFiltersReturn<T> => {
  const { defaultFilters, onFilterChange } = options;
  
  const [filters, setFilters] = useState<T>(defaultFilters);

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const updateFilters = useCallback((updates: Partial<T>) => {
    setFilters(prev => {
      const newFilters = { ...prev, ...updates };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  const reset = useCallback(() => {
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  }, [defaultFilters, onFilterChange]);

  const { hasActiveFilters, activeFiltersCount } = useMemo(() => {
    let count = 0;
    
    for (const key in filters) {
      const value = filters[key];
      const defaultValue = defaultFilters[key];
      
      // Проверяем, отличается ли значение от дефолтного
      if (Array.isArray(value)) {
        if (value.length > 0) count++;
      } else if (value !== null && value !== undefined && value !== '' && value !== defaultValue) {
        count++;
      }
    }
    
    return {
      hasActiveFilters: count > 0,
      activeFiltersCount: count,
    };
  }, [filters, defaultFilters]);

  return {
    filters,
    setFilters,
    updateFilter,
    updateFilters,
    reset,
    hasActiveFilters,
    activeFiltersCount,
  };
};

