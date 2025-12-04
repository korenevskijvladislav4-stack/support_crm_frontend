import React from 'react';
import { Modal, Form, Input, Button, Space, theme } from 'antd';
import { SaveOutlined, InfoCircleOutlined, EditOutlined, MessageOutlined } from '@ant-design/icons';

interface EditChatModalValues {
  chatName: string;
}

interface EditChatModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: EditChatModalValues) => void;
  form: ReturnType<typeof Form.useForm<EditChatModalValues>>[0];
  loading: boolean;
  editingChatIndex: number | null;
}

const EditChatModal: React.FC<EditChatModalProps> = ({
  open,
  onCancel,
  onSubmit,
  form,
  loading,
  editingChatIndex
}) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            backgroundColor: isDark ? '#111b26' : '#f0f8ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${isDark ? '#003a8c' : '#d6e4ff'}`
          }}>
            <EditOutlined style={{ color: '#1890ff', fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px', color: token.colorTextHeading, lineHeight: '22px' }}>
              Настройка чата
            </div>
            <div style={{ fontSize: '12px', color: token.colorTextSecondary, lineHeight: '18px' }}>
              Чат {editingChatIndex !== null ? editingChatIndex + 1 : ''}
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={420}
      styles={{
        body: {
          padding: '24px 0 0 0'
        },
        header: {
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: '16px 24px',
          marginBottom: 0
        },
        content: {
          borderRadius: '8px'
        }
      }}
      destroyOnClose
    >
      <div style={{ padding: '0 24px' }}>
        <Form<EditChatModalValues>
          form={form}
          onFinish={onSubmit}
          layout="vertical"
          size="middle"
        >
          <Form.Item
            name="chatName"
            label={<span style={{ fontWeight: 500, color: token.colorText, fontSize: '14px' }}>ID чата</span>}
            rules={[
              { required: true, message: 'Пожалуйста, введите ID чата' },
              { min: 3, message: 'ID чата должен содержать минимум 3 символа' }
            ]}
            extra={<div style={{ fontSize: '12px', color: token.colorTextSecondary, marginTop: '4px' }}>Введите уникальный идентификатор чата для отслеживания</div>}
            style={{ marginBottom: '20px' }}
          >
            <Input
              placeholder="Например: support_chat_001"
              prefix={<MessageOutlined style={{ color: token.colorTextTertiary }} />}
            />
          </Form.Item>

          <div style={{
            padding: '12px 16px',
            backgroundColor: isDark ? '#162312' : '#f6ffed',
            borderRadius: '6px',
            border: `1px solid ${isDark ? '#3f6600' : '#b7eb8f'}`,
            marginBottom: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <InfoCircleOutlined style={{ color: '#52c41a', fontSize: 14, marginTop: '1px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '12px', color: '#52c41a', marginBottom: '2px', lineHeight: '18px' }}>
                  Подсказка
                </div>
                <div style={{ fontSize: '11px', color: token.colorTextSecondary, lineHeight: '16px' }}>
                  ID чата используется для связи с системой мониторинга. Убедитесь, что ID соответствует реальному идентификатору в вашей системе.
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
      <div style={{
        padding: '16px 24px',
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        marginTop: '8px'
      }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button
            onClick={onCancel}
            size="middle"
            style={{ minWidth: '80px' }}
          >
            Отмена
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="middle"
            onClick={() => form.submit()}
            style={{ minWidth: '120px' }}
          >
            Сохранить
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default EditChatModal;
