import { useState, useCallback } from 'react';
import { PAGINATION } from '../constants';

interface UsePaginationOptions {
  defaultPage?: number;
  defaultSize?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  handleChange: (newPage: number, newSize: number) => void;
  handleShowSizeChange: (current: number, size: number) => void;
  reset: () => void;
  paginationProps: {
    current: number;
    pageSize: number;
    showSizeChanger: boolean;
    showQuickJumper: boolean;
    pageSizeOptions: readonly string[];
    onChange: (page: number, pageSize: number) => void;
    onShowSizeChange: (current: number, size: number) => void;
  };
}

/**
 * Хук для управления пагинацией
 */
export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const {
    defaultPage = PAGINATION.DEFAULT_PAGE,
    defaultSize = PAGINATION.DEFAULT_SIZE,
  } = options;

  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultSize);

  const handleChange = useCallback((newPage: number, newSize: number) => {
    setPage(newPage);
    setPageSize(newSize);
  }, []);

  const handleShowSizeChange = useCallback((_current: number, size: number) => {
    setPage(1);
    setPageSize(size);
  }, []);

  const reset = useCallback(() => {
    setPage(defaultPage);
    setPageSize(defaultSize);
  }, [defaultPage, defaultSize]);

  const paginationProps = {
    current: page,
    pageSize,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: PAGINATION.SIZE_OPTIONS,
    onChange: handleChange,
    onShowSizeChange: handleShowSizeChange,
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    handleChange,
    handleShowSizeChange,
    reset,
    paginationProps,
  };
};

