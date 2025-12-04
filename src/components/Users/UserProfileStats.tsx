import React from 'react';
import { Card, Flex, Progress, Typography } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import styles from '../../styles/users/user-profile.module.css';

const { Text } = Typography;

interface UserProfileStatsProps {
  qualityScore: number;
  satisfactionRate: number;
  avgResponseTime: string;
}

const UserProfileStats: React.FC<UserProfileStatsProps> = ({
  qualityScore,
  satisfactionRate,
  avgResponseTime
}) => {
  return (
    <Card 
      title={
        <span>
          <TrophyOutlined style={{ marginRight: 8, color: '#ffc53d' }} />
          Показатели эффективности
        </span>
      }
      className={styles.statsCard}
    >
      <Flex vertical gap={20}>
        <div>
          <Flex justify="space-between" style={{ marginBottom: 8 }}>
            <Text>Качество работы</Text>
            <Text strong>{qualityScore}%</Text>
          </Flex>
          <Progress 
            percent={qualityScore} 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            size="small"
          />
        </div>
        
        <div>
          <Flex justify="space-between" style={{ marginBottom: 8 }}>
            <Text>Удовлетворенность клиентов</Text>
            <Text strong>{satisfactionRate}%</Text>
          </Flex>
          <Progress 
            percent={satisfactionRate} 
            strokeColor="#52c41a"
            size="small"
          />
        </div>

        <div>
          <Flex justify="space-between" style={{ marginBottom: 8 }}>
            <Text>Среднее время ответа</Text>
            <Text strong>{avgResponseTime}</Text>
          </Flex>
          <Progress 
            percent={75} 
            strokeColor="#faad14"
            size="small"
          />
        </div>
      </Flex>
    </Card>
  );
};

export default UserProfileStats;

