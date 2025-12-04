import React from 'react';
import { Row, Col, Typography, Spin, Alert, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetTicketQuery, 
  useUpdateTicketMutation, 
  useGetTicketStatusesQuery 
} from '../../api/ticketsApi';
import { EditTicketForm, TicketInfo } from '../../components/Tickets';
import styles from '../../styles/tickets/edit-ticket.module.css';

const { Title, Text } = Typography;

const EditTicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const { data: ticket, isLoading } = useGetTicketQuery(Number(id));
  const { data: statuses } = useGetTicketStatusesQuery();
  const [updateTicket, { isLoading: isUpdating, isError, error }] = useUpdateTicketMutation();

  React.useEffect(() => {
    if (ticket) {
      form.setFieldsValue({
        title: ticket.title,
        description: ticket.description,
        status_id: ticket.status_id,
        priority: ticket.priority,
        team_id: ticket.team_id,
      });
    }
  }, [ticket, form]);

  const onFinish = async (values: any) => {
    try {
      await updateTicket({
        id: Number(id),
        data: values,
      }).unwrap();
      
      navigate(`/tickets/${id}`);
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 'clamp(12px, 2vw, 24px)', display: 'flex', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Alert
        message="Тикет не найден"
        description="Запрашиваемый тикет не существует или у вас нет к нему доступа."
        type="error"
        action={
          <Button onClick={() => navigate('/tickets')}>
            Вернуться к списку
          </Button>
        }
      />
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <div className={styles.headerContainer}>
            <Title level={2}>Редактирование тикета</Title>
            <Text type="secondary">
              {ticket.ticket_number} - {ticket.title}
            </Text>
          </div>
        </Col>

        <Col xs={24} lg={16}>
          <EditTicketForm
            form={form}
            onFinish={onFinish}
            statuses={statuses}
            isLoading={isUpdating}
            isError={isError}
            error={error}
            onCancel={() => navigate(`/tickets/${id}`)}
          />
        </Col>

        <Col xs={24} lg={8}>
          <TicketInfo ticket={ticket} />
        </Col>
      </Row>
    </div>
  );
};

export default EditTicketPage;