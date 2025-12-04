import React, { useState } from 'react';
import { Row, Col, Typography, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateTicketMutation, useGetTicketTypesQuery } from '../../api/ticketsApi';
import type { ITicketType, ITicketField, ITicketFormValues } from '../../types/ticket.types';
import { CreateTicketForm, TicketTips } from '../../components/Tickets';
import styles from '../../styles/tickets/create-ticket.module.css';

const { Title, Text } = Typography;

const CreateTicketPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ITicketType | null>(null);
  
  const [createTicket, { isLoading, isError, error }] = useCreateTicketMutation();
  const { data: types } = useGetTicketTypesQuery();


  const handleTypeChange = (typeId: number) => {
    const type = types?.find(t => t.id === typeId);
    setSelectedType(type || null);
  };

  const renderCustomField = (field: ITicketField) => {
    const commonProps = {
      placeholder: `Введите ${field.label.toLowerCase()}`,
      size: 'large' as const,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return <Input type={field.type} {...commonProps} />;
      
      case 'textarea':
        return <TextArea rows={4} {...commonProps} />;
      
      case 'select':
        return (
          <Select {...commonProps} allowClear>
            {field.options?.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        );
      
      case 'date':
        return <Input type="date" {...commonProps} />;
      
      default:
        return <Input {...commonProps} />;
    }
  };

  const onFinish = async (values: ITicketFormValues) => {
    try {
      const { custom_fields, ...ticketData } = values;
      
      const result = await createTicket({
        ...ticketData,
        custom_fields: custom_fields || {},
      }).unwrap();

      navigate(`/tickets/${result.id}`);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const { token } = theme.useToken();

  return (
    <div className={styles.pageContainer}>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <div className={styles.headerContainer}>
            <Title 
              level={2}
              style={{ 
                marginBottom: 8,
                color: token.colorText,
                fontSize: 'clamp(20px, 2.5vw, 24px)'
              }}
            >
              Создание тикета
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Заполните информацию о вашем запросе
            </Text>
          </div>
        </Col>

        <Col xs={24} lg={16}>
          <CreateTicketForm
            form={form}
            onFinish={onFinish}
            types={types}
            selectedType={selectedType}
            onTypeChange={handleTypeChange}
            isLoading={isLoading}
            isError={isError}
            error={error}
            renderCustomField={renderCustomField}
          />
        </Col>

        <Col xs={24} lg={8}>
          <TicketTips />
        </Col>
      </Row>
    </div>
  );
};

export default CreateTicketPage;