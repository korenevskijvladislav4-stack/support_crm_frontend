import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, DatePicker, Flex, Input, Select, Space, Button, theme } from "antd";
import {
  CalendarOutlined,
  CheckOutlined,
  ClearOutlined,
  ClusterOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import type { IShiftRequestFilters } from "../../types/shiftRequest.types";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ShiftRequestsFiltersProps {
  filters: IShiftRequestFilters;
  defaults: IShiftRequestFilters;
  teams?: Array<{ id: number; name: string }>;
  groups?: Array<{ id: number; name: string }>;
  loading?: boolean;
  hasActiveFilters: boolean;
  onApply: (filters: IShiftRequestFilters) => void;
  onReset: () => void;
  onRefetch?: () => void;
}

const ShiftRequestsFilters: React.FC<ShiftRequestsFiltersProps> = ({
  filters,
  defaults,
  teams = [],
  groups = [],
  loading = false,
  hasActiveFilters,
  onApply,
  onReset,
  onRefetch,
}) => {
  const { token } = theme.useToken();
  const [localFilters, setLocalFilters] = useState<IShiftRequestFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFullNameChange = useCallback((value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      full_name: value,
    }));
  }, []);

  const handleTeamChange = useCallback((value: number | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      team_id: value,
    }));
  }, []);

  const handleGroupChange = useCallback((value: number | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      group_id: value,
    }));
  }, []);

  const handleStatusChange = useCallback((value: "pending" | "approved" | "rejected" | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: value,
    }));
  }, []);

  const handleDateChange = useCallback((dates: null | (Dayjs | null)[]) => {
    const [from, to] = dates || [];
    setLocalFilters((prev) => ({
      ...prev,
      date_from: from ? from.format("YYYY-MM-DD") : null,
      date_to: to ? to.format("YYYY-MM-DD") : null,
    }));
  }, []);

  const handleApply = useCallback(() => {
    onApply(localFilters);
  }, [localFilters, onApply]);

  const handleReset = useCallback(() => {
    setLocalFilters(defaults);
    onReset();
  }, [defaults, onReset]);

  const teamOptions = useMemo(
    () =>
      teams.map((team) => (
        <Option key={team.id} value={team.id}>
          {team.name}
        </Option>
      )),
    [teams],
  );

  const groupOptions = useMemo(
    () =>
      groups.map((group) => (
        <Option key={group.id} value={group.id}>
          {group.name}
        </Option>
      )),
    [groups],
  );

  const dateValue = useMemo<[Dayjs | null, Dayjs | null]>(
    () => [
      localFilters.date_from ? dayjs(localFilters.date_from) : null,
      localFilters.date_to ? dayjs(localFilters.date_to) : null,
    ],
    [localFilters.date_from, localFilters.date_to],
  );

  return (
    <Card
      size="small"
      style={{
        marginBottom: 12,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Flex justify="space-between" align="center" gap={16} wrap>
        <Flex gap={16} align="center" wrap style={{ flex: 1 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Поиск по ФИО..."
            size="middle"
            style={{ width: 240, minWidth: 180 }}
            value={localFilters.full_name}
            onChange={(e) => handleFullNameChange(e.target.value)}
          />

          <Select
            allowClear
            showSearch
            placeholder="Все отделы"
            style={{ width: 180, minWidth: 130 }}
            size="middle"
            value={localFilters.team_id ?? null}
            onChange={(val) => handleTeamChange(val ?? null)}
            suffixIcon={<TeamOutlined />}
            filterOption={(input, option) => {
              const label = typeof option?.label === "string" ? option.label : String(option?.children || "");
              return label.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {teamOptions}
          </Select>

          <Select
            allowClear
            showSearch
            placeholder="Все группы"
            style={{ width: 180, minWidth: 130 }}
            size="middle"
            value={localFilters.group_id ?? null}
            onChange={(val) => handleGroupChange(val ?? null)}
            suffixIcon={<ClusterOutlined />}
            filterOption={(input, option) => {
              const label = typeof option?.label === "string" ? option.label : String(option?.children || "");
              return label.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {groupOptions}
          </Select>

          <Select
            allowClear
            placeholder="Статус"
            style={{ width: 160, minWidth: 130 }}
            size="middle"
            value={localFilters.status}
            onChange={(val) => handleStatusChange(val as any)}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="pending">Ожидает</Option>
            <Option value="approved">Одобрено</Option>
            <Option value="rejected">Отклонено</Option>
          </Select>

          <RangePicker
            allowClear
            style={{ width: 280, minWidth: 240 }}
            size="middle"
            format="DD.MM.YYYY"
            value={dateValue}
            onChange={handleDateChange}
            suffixIcon={<CalendarOutlined />}
          />
        </Flex>

        <Space>
          <Button type="primary" icon={<CheckOutlined />} onClick={handleApply} loading={loading} size="middle">
            Применить
          </Button>
          {onRefetch && (
            <Button icon={<ReloadOutlined />} onClick={onRefetch} loading={loading} size="middle">
              Обновить
            </Button>
          )}
          {hasActiveFilters && (
            <Button icon={<ClearOutlined />} onClick={handleReset} size="middle">
              Сбросить
            </Button>
          )}
        </Space>
      </Flex>
    </Card>
  );
};

export default ShiftRequestsFilters;

