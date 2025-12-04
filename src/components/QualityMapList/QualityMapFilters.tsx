import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Card, Space, Button, Flex, Input, Select, theme, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined, ClearOutlined, CheckOutlined } from '@ant-design/icons';
import type { QualityMapsFilter } from '../../types/quality.types';
import dayjs, { type Dayjs } from 'dayjs';

const { Option } = Select;

interface QualityMapFiltersProps {
  filters: QualityMapsFilter;
  teams?: Array<{ id: number; name: string }>;
  groups?: Array<{ id: number; name: string }>;
  checkers?: Array<{ id: number; name: string; surname: string }>;
  onApplyFilters: (filters: QualityMapsFilter) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  loading?: boolean;
  onRefetch?: () => void;
}

const QualityMapFilters: React.FC<QualityMapFiltersProps> = ({
  filters,
  teams = [],
  groups = [],
  checkers = [],
  onApplyFilters,
  onResetFilters,
  hasActiveFilters,
  loading = false,
  onRefetch,
}) => {
  const { token } = theme.useToken();
  
  // Локальное состояние для промежуточных значений фильтров
  const [localFilters, setLocalFilters] = useState<QualityMapsFilter>(filters);

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

  const handleTeamChange = useCallback((value: number | null) => {
    setLocalFilters(prev => ({
      ...prev,
      team_id: value || undefined,
    }));
  }, []);

  const handleGroupChange = useCallback((value: number | null) => {
    setLocalFilters(prev => ({
      ...prev,
      group_id: value || undefined,
    }));
  }, []);

  const handleCheckerChange = useCallback((value: number | null) => {
    setLocalFilters(prev => ({
      ...prev,
      checker_id: value || undefined,
    }));
  }, []);

  const handleStartDateChange = useCallback((date: Dayjs | null) => {
    setLocalFilters(prev => ({
      ...prev,
      start_date: date ? date.format('YYYY-MM-DD') : undefined,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onApplyFilters(localFilters);
  }, [localFilters, onApplyFilters]);

  const handleResetFilters = useCallback(() => {
    const resetFilters: QualityMapsFilter = {
      search: undefined,
      team_id: undefined,
      group_id: undefined,
      checker_id: undefined,
      start_date: undefined,
      page: 1,
      per_page: filters.per_page || 10,
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  }, [filters.per_page, onResetFilters]);

  const teamOptions = useMemo(() => 
    teams.map(team => (
      <Option key={team.id} value={team.id}>
        {team.name}
      </Option>
    )), [teams]
  );

  const groupOptions = useMemo(() => 
    groups.map(group => (
      <Option key={group.id} value={group.id}>
        {group.name}
      </Option>
    )), [groups]
  );

  const checkerOptions = useMemo(() => 
    checkers.map(checker => (
      <Option key={checker.id} value={checker.id}>
        {checker.name} {checker.surname}
      </Option>
    )), [checkers]
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
            placeholder="Поиск по сотруднику..."
            allowClear
            size="middle"
            style={{ width: 250, minWidth: 180 }}
            value={localFilters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Все отделы"
            allowClear
            showSearch
            filterOption={(input, option) => {
              const label = typeof option?.label === 'string' 
                ? option.label 
                : String(option?.children || '');
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            style={{ width: 180, minWidth: 130 }}
            size="middle"
            value={localFilters.team_id || null}
            onChange={handleTeamChange}
          >
            {teamOptions}
          </Select>
          <Select
            placeholder="Все группы"
            allowClear
            showSearch
            filterOption={(input, option) => {
              const label = typeof option?.label === 'string' 
                ? option.label 
                : String(option?.children || '');
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            style={{ width: 180, minWidth: 130 }}
            size="middle"
            value={localFilters.group_id || null}
            onChange={handleGroupChange}
          >
            {groupOptions}
          </Select>
          <Select
            placeholder="Проверяющий"
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
            value={localFilters.checker_id || null}
            onChange={handleCheckerChange}
          >
            {checkerOptions}
          </Select>
          <DatePicker
            placeholder="Дата начала"
            size="middle"
            style={{ width: 180, minWidth: 150 }}
            value={localFilters.start_date ? dayjs(localFilters.start_date) : null}
            onChange={handleStartDateChange}
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

export default QualityMapFilters;
