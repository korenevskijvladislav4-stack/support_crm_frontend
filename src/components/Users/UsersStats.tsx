import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, FilterOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/users/users-page.module.css';

interface UsersStatsProps {
  totalUsers: number;
  activeFiltersCount: number;
}

const UsersStats: React.FC<UsersStatsProps> = ({
  totalUsers,
  activeFiltersCount
}) => {
  const { token } = theme.useToken();

  return (
    <Row gutter={[16, 16]} className={styles.statsContainer}>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="Всего"
            value={totalUsers}
            prefix={<UserOutlined style={{ color: token.colorPrimary }} />}
            valueStyle={{ color: token.colorPrimary, fontSize: 20 }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card size="small" style={{ background: token.colorBgContainer }}>
          <Statistic
            title="Фильтры"
            value={activeFiltersCount}
            prefix={
              <FilterOutlined 
                style={{ 
                  color: activeFiltersCount > 0 
                    ? token.colorWarning 
                    : token.colorTextTertiary 
                }} 
              />
            }
            valueStyle={{ 
              color: activeFiltersCount > 0 
                ? token.colorWarning 
                : token.colorTextTertiary,
              fontSize: 20
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default UsersStats;

