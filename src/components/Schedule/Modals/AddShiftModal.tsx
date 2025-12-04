import React from 'react';
import { Modal, Form, DatePicker, InputNumber, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { IUserWithShifts } from '../../../types/user.types';

interface AddShiftModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: { date: Dayjs | string; duration: number; user_id: number }) => Promise<void>;
  selectedDate: string | null;
  selectedUserId: number | null;
  users: IUserWithShifts[] | undefined;
}

const AddShiftModal: React.FC<AddShiftModalProps> = ({
  open,
  onCancel,
  onSubmit,
  selectedDate,
  selectedUserId,
  users
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      const formValues: { date?: Dayjs; duration: number; user_id?: number } = {
        duration: 12,
      };
      
      if (selectedDate) {
        formValues.date = dayjs(selectedDate);
      }
      
      if (selectedUserId) {
        formValues.user_id = selectedUserId;
      }
      
      form.setFieldsValue(formValues);
    }
  }, [selectedDate, selectedUserId, open, form]);

  const handleOk = () => {
    form.submit();
  };

  const handleFinish = async (values: { date: Dayjs | string; duration: number; user_id: number }) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Добавить смену"
      open={open}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      onOk={handleOk}
      okText="Добавить"
      cancelText="Отмена"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          name="user_id"
          label="Сотрудник"
          rules={[{ required: true, message: 'Выберите сотрудника' }]}
        >
          <Select
            showSearch
            placeholder="Выберите сотрудника"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={users?.map(user => ({
              value: user.id,
              label: `${user.name} ${user.surname}`
            }))}
          />
        </Form.Item>
        <Form.Item
          name="date"
          label="Дата смены"
          rules={[{ required: true, message: 'Выберите дату смены' }]}
        >
          <DatePicker 
            style={{ width: '100%' }}
            format="DD.MM.YYYY"
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

export default AddShiftModal;

