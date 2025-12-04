import React from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import dayjs from 'dayjs';
import type { IShift } from '../../../types/shifts.types';

interface EditShiftModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { duration: number }) => Promise<void>;
  selectedShift: IShift | null;
}

const EditShiftModal: React.FC<EditShiftModalProps> = ({
  open,
  onCancel,
  onSubmit,
  selectedShift
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (selectedShift && open) {
      form.setFieldsValue({ duration: selectedShift.duration });
    }
  }, [selectedShift, open, form]);

  const handleOk = () => {
    form.submit();
  };

  const handleFinish = async (values: { duration: number }) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Редактировать смену"
      open={open}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      onOk={handleOk}
      okText="Сохранить"
      cancelText="Отмена"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item label="Дата смены">
          <Input 
            value={selectedShift?.date ? dayjs(selectedShift.date).format('DD.MM.YYYY') : ''} 
            disabled 
          />
        </Form.Item>
        <Form.Item
          name="duration"
          label="Новая продолжительность смены (часов)"
          rules={[
            { required: true, message: 'Укажите новую продолжительность смены' },
            { type: 'number', min: 1, max: 24, message: 'Продолжительность должна быть от 1 до 24 часов' }
          ]}
        >
          <InputNumber min={1} max={24} style={{ width: '100%' }} placeholder="12" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditShiftModal;

