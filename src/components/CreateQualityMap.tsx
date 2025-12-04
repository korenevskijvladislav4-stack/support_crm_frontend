// components/CreateQualityMap.tsx
import React, { useState } from 'react';
import { Form, DatePicker, Select, Button, message, Space } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useCreateQualityMapMutation, useGetTeamsQuery, useGetUsersByTeamQuery } from '../api/qualityApi';

const { RangePicker } = DatePicker;

interface CreateQualityMapProps {
  onSuccess: (mapId: number) => void;
  onCancel?: () => void;
}

interface QualityMapFormValues {
  user_id: number;
  team_id: number;
  dates: [dayjs.Dayjs, dayjs.Dayjs];
}

const CreateQualityMap: React.FC<CreateQualityMapProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm<QualityMapFormValues>();
  const [createQualityMap, { isLoading }] = useCreateQualityMapMutation();
  const { data: teams } = useGetTeamsQuery();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  
  const { data: users = [] } = useGetUsersByTeamQuery(selectedTeam, {
    skip: !selectedTeam,
  });

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const handleSubmit = async (values: QualityMapFormValues) => {
    try {
      const result = await createQualityMap({
        user_id: values.user_id,
        team_id: values.team_id,
        start_date: values.dates[0].format('YYYY-MM-DD'),
        end_date: values.dates[1].format('YYYY-MM-DD'),
      }).unwrap();

      message.success('Карта качества создана');
      onSuccess(result.data.id);
    } catch (error) {
      console.error('Error creating quality map:', error);
      message.error('Ошибка при создании карты качества');
    }
  };

  const handleTeamChange = (teamId: number) => {
    setSelectedTeam(teamId);
    form.setFieldValue('user_id', undefined);
  };

  return (
    <Form<QualityMapFormValues> 
      form={form} 
      onFinish={handleSubmit} 
      layout="vertical"
      size="middle"
    >
      <Form.Item 
        name="team_id" 
        label="Команда" 
        rules={[{ required: true, message: 'Выберите команду' }]}
      >
        <Select 
          placeholder="Выберите команду"
          onChange={handleTeamChange}
          options={teams?.map(team => ({
            value: team.id,
            label: team.name,
          }))}
        />
      </Form.Item>

      <Form.Item 
        name="user_id" 
        label="Сотрудник" 
        rules={[{ required: true, message: 'Выберите сотрудника' }]}
      >
        <Select 
          placeholder="Выберите сотрудника" 
          disabled={!selectedTeam}
          loading={!users}
          options={users?.map(user => ({
            value: user.id,
            label: user.name,
          }))}
        />
      </Form.Item>

      <Form.Item 
        name="dates" 
        label="Период проверки" 
        rules={[{ required: true, message: 'Выберите период проверки' }]}
      >
        <RangePicker 
          style={{ width: '100%' }} 
          disabledDate={disabledDate}
          format="DD.MM.YYYY"
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading} size="large">
            Создать карту качества
          </Button>
          {onCancel && (
            <Button onClick={onCancel} size="large">
              Отмена
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CreateQualityMap;