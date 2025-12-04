import React from 'react';
import { Card, Form, Input, Select, Row, Col, Space, Button, Alert } from 'antd';
import { Badge } from 'antd';
import type { ITicketStatus } from '../../types/ticket.types';
import styles from '../../styles/tickets/edit-ticket.module.css';

const { Option } = Select;
const { TextArea } = Input;

interface EditTicketFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  onFinish: (values: any) => void;
  statuses?: ITicketStatus[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  onCancel: () => void;
}

const EditTicketForm: React.FC<EditTicketFormProps> = ({
  form,
  onFinish,
  statuses,
  isLoading,
  isError,
  error,
  onCancel
}) => {
  return (
    <Card className={styles.formCard}>
      {isError && (
        <Alert
          message="Ошибка при обновлении тикета"
          description={error?.toString()}
          type="error"
          className={styles.errorAlert}
          showIcon
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="status_id"
              label="Статус"
              rules={[{ required: true, message: 'Выберите статус' }]}
            >
              <Select placeholder="Выберите статус">
                {statuses?.map(status => (
                  <Option key={status.id} value={status.id}>
                    <Badge color={status.color} text={status.name} />
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="priority"
              label="Приоритет"
              rules={[{ required: true, message: 'Выберите приоритет' }]}
            >
              <Select placeholder="Выберите приоритет">
                <Option value="low">Низкий</Option>
                <Option value="medium">Средний</Option>
                <Option value="high">Высокий</Option>
                <Option value="urgent">Срочный</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="title"
          label="Заголовок"
          rules={[{ required: true, message: 'Введите заголовок тикета' }]}
        >
          <Input placeholder="Краткое описание проблемы" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Подробное описание"
          rules={[{ required: true, message: 'Введите описание проблемы' }]}
        >
          <TextArea 
            rows={6} 
            placeholder="Опишите проблему максимально подробно..." 
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isLoading} size="large">
              Сохранить изменения
            </Button>
            <Button onClick={onCancel} size="large">
              Отмена
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditTicketForm;

