import React from 'react';
import { Modal, Form, Select, InputNumber, Input, DatePicker } from 'antd';
import type { IPenalty, IPenaltyForm } from '../../types/penalty.types';
import type { IUser } from '../../types/user.types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface PenaltyModalProps {
  open: boolean;
  editingPenalty: IPenalty | null;
  onOk: () => Promise<void>;
  onCancel: () => void;
  form: ReturnType<typeof Form.useForm<IPenaltyForm>>[0];
  users: IUser[];
  isSubmitting: boolean;
}

const PenaltyModal: React.FC<PenaltyModalProps> = ({
  open,
  editingPenalty,
  onOk,
  onCancel,
  form,
  users,
  isSubmitting
}) => {
  return (
    <Modal
      title={editingPenalty ? 'Редактировать штраф' : 'Создать штраф'}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={editingPenalty ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
      confirmLoading={isSubmitting}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'pending'
        }}
      >
        <Form.Item
          name="user_id"
          label="Пользователь"
          rules={[{ required: true, message: 'Выберите пользователя' }]}
        >
          <Select
            placeholder="Выберите пользователя"
            showSearch
            optionFilterProp="children"
            disabled={!!editingPenalty}
          >
            {users?.map((user: IUser) => (
              <Option key={user.id} value={user.id}>
                {user.name} {user.surname} ({user.email})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="chat_id"
          label="ID чата"
          rules={[
            { required: true, message: 'Введите ID чата' },
            { max: 100, message: 'Максимум 100 символов' }
          ]}
        >
          <Input
            placeholder="Введите ID чата, в котором обнаружено нарушение"
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="violation_date"
          label="Дата нарушения"
          rules={[{ required: true, message: 'Выберите дату нарушения' }]}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : null,
          })}
          getValueFromEvent={(date) => date?.format('YYYY-MM-DD')}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD.MM.YYYY"
            placeholder="Выберите дату нарушения"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="hours_to_deduct"
          label="Количество часов для снятия"
          rules={[
            { required: true, message: 'Введите количество часов' },
            { type: 'number', min: 1, max: 1000, message: 'От 1 до 1000 часов' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            max={1000}
            placeholder="Введите количество часов"
          />
        </Form.Item>

        <Form.Item
          name="comment"
          label="Комментарий (объяснение нарушения)"
          rules={[
            { required: true, message: 'Введите комментарий' },
            { max: 1000, message: 'Максимум 1000 символов' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Опишите нарушение..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        {editingPenalty && (
          <Form.Item
            name="status"
            label="Статус"
          >
            <Select>
              <Option value="pending">Ожидает</Option>
              <Option value="approved">Одобрен</Option>
              <Option value="rejected">Отклонен</Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default PenaltyModal;

