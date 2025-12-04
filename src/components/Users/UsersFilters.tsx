import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Card, Space, Button, Flex, Input, Select, theme } from 'antd';
import { ReloadOutlined, ClearOutlined, MailOutlined, PhoneOutlined, CheckOutlined } from '@ant-design/icons';
import type { IUserFilters } from '../../types/user.types';
import { useGetAllScheduleTypesQuery } from '../../api/scheduleTypesApi';

const { Option } = Select;

interface UsersFiltersProps {
  filters: IUserFilters;
  teams?: Array<{ id: number; name: string }>;
  groups?: Array<{ id: number; name: string }>;
  roles?: Array<{ id: number; name: string }>;
  onApplyFilters: (filters: IUserFilters) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  loading?: boolean;
  onRefetch?: () => void;
}

const UsersFilters: React.FC<UsersFiltersProps> = ({
  filters,
  teams = [],
  groups = [],
  roles = [],
  onApplyFilters,
  onResetFilters,
  hasActiveFilters,
  loading = false,
  onRefetch,
}) => {
  const { token } = theme.useToken();
  const { data: scheduleTypes = [] } = useGetAllScheduleTypesQuery();
  
  // Локальное состояние для промежуточных значений фильтров
  const [localFilters, setLocalFilters] = useState<IUserFilters>(filters);

  // Синхронизируем локальное состояние с примененными фильтрами
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      full_name: value.trim() || null,
    }));
  }, []);

  const handleTeamChange = useCallback((value: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      team: value,
    }));
  }, []);

  const handleGroupChange = useCallback((value: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      group: value,
    }));
  }, []);

  const handleRolesChange = useCallback((value: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      roles: value,
    }));
  }, []);

  const handleScheduleTypeChange = useCallback((value: string | null) => {
    setLocalFilters(prev => ({
      ...prev,
      schedule_type: value,
    }));
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      phone: value.trim() || null,
    }));
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      email: value.trim() || null,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    onApplyFilters(localFilters);
  }, [localFilters, onApplyFilters]);

  const handleResetFilters = useCallback(() => {
    const resetFilters: IUserFilters = {
      full_name: null,
      team: [],
      group: [],
      roles: [],
      schedule_type: null,
      phone: null,
      email: null,
      status: filters.status || 'active',
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  }, [filters.status, onResetFilters]);

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

  const roleOptions = useMemo(() => 
    roles.map(role => (
      <Option key={role.id} value={role.id}>
        {role.name}
      </Option>
    )), [roles]
  );

  const scheduleTypeOptions = useMemo(() => 
    scheduleTypes.map(scheduleType => (
      <Option key={scheduleType.id} value={scheduleType.name}>
        {scheduleType.name}
      </Option>
    )), [scheduleTypes]
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
            placeholder="Поиск по ФИО..."
            allowClear
            size="middle"
            style={{ width: 250, minWidth: 180 }}
            value={localFilters.full_name || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
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
            mode="multiple"
            value={localFilters.team || []}
            onChange={handleTeamChange}
            maxTagCount="responsive"
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
            mode="multiple"
            value={localFilters.group || []}
            onChange={handleGroupChange}
            maxTagCount="responsive"
          >
            {groupOptions}
          </Select>
          <Select
            placeholder="Все роли"
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
            mode="multiple"
            value={localFilters.roles || []}
            onChange={handleRolesChange}
            maxTagCount="responsive"
          >
            {roleOptions}
          </Select>
          <Select
            placeholder="Тип графика"
            allowClear
            showSearch
            filterOption={(input, option) => {
              const label = typeof option?.label === 'string' 
                ? option.label 
                : String(option?.children || '');
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            style={{ width: 150, minWidth: 120 }}
            size="middle"
            value={localFilters.schedule_type || null}
            onChange={handleScheduleTypeChange}
          >
            {scheduleTypeOptions}
          </Select>
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

export default UsersFilters;

