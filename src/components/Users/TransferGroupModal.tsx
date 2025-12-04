import React, { useState, useEffect } from 'react';
import { Modal, DatePicker, Form, message, Input, Typography, Alert, Space, Divider } from 'antd';
import { CalendarOutlined, UserOutlined, TeamOutlined, SwapOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

interface TransferGroupModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (transferDate: string) => Promise<void>;
  userName: string;
  oldGroupName?: string;
  newGroupName?: string;
}

const TransferGroupModal: React.FC<TransferGroupModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  userName,
  oldGroupName,
  newGroupName
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Сбрасываем форму при открытии модального окна
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        transfer_date: dayjs()
      });
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.transfer_date) {
        message.error('Пожалуйста, выберите дату перевода');
        return;
      }
      
      // Используем startOf('day') чтобы избежать проблем с часовыми поясами
      const transferDate = values.transfer_date.startOf('day').format('YYYY-MM-DD');
      
      setLoading(true);
      await onConfirm(transferDate);
      form.resetFields();
      message.success('Пользователь успешно переведен в новую группу');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        // Validation error
        return;
      }
      message.error('Ошибка при переводе пользователя');
      console.error('Transfer error:', error);
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
          <SwapOutlined style={{ color: '#1890ff' }} />
          <span>Перевод пользователя в другую группу</span>
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Перевести"
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
              <span>Пользователь</span>
            </Space>
          }
        >
          <Input
            value={userName}
            disabled
            prefix={<UserOutlined />}
            size="large"
          />
        </Form.Item>

        {oldGroupName && newGroupName && (
          <Form.Item
            label={
              <Space>
                <TeamOutlined />
                <span>Перевод</span>
              </Space>
            }
          >
            <Space size="middle" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <Input
                value={oldGroupName}
                disabled
                prefix={<TeamOutlined />}
                size="large"
                style={{ flex: 1 }}
              />
              <SwapOutlined style={{ fontSize: 20, color: '#1890ff', margin: '0 8px' }} />
              <Input
                value={newGroupName}
                disabled
                prefix={<TeamOutlined />}
                size="large"
                style={{ flex: 1 }}
              />
            </Space>
          </Form.Item>
        )}

        <Form.Item
          name="transfer_date"
          label={
            <Space>
              <CalendarOutlined />
              <span>Дата перевода</span>
            </Space>
          }
          rules={[
            { required: true, message: 'Пожалуйста, выберите дату перевода' },
            {
              validator: (_, value: Dayjs) => {
                if (!value) {
                  return Promise.resolve();
                }
                const today = dayjs().startOf('day');
                const selectedDate = value.startOf('day');
                
                if (selectedDate.isBefore(today)) {
                  return Promise.reject(new Error('Дата перевода не может быть в прошлом'));
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
            placeholder="Выберите дату перевода"
            disabledDate={(current) => {
              return current && current < dayjs().startOf('day');
            }}
            onChange={(date) => {
              // Явно обновляем значение в форме
              form.setFieldValue('transfer_date', date);
            }}
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
            Выберите дату, с которой пользователь будет переведен в новую группу
          </Text>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '16px 0' }} />

      <Alert
        message="Информация о переводе"
        description={
          <Text type="secondary" style={{ fontSize: 13 }}>
            После перевода все смены пользователя после выбранной даты будут удалены, 
            и будет сгенерирован новый график на основе стандартных смен сотрудников новой группы 
            с таким же типом графика, начиная с даты перевода.
          </Text>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
      />
    </Modal>
  );
};

export default TransferGroupModal;

