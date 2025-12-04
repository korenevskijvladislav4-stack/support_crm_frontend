import React from 'react';
import { Card, Space, Typography } from 'antd';
import type { ITicket } from '../../types/ticket.types';
import styles from '../../styles/tickets/edit-ticket.module.css';

const { Text } = Typography;

interface TicketInfoProps {
  ticket: ITicket;
}

const TicketInfo: React.FC<TicketInfoProps> = ({ ticket }) => {
  return (
    <Card title="Информация о тикете" className={styles.infoCard}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Text strong>Номер тикета</Text>
          <br />
          <Text>{ticket.ticket_number}</Text>
        </div>
        
        <div>
          <Text strong>Тип запроса</Text>
          <br />
          <Text>{ticket.type?.name}</Text>
        </div>
        
        <div>
          <Text strong>Создатель</Text>
          <br />
          <Text>{ticket.creator?.name} {ticket.creator?.surname}</Text>
        </div>
        
        <div>
          <Text strong>Дата создания</Text>
          <br />
          <Text>{new Date(ticket.created_at).toLocaleString('ru-RU')}</Text>
        </div>
      </Space>
    </Card>
  );
};

export default TicketInfo;
