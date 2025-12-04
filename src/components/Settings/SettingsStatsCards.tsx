import React, { type ReactNode } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { theme } from 'antd';

const { useToken } = theme;

interface StatCard {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  valueStyle?: React.CSSProperties;
  icon?: ReactNode;
}

interface SettingsStatsCardsProps {
  stats: StatCard[];
}

const SettingsStatsCards: React.FC<SettingsStatsCardsProps> = ({ stats }) => {
  const { token } = useToken();

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={index}>
          <Card>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.prefix || stat.icon}
              valueStyle={stat.valueStyle || { color: token.colorPrimary }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SettingsStatsCards;

