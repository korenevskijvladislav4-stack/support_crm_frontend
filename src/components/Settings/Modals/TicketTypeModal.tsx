import React from 'react';
import { Modal, Form, Input, Switch, Row, Col, Typography } from 'antd';
import type { ITicketType } from '../../../types/ticket.types';
import styles from '../../../styles/settings/settings-modals.module.css';

const { Text } = Typography;

interface TicketTypeModalProps {
  open: boolean;
  editingType: ITicketType | null;
  onOk: () => Promise<void>;
  onCancel: () => void;
  form: ReturnType<typeof Form.useForm>[0];
  isSubmitting: boolean;
}

const TicketTypeModal: React.FC<TicketTypeModalProps> = ({
  open,
  editingType,
  onOk,
  onCancel,
  form,
  isSubmitting
}) => {
  return (
    <Modal
      title={editingType ? 'Редактирование типа тикета' : 'Создание типа тикета'}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={isSubmitting}
      okText={editingType ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        size="large"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Название типа"
              rules={[{ required: true, message: 'Введите название типа' }]}
            >
              <Input placeholder="Например: Техническая проблема" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="is_active"
              label="Статус"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Активен" unCheckedChildren="Неактивен" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Описание"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Описание типа тикета..." 
          />
        </Form.Item>

        <Form.Item
          name="fields"
          label="Дополнительные поля"
          initialValue={[]}
        >
          <div>
            <Text type="secondary">
              Настройте дополнительные поля, которые будут отображаться при создании тикета этого типа
            </Text>
            {/* Здесь можно добавить динамическую форму для полей */}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TicketTypeModal;

