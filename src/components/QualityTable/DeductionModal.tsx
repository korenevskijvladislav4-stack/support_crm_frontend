import React from 'react';
import { Modal, Form, InputNumber, Input, Button, Space, theme } from 'antd';
import { SaveOutlined, InfoCircleOutlined, BarChartOutlined } from '@ant-design/icons';

interface DeductionFormValues {
  deduction: number;
  comment: string;
}

interface SelectedCell {
  criteriaId: number;
  chatIndex: number;
  existingDeduction?: {
    deduction: number;
    comment?: string;
  };
}

interface DeductionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: DeductionFormValues) => void;
  form: ReturnType<typeof Form.useForm<DeductionFormValues>>[0];
  loading: boolean;
  selectedCell: SelectedCell | null;
  getSelectedCriterionName: () => string;
  getSelectedChatName: () => string;
}

const DeductionModal: React.FC<DeductionModalProps> = ({
  open,
  onCancel,
  onSubmit,
  form,
  loading,
  selectedCell,
  getSelectedCriterionName,
  getSelectedChatName,
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
            backgroundColor: isDark ? '#3d2816' : '#fff2f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${isDark ? '#8b4513' : '#ffccc7'}`
          }}>
            <BarChartOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px', color: token.colorTextHeading, lineHeight: '22px' }}>
              {selectedCell?.existingDeduction ? 'Редактировать снятие' : 'Добавить снятие'}
            </div>
            <div style={{ fontSize: '12px', color: token.colorTextSecondary, lineHeight: '18px' }}>
              {getSelectedCriterionName()} • {getSelectedChatName()}
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={440}
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
        <Form<DeductionFormValues>
          form={form}
          onFinish={onSubmit}
          layout="vertical"
          size="middle"
        >
          <Form.Item
            name="deduction"
            label={<span style={{ fontWeight: 500, color: token.colorText, fontSize: '14px' }}>Размер снятия</span>}
            rules={[
              { required: true, message: 'Пожалуйста, введите размер снятия' },
              { type: 'number', min: 0, max: 100, message: 'Введите число от 0 до 100' }
            ]}
            extra={<div style={{ fontSize: '12px', color: token.colorTextSecondary, marginTop: '4px' }}>Укажите количество баллов для снятия (0-100)</div>}
            style={{ marginBottom: '20px' }}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              placeholder="0"
              size="middle"
              addonAfter="баллов"
            />
          </Form.Item>

          <Form.Item
            name="comment"
            label={<span style={{ fontWeight: 500, color: token.colorText, fontSize: '14px' }}>Комментарий</span>}
            rules={[
              { required: true, message: 'Пожалуйста, введите комментарий' },
            ]}
            style={{ marginBottom: '25px' }}
          >
            <Input.TextArea
              rows={4}
              placeholder="Опишите подробно причину снятия баллов..."
              showCount
              maxLength={500}
              style={{
                resize: 'vertical',
                minHeight: '96px'
              }}
            />
          </Form.Item>

          {selectedCell?.existingDeduction && (
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
                    Редактирование снятия
                  </div>
                  <div style={{ fontSize: '11px', color: token.colorTextSecondary, lineHeight: '16px' }}>
                    Текущее значение: {selectedCell.existingDeduction.deduction} баллов
                  </div>
                </div>
              </div>
            </div>
          )}
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
            style={{ minWidth: '100px' }}
          >
            {selectedCell?.existingDeduction ? 'Обновить' : 'Сохранить'}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default DeductionModal;
