import React from 'react';
import { Button, Typography, Flex } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/tickets/tickets-page.module.css';

const { Title, Text } = Typography;

const TicketsPageHeader: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div className={styles.headerContainer}>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
        <div className={styles.headerTitleSection}>
          <Title 
            level={2} 
            className={styles.title}
            style={{ color: token.colorText }}
          >
            <span>🎫</span>
            Тикеты
          </Title>
          <Text type="secondary" className={styles.description}>
            Управление запросами и обращениями
          </Text>
        </div>
        
        <Link to="/tickets/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Создать
          </Button>
        </Link>
      </Flex>
    </div>
  );
};

export default TicketsPageHeader;

