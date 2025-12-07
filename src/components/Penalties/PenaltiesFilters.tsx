import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Card, Space, Button, Flex, Input, Select, theme, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined, ClearOutlined, CheckOutlined } from '@ant-design/icons';
import type { IPenaltiesFilter } from '../../types/penalty.types';
import dayjs, { type Dayjs } from 'dayjs';

const { Option } = Select;

interface PenaltiesFiltersProps {
  filters: IPenaltiesFilter;
  groups?: Array<{ id: number; name: string }>;
  creators?: Array<{ id: number; name: string; surname: string }>;
  onApplyFilters: (filters: IPenaltiesFilter) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  loading?: boolean;
  onRefetch?: () => void;
}

const PenaltiesFilters: React.FC<PenaltiesFiltersProps> = ({
  filters,
  groups = [],
  creators = [],
  onApplyFilters,
  onResetFilters,
  hasActiveFilters,
  loading = false,
  onRefetch,
}) => {
  const { token } = theme.useToken();
  
  // Локальное состояние для промежуточных значений фильтров
  const [localFilters, setLocalFilters] = useState<IPenaltiesFilter>(filters);

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

  const handleGroupChange = useCallback((value: number | null) => {
    setLocalFilters(prev => ({
      ...prev,
      group_id: value || undefined,
    }));
  }, []);

  const handleCreatorChange = useCallback((value: number | null) => {
    setLocalFilters(prev => ({
      ...prev,
      created_by: value || undefined,
    }));
  }, []);

  const handleViolationDateChange = useCallback((date: Dayjs | null) => {
    setLocalFilters(prev => ({
      ...prev,
      violation_date: date ? date.format('YYYY-MM-DD') : undefined,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onApplyFilters(localFilters);
  }, [localFilters, onApplyFilters]);

  const handleResetFilters = useCallback(() => {
    const resetFilters: IPenaltiesFilter = {
      search: undefined,
      group_id: undefined,
      created_by: undefined,
      violation_date: undefined,
      page: 1,
      per_page: filters.per_page || 10,
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  }, [filters.per_page, onResetFilters]);

  const groupOptions = useMemo(() => 
    groups.map(group => (
      <Option key={group.id} value={group.id}>
        {group.name}
      </Option>
    )), [groups]
  );

  const creatorOptions = useMemo(() => 
    creators.map(creator => (
      <Option key={creator.id} value={creator.id}>
        {creator.name} {creator.surname}
      </Option>
    )), [creators]
  );

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
            placeholder="Поиск по пользователю..."
            allowClear
            size="middle"
            style={{ width: 250, minWidth: 180 }}
            value={localFilters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Группа пользователя"
            allowClear
            showSearch
            filterOption={(input, option) => {
              const label = typeof option?.label === 'string' 
                ? option.label 
                : String(option?.children || '');
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            style={{ width: 200, minWidth: 150 }}
            size="middle"
            value={localFilters.group_id || null}
            onChange={handleGroupChange}
          >
            {groupOptions}
          </Select>
          <Select
            placeholder="Кто создал"
            allowClear
            showSearch
            filterOption={(input, option) => {
              const label = typeof option?.label === 'string' 
                ? option.label 
                : String(option?.children || '');
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            style={{ width: 200, minWidth: 150 }}
            size="middle"
            value={localFilters.created_by || null}
            onChange={handleCreatorChange}
          >
            {creatorOptions}
          </Select>
          <DatePicker
            placeholder="Дата нарушения"
            size="middle"
            style={{ width: 180, minWidth: 150 }}
            value={localFilters.violation_date ? dayjs(localFilters.violation_date) : null}
            onChange={handleViolationDateChange}
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

export default PenaltiesFilters;

