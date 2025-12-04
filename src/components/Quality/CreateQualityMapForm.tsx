import React from 'react';
import { Card, Form, Select, DatePicker, InputNumber, Divider, Space, Button, Typography } from 'antd';
import type { FormInstance } from 'antd';
import { FileTextOutlined, TeamOutlined, UserOutlined, CalendarOutlined, MessageOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import type { Team, User } from '../../types/quality.types';
import styles from '../../styles/quality/create-quality-map.module.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface QualityMapFormValues {
  user_id: number;
  team_id: number;
  dates: [dayjs.Dayjs, dayjs.Dayjs];
  chat_count: number;
  calls_count?: number;
}

interface CreateQualityMapFormProps {
  form: FormInstance<QualityMapFormValues>;
  onFinish: (values: QualityMapFormValues) => void;
  teams?: Team[];
  users?: User[];
  selectedTeam: number | null;
  onTeamChange: (teamId: number) => void;
  onUserSelect: () => void;
  disabledDate: RangePickerProps['disabledDate'];
  isLoading: boolean;
  isLoadingUsers?: boolean;
  isValid: boolean;
  onCancel?: () => void;
}

const CreateQualityMapForm: React.FC<CreateQualityMapFormProps> = ({
  form,
  onFinish,
  teams,
  users,
  selectedTeam,
  onTeamChange,
  onUserSelect,
  disabledDate,
  isLoading,
  isLoadingUsers = false,
  isValid,
  onCancel
}) => {
  return (
    <Card 
      title={
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>Создание карты качества</span>
        </Space>
      }
      className={styles.formCard}
    >
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        size="large"
        initialValues={{
          chat_count: 10,
          calls_count: 0,
        }}
      >
        <Divider orientation="left">
          <Space>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <span>Выбор команды</span>
          </Space>
        </Divider>
        
        <Form.Item 
          name="team_id" 
          label="Команда для проверки"
          rules={[{ required: true, message: 'Выберите команду' }]}
        >
          <Select 
            placeholder="Выберите команду"
            onChange={onTeamChange}
            optionFilterProp="label"
            showSearch
            allowClear
          >
            {teams?.map(team => (
              <Select.Option key={team.id} value={team.id} label={team.name}>
                <Space>
                  <TeamOutlined />
                  {team.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Divider orientation="left">
          <Space>
            <UserOutlined style={{ color: '#52c41a' }} />
            <span>Выбор сотрудника</span>
          </Space>
        </Divider>
        
        <Form.Item 
          name="user_id" 
          label="Проверяемый сотрудник"
          rules={[{ required: true, message: 'Выберите сотрудника' }]}
        >
          <Select 
            placeholder={selectedTeam ? "Выберите сотрудника" : "Сначала выберите команду"} 
            disabled={!selectedTeam}
            loading={isLoadingUsers}
            onChange={onUserSelect}
            optionFilterProp="label"
            showSearch
            allowClear
            notFoundContent={isLoadingUsers ? "Загрузка..." : "Нет доступных пользователей"}
          >
            {users && users.length > 0 ? (
              users.map(user => (
                <Select.Option key={user.id} value={user.id} label={`${user.name} ${user.surname || ''}`.trim()}>
                  <Space>
                    <UserOutlined />
                    {user.name} {user.surname || ''}
                  </Space>
                </Select.Option>
              ))
            ) : (
              !isLoadingUsers && selectedTeam && (
                <Select.Option disabled value="no-users">
                  Нет пользователей в этой команде
                </Select.Option>
              )
            )}
          </Select>
        </Form.Item>

        <Divider orientation="left">
          <Space>
            <CalendarOutlined style={{ color: '#faad14' }} />
            <span>Период проверки</span>
          </Space>
        </Divider>
        
        <Form.Item 
          name="dates" 
          label="Даты проверки"
          rules={[{ required: true, message: 'Выберите период проверки' }]}
        >
          <RangePicker 
            style={{ width: '100%' }} 
            disabledDate={disabledDate}
            format="DD.MM.YYYY"
            placeholder={['Дата начала', 'Дата окончания']}
          />
        </Form.Item>

        <Divider orientation="left">
          <Space>
            <MessageOutlined style={{ color: '#722ed1' }} />
            <span>Настройка проверки</span>
          </Space>
        </Divider>
        
        <Form.Item 
          name="chat_count" 
          label="Количество проверяемых чатов"
          rules={[
            { required: true, message: 'Укажите количество чатов' },
            { type: 'number', min: 1, max: 50, message: 'Введите число от 1 до 50' }
          ]}
          help="Укажите количество чатов для проверки качества работы"
        >
          <InputNumber 
            min={1}
            max={50}
            style={{ width: '100%' }}
            placeholder="Введите количество чатов"
          />
        </Form.Item>

        <Form.Item 
          name="calls_count" 
          label="Количество проверяемых звонков"
          rules={[
            { type: 'number', min: 0, max: 50, message: 'Введите число от 0 до 50' }
          ]}
          help="Укажите количество звонков для проверки качества работы (необязательно)"
        >
          <InputNumber 
            min={0}
            max={50}
            style={{ width: '100%' }}
            placeholder="Введите количество звонков"
          />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              size="large"
              icon={<CheckCircleOutlined />}
              disabled={!isValid}
            >
              Создать карту качества
            </Button>
            {onCancel && (
              <Button 
                onClick={onCancel}
                size="large"
                icon={<ArrowLeftOutlined />}
              >
                Отмена
              </Button>
            )}
          </Space>
          
          {!isValid && (
            <Text type="secondary" className={styles.helpText}>
              Заполните все обязательные поля для создания карты качества
            </Text>
          )}
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateQualityMapForm;

