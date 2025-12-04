import React from 'react';
import { Card, Form, Input, Select, Row, Col, Divider, Space, Button, Alert } from 'antd';
import type { ITicketType, ITicketField, ITicketFormValues } from '../../types/ticket.types';
import styles from '../../styles/tickets/create-ticket.module.css';

const { Option } = Select;
const { TextArea } = Input;

interface CreateTicketFormProps {
  form: ReturnType<typeof Form.useForm<ITicketFormValues>>[0];
  onFinish: (values: ITicketFormValues) => void;
  types?: ITicketType[];
  selectedType: ITicketType | null;
  onTypeChange: (typeId: number) => void;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  renderCustomField: (field: ITicketField) => React.ReactNode;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  form,
  onFinish,
  types,
  selectedType,
  onTypeChange,
  isLoading,
  isError,
  error,
  renderCustomField
}) => {
  return (
    <Card className={styles.formCard}>
      {isError && (
        <Alert
          message="Ошибка при создании тикета"
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
              name="type_id"
              label="Тип запроса"
              rules={[{ required: true, message: 'Выберите тип запроса' }]}
            >
              <Select
                placeholder="Выберите тип запроса"
                onChange={onTypeChange}
                allowClear
              >
                {types?.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
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
              initialValue="medium"
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

        {selectedType && selectedType.fields.length > 0 && (
          <>
            <Divider orientation="left">
              Дополнительная информация
            </Divider>
            
            <Row gutter={[16, 0]}>
              {selectedType.fields.map((field) => (
                <Col xs={24} sm={12} key={field.name}>
                  <Form.Item
                    name={['custom_fields', field.name]}
                    label={field.label}
                    rules={[
                      { 
                        required: field.required, 
                        message: `Поле "${field.label}" обязательно для заполнения` 
                      }
                    ]}
                  >
                    {renderCustomField(field)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isLoading} size="large">
              Создать тикет
            </Button>
            <Button onClick={() => window.history.back()} size="large">
              Отмена
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateTicketForm;

