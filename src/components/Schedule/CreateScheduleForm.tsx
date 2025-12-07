import React from 'react';
import { Card, Form, Select, DatePicker, Space, Button, Typography, Alert } from 'antd';
import { TeamOutlined, PlayCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { IScheduleForm, FormFieldValue } from '../../types/schedule.types';
import type { ITeam } from '../../types/team.types';
import styles from '../../styles/schedule/create-schedule.module.css';

const { Text } = Typography;

interface CreateScheduleFormProps {
  form: IScheduleForm;
  onFormChange: (field: keyof IScheduleForm, value: FormFieldValue) => void;
  teams?: ITeam[];
  isLoadingTeams: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

const CreateScheduleForm: React.FC<CreateScheduleFormProps> = ({
  form,
  onFormChange,
  teams,
  isLoadingTeams,
  onSubmit,
  isSubmitting,
  isValid
}) => {
  return (
    <Card 
      title={
        <Space>
          <PlayCircleOutlined style={{ color: '#1890ff' }} />
          <span>Параметры генерации</span>
        </Space>
      }
      className={styles.formCard}
    >
      <Form layout="vertical" size="large">
        {/* Выбор отдела */}
        <Form.Item 
          label={
            <Space>
              <TeamOutlined style={{ color: '#1890ff' }} />
              <span>Отдел</span>
            </Space>
          }
          required
          validateStatus={form.team_id ? 'success' : ''}
        >
          <Select
            value={form.team_id || undefined}
            onChange={(value) => onFormChange('team_id', value)}
            placeholder="Выберите отдел для генерации графика"
            loading={isLoadingTeams}
            optionFilterProp="label"
            showSearch
            allowClear
            style={{ width: '100%' }}
          >
            {teams?.map((team) => (
              <Select.Option key={team.id} value={team.id} label={team.name}>
                <Space>
                  <TeamOutlined style={{ color: '#1890ff' }} />
                  {team.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Даты начала смен */}
        <Form.Item 
          label={
            <Space>
              <CalendarOutlined style={{ color: '#52c41a' }} />
              <span>Дата начала верхних смен</span>
            </Space>
          }
          required
          validateStatus={form.top_start ? 'success' : ''}
          help={!form.team_id ? 'Сначала выберите отдел' : undefined}
        >
          <DatePicker
            style={{ width: '100%' }}
            value={form.top_start ? dayjs(form.top_start) : null}
            onChange={(_, dateString) => onFormChange('top_start', Array.isArray(dateString) ? dateString[0] : dateString)}
            placeholder="Выберите дату начала верхних смен"
            format="YYYY-MM-DD"
            disabled={!form.team_id}
          />
        </Form.Item>

        <Form.Item 
          label={
            <Space>
              <CalendarOutlined style={{ color: '#faad14' }} />
              <span>Дата начала нижних смен</span>
            </Space>
          }
          required
          validateStatus={form.bottom_start ? 'success' : ''}
          help={!form.team_id ? 'Сначала выберите отдел' : undefined}
        >
          <DatePicker
            style={{ width: '100%' }}
            value={form.bottom_start ? dayjs(form.bottom_start) : null}
            onChange={(_, dateString) => onFormChange('bottom_start', Array.isArray(dateString) ? dateString[0] : dateString)}
            placeholder="Выберите дату начала нижних смен"
            format="YYYY-MM-DD"
            disabled={!form.team_id}
          />
        </Form.Item>

        <Alert
          message="Генерация в фоновом режиме"
          description="После запуска график будет генерироваться в фоне. Вы сможете отслеживать прогресс на экране."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={!isValid}
            style={{ minWidth: 200, height: 48 }}
          >
            {isSubmitting ? 'Запуск...' : 'Сгенерировать график'}
          </Button>
          
          {!isValid && (
            <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
              Заполните все поля для запуска генерации
            </Text>
          )}
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateScheduleForm;

