import React, { useState, useEffect } from 'react';
import { Modal, DatePicker, Form, message, Input, Typography, Alert, Space, Divider } from 'antd';
import { CalendarOutlined, UserOutlined, TeamOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

interface StartDateModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (startDate: string) => void;
  employeeName: string;
  groupName?: string;
}

const StartDateModal: React.FC<StartDateModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  employeeName,
  groupName
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Сбрасываем форму при открытии модального окна
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        start_date: dayjs()
      });
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.start_date) {
        message.error('Пожалуйста, выберите дату выхода');
        return;
      }
      
      // Используем startOf('day') чтобы избежать проблем с часовыми поясами
      const startDate = values.start_date.startOf('day').format('YYYY-MM-DD');
      
      setLoading(true);
      onConfirm(startDate);
      form.resetFields();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        // Validation error
        return;
      }
      message.error('Ошибка при выборе даты выхода');
      console.error('Start date error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <span>Дата выхода нового сотрудника</span>
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Подтвердить"
      cancelText="Отмена"
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          label={
            <Space>
              <UserOutlined />
              <span>Сотрудник</span>
            </Space>
          }
        >
          <Input
            value={employeeName}
            disabled
            prefix={<UserOutlined />}
            size="large"
          />
        </Form.Item>

        {groupName && (
          <Form.Item
            label={
              <Space>
                <TeamOutlined />
                <span>Группа</span>
              </Space>
            }
          >
            <Input
              value={groupName}
              disabled
              prefix={<TeamOutlined />}
              size="large"
            />
          </Form.Item>
        )}

        <Form.Item
          name="start_date"
          label={
            <Space>
              <CalendarOutlined />
              <span>Дата выхода</span>
            </Space>
          }
          rules={[
            { required: true, message: 'Пожалуйста, выберите дату выхода' },
            {
              validator: (_, value: Dayjs) => {
                if (!value) {
                  return Promise.resolve();
                }
                const today = dayjs().startOf('day');
                const selectedDate = value.startOf('day');
                
                if (selectedDate.isBefore(today)) {
                  return Promise.reject(new Error('Дата выхода не может быть в прошлом'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            size="large"
            format="DD.MM.YYYY"
            placeholder="Выберите дату выхода"
            disabledDate={(current) => {
              return current && current < dayjs().startOf('day');
            }}
            onChange={(date) => {
              // Явно обновляем значение в форме
              form.setFieldValue('start_date', date);
            }}
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
            Выберите дату, с которой сотрудник начнет работу в группе
          </Text>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '16px 0' }} />

      <Alert
        message="Информация о графике"
        description={
          <Text type="secondary" style={{ fontSize: 13 }}>
            Начиная с выбранной даты сотруднику будет сгенерирован график работы 
            на основе стандартных смен других сотрудников группы с таким же типом графика.
          </Text>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
      />
    </Modal>
  );
};

export default StartDateModal;

