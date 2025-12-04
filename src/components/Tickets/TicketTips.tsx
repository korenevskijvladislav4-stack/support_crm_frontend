import React from 'react';
import { Card, Space, Typography } from 'antd';
import styles from '../../styles/tickets/create-ticket.module.css';

const { Text } = Typography;

const TicketTips: React.FC = () => {
  return (
    <Card title="Полезные советы" className={styles.tipsCard}>
      <Space direction="vertical" size={16}>
        <div>
          <Text strong>Заголовок</Text>
          <br />
          <Text type="secondary">
            Кратко опишите суть проблемы. Например: "Не работает принтер в кабинете 301"
          </Text>
        </div>
        
        <div>
          <Text strong>Описание</Text>
          <br />
          <Text type="secondary">
            Укажите детали: что произошло, когда, какие ошибки видите, что уже пробовали сделать.
          </Text>
        </div>
        
        <div>
          <Text strong>Приоритет</Text>
          <br />
          <Text type="secondary">
            Выберите срочность: Низкий - нет влияния на работу, Срочный - полная остановка работы.
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default TicketTips;

