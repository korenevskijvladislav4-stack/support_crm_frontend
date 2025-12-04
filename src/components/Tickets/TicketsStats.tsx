import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { theme } from 'antd';
import type { ITicket } from '../../types/ticket.types';
import styles from '../../styles/tickets/tickets-page.module.css';

interface TicketsStatsProps {
  tickets?: ITicket[];
}

const TicketsStats: React.FC<TicketsStatsProps> = ({ tickets }) => {
  const { token } = theme.useToken();
  const totalTickets = tickets?.length || 0;
  const newTickets = tickets?.filter(t => t.status?.name === 'Новый').length || 0;
  const inWorkTickets = tickets?.filter(t => t.status?.name === 'В работе').length || 0;
  const urgentTickets = tickets?.filter(t => t.priority === 'urgent').length || 0;

  return (
    <Row gutter={[16, 16]} className={styles.statsContainer}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="Всего"
            value={totalTickets}
            valueStyle={{ color: token.colorPrimary, fontSize: 20 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="Новых"
            value={newTickets}
            valueStyle={{ color: token.colorWarning, fontSize: 20 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="В работе"
            value={inWorkTickets}
            valueStyle={{ color: token.colorSuccess, fontSize: 20 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="Срочных"
            value={urgentTickets}
            valueStyle={{ color: token.colorError, fontSize: 20 }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default TicketsStats;

