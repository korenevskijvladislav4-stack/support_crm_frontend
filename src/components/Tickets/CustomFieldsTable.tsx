import React from 'react';
import { Card, Row, Col, Flex, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { ITicket } from '../../types/ticket.types';

const { Text } = Typography;

interface CustomFieldsTableProps {
  ticket: ITicket;
}

export const CustomFieldsTable: React.FC<CustomFieldsTableProps> = ({ ticket }) => {
  if (!ticket?.custom_fields || Object.keys(ticket.custom_fields).length === 0) {
    return null;
  }

  return (
    <Card 
      title={
        <Flex align="center" gap={8}>
          <InfoCircleOutlined style={{ color: '#52c41a' }} />
          <span style={{ fontSize: '18px', fontWeight: 600 }}>Дополнительная информация</span>
        </Flex>
      }
      style={{ 
        marginBottom: 24,
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <Row gutter={[16, 16]}>
        {Object.entries(ticket.custom_fields).map(([key, value], index) => {
          const fieldConfig = ticket.type?.fields.find(f => f.name === key);
          return fieldConfig && value ? (
            <Col xs={24} sm={12} key={index}>
              <CustomFieldCard 
                label={fieldConfig.label}
                value={String(value)}
              />
            </Col>
          ) : null;
        })}
      </Row>
    </Card>
  );
};

const CustomFieldCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Card 
    size="small" 
    style={customFieldCardStyle}
  >
    <Flex justify="space-between" align="center">
      <Text strong style={{ color: '#666', fontSize: '14px' }}>
        {label}:
      </Text>
      <Text style={{ fontSize: '15px', fontWeight: 500 }}>
        {value}
      </Text>
    </Flex>
  </Card>
);

const customFieldCardStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #f6ffed 0%, #f0fff0 100%)',
  border: '1px solid #b7eb8f',
  borderRadius: '12px',
  height: '100%'
};