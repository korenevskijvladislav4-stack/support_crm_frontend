import React from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import dayjs from 'dayjs';
import type { IShiftRequest } from '../../../types/shifts.types';

interface RequestShiftModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { duration: number }) => Promise<void>;
  selectedDate: string | null;
  loading: boolean;
}

const RequestShiftModal: React.FC<RequestShiftModalProps> = ({
  open,
  onCancel,
  onSubmit,
  selectedDate,
  loading
}) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit();
  };

  const handleFinish = async (values: { duration: number }) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Запрос дополнительной смены"
      open={open}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Запросить"
      cancelText="Отмена"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item label="Дата смены">
          <Input 
            value={selectedDate ? dayjs(selectedDate).format('DD.MM.YYYY') : ''} 
            disabled 
          />
        </Form.Item>
        <Form.Item
          name="duration"
          label="Продолжительность смены (часов)"
          rules={[
            { required: true, message: 'Укажите продолжительность смены' },
            { type: 'number', min: 1, max: 24, message: 'Продолжительность должна быть от 1 до 24 часов' }
          ]}
        >
          <InputNumber min={1} max={24} style={{ width: '100%' }} placeholder="12" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RequestShiftModal;

