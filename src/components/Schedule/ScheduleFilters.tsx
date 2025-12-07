import { type FC } from "react";
import { Card, Segmented, Select, DatePicker, Button, Flex, theme } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import type { ITeam } from "../../types/team.types";
import type { IScheduleFilterForm } from "../../types/schedule.types";

const { Option } = Select;

interface ScheduleFiltersProps {
  filterForm: IScheduleFilterForm;
  teams?: ITeam[];
  isLoadingTeams?: boolean;
  isFetching?: boolean;
  shiftTypeOptions: Array<{ label: string; value: string }>;
  onShiftTypeChange: (value: string) => void;
  onTeamChange: (value: number | null) => void;
  onMonthChange: (date: Dayjs | null) => void;
  onRefresh?: () => void;
}

export const ScheduleFilters: FC<ScheduleFiltersProps> = ({
  filterForm,
  teams,
  isLoadingTeams,
  isFetching,
  shiftTypeOptions,
  onShiftTypeChange,
  onTeamChange,
  onMonthChange,
  onRefresh,
}) => {
  const { token } = theme.useToken();

  const teamOptions = teams?.map(team => (
    <Option key={team.id} value={team.id}>
      {team.name}
    </Option>
  ));

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
        <Segmented
          options={shiftTypeOptions}
          value={filterForm.shift_type}
          onChange={onShiftTypeChange}
          size="middle"
        />
        
        <Flex gap={16} align="center" wrap>
          <Select
            loading={isLoadingTeams}
            showSearch
            filterOption={(input, option) => {
              const label = typeof option?.label === 'string' 
                ? option.label 
                : String(option?.children || '');
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            style={{ width: 180, minWidth: 130 }}
            value={filterForm.team_id || null}
            onChange={onTeamChange}
            placeholder="Отдел"
            allowClear
            size="middle"
          >
            {teamOptions}
          </Select>
          
          <DatePicker
            value={filterForm.month ? dayjs(filterForm.month) : null}
            onChange={onMonthChange}
            picker="month"
            placeholder="Месяц"
            format="MMMM YYYY"
            size="middle"
            style={{ width: 180, minWidth: 150 }}
          />

          {onRefresh && (
            <Button 
              icon={<ReloadOutlined />} 
              loading={isFetching}
              onClick={onRefresh}
              size="middle"
            >
              Обновить
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
