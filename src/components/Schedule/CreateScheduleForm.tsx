import React from 'react';
import { Card, Form, Select, DatePicker, Row, Col, Divider, Space, Button, Typography, Alert } from 'antd';
import { TeamOutlined, PlayCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { IScheduleForm, FormFieldValue } from '../../types/schedule.types';
import type { ITeam } from '../../types/teams.type';
import styles from '../../styles/schedule/create-schedule.module.css';

const { Text } = Typography;

interface CreateScheduleFormProps {
  form: IScheduleForm;
  onFormChange: (field: keyof IScheduleForm, value: FormFieldValue) => void;
  teams?: ITeam[];
  isLoadingTeams: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

const CreateScheduleForm: React.FC<CreateScheduleFormProps> = ({
  form,
  onFormChange,
  teams,
  isLoadingTeams,
  onCancel,
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
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        layout="horizontal"
        size="large"
      >
        <Divider orientation="left">Выбор отдела</Divider>
        <Form.Item label="Отдел" required>
          <Select
            value={form.team_id}
            onChange={(value) => onFormChange('team_id', value)}
            placeholder="Выберите отдел"
            loading={isLoadingTeams}
            optionFilterProp="children"
            showSearch
            allowClear
            size="large"
          >
            {teams?.map((team) => (
              <Select.Option key={team.id} value={team.id}>
                <Space>
                  <TeamOutlined />
                  {team.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Divider />
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <ClockCircleOutlined style={{ color: '#faad14' }} />
            <Text strong>Даты начала смен</Text>
          </div>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item 
                label="Верхние смены" 
                required
                validateStatus={form.top_start ? 'success' : ''}
                help={form.top_start ? 'Дата установлена' : 'Укажите дату начала верхних смен'}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={(_, dateString) => onFormChange('top_start', Array.isArray(dateString) ? dateString[0] : dateString)}
                  placeholder="Выберите дату начала"
                  format="YYYY-MM-DD"
                  disabled={!form.team_id}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item 
                label="Нижние смены" 
                required
                validateStatus={form.bottom_start ? 'success' : ''}
                help={form.bottom_start ? 'Дата установлена' : 'Укажите дату начала нижних смен'}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  onChange={(_, dateString) => onFormChange('bottom_start', Array.isArray(dateString) ? dateString[0] : dateString)}
                  placeholder="Выберите дату начала"
                  format="YYYY-MM-DD"
                  disabled={!form.team_id}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        <Alert
          message="Информация о генерации графика"
          description="Система автоматически создаст график смен на основе выбранных дат. Верхние и нижние смены будут чередоваться согласно установленному расписанию."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form.Item 
          label="Отдел" 
          required
          style={{ marginBottom: 32 }}
          validateStatus={form.team_id ? 'success' : ''}
          help={form.team_id ? 'Отдел выбран' : 'Выберите отдел для генерации графика'}
        >
          <Select
            value={form.team_id}
            onChange={(value) => onFormChange('team_id', value)}
            placeholder="Выберите отдел"
            loading={isLoadingTeams}
            optionFilterProp="label"
            showSearch
            allowClear
            suffixIcon={<TeamOutlined />}
          >
            {teams?.map((team) => (
              <Select.Option key={team.id} value={team.id} label={team.name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeamOutlined style={{ color: '#1890ff' }} />
                  {team.name}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={!isValid}
            style={{ minWidth: 200, height: 50 }}
          >
            Сгенерировать график
          </Button>
          
          {!isValid && (
            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
              Заполните все обязательные поля для генерации
            </Text>
          )}
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateScheduleForm;

