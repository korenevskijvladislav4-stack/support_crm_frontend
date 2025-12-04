import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { TeamOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/attempts/attempts-page.module.css';

interface AttemptsStatsProps {
  totalAttempts: number;
  newAttempts: number;
  pendingAttempts: number;
  overdueAttempts: number;
}

const AttemptsStats: React.FC<AttemptsStatsProps> = ({
  totalAttempts,
  newAttempts,
  pendingAttempts,
  overdueAttempts
}) => {
  const { token } = theme.useToken();

  return (
    <Row gutter={[16, 16]} className={styles.statsContainer}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="Всего"
            value={totalAttempts}
            prefix={<TeamOutlined style={{ color: token.colorPrimary }} />}
            valueStyle={{ color: token.colorPrimary, fontSize: 20 }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="Новые"
            value={newAttempts}
            prefix={<span style={{ color: token.colorSuccess }}>🆕</span>}
            valueStyle={{ color: token.colorSuccess, fontSize: 20 }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="В ожидании"
            value={pendingAttempts}
            prefix={<ClockCircleOutlined style={{ color: token.colorWarning }} />}
            valueStyle={{ color: token.colorWarning, fontSize: 20 }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="Просрочено"
            value={overdueAttempts}
            prefix={<ExclamationCircleOutlined style={{ color: token.colorError }} />}
            valueStyle={{ color: token.colorError, fontSize: 20 }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default AttemptsStats;

