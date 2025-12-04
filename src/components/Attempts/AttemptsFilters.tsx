import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Card, Space, Button, Flex, Input, Select, theme, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined, ClearOutlined, CheckOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import type { IAttemptsFilter } from '../../types/attempts.types';
import dayjs, { type Dayjs } from 'dayjs';

const { Option } = Select;

interface AttemptsFiltersProps {
  filters: IAttemptsFilter;
  onApplyFilters: (filters: IAttemptsFilter) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  loading?: boolean;
  onRefetch?: () => void;
}

const AttemptsFilters: React.FC<AttemptsFiltersProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
  hasActiveFilters,
  loading = false,
  onRefetch,
}) => {
  const { token } = theme.useToken();
  
  // Локальное состояние для промежуточных значений фильтров
  const [localFilters, setLocalFilters] = useState<IAttemptsFilter>(filters);

  // Синхронизируем локальное состояние с примененными фильтрами
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      search: value.trim() || undefined,
    }));
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      email: value.trim() || undefined,
    }));
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      phone: value.trim() || undefined,
    }));
  }, []);

  const handleCreatedDateChange = useCallback((date: Dayjs | null) => {
    setLocalFilters(prev => ({
      ...prev,
      created_at: date ? date.format('YYYY-MM-DD') : undefined,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onApplyFilters(localFilters);
  }, [localFilters, onApplyFilters]);

  const handleResetFilters = useCallback(() => {
    const resetFilters: IAttemptsFilter = {
      search: undefined,
      email: undefined,
      phone: undefined,
      created_at: undefined,
      page: 1,
      per_page: filters.per_page || 50,
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  }, [filters.per_page, onResetFilters]);

  return (
    <Card 
      size="small"
      style={{ 
        marginBottom: 12,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`
      }}
      bodyStyle={{ padding: '12px' }}
    >
      <Flex justify="space-between" align="center" gap={16} wrap>
        <Flex gap={16} align="center" style={{ flex: 1 }} wrap>
          <Input
            placeholder="Поиск по ФИО..."
            allowClear
            size="middle"
            style={{ width: 250, minWidth: 180 }}
            value={localFilters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Input
            placeholder="Поиск по почте..."
            allowClear
            size="middle"
            style={{ width: 200, minWidth: 150 }}
            value={localFilters.email || ''}
            onChange={(e) => handleEmailChange(e.target.value)}
            prefix={<MailOutlined />}
          />
          <Input
            placeholder="Поиск по телефону..."
            allowClear
            size="middle"
            style={{ width: 200, minWidth: 150 }}
            value={localFilters.phone || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            prefix={<PhoneOutlined />}
          />
          <DatePicker
            placeholder="Дата создания"
            size="middle"
            style={{ width: 180, minWidth: 150 }}
            value={localFilters.created_at ? dayjs(localFilters.created_at) : null}
            onChange={handleCreatedDateChange}
            format="DD.MM.YYYY"
          />
        </Flex>
        <Space>
          <Button 
            type="primary"
            icon={<CheckOutlined />} 
            onClick={handleApplyFilters}
            loading={loading}
            size="middle"
          >
            Применить
          </Button>
          {onRefetch && (
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRefetch} 
              loading={loading}
              size="middle"
            >
              Обновить
            </Button>
          )}
          {hasActiveFilters && (
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleResetFilters}
              size="middle"
            >
              Сбросить
            </Button>
          )}
        </Space>
      </Flex>
    </Card>
  );
};

export default AttemptsFilters;

