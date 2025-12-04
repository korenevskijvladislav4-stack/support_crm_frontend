import { type FC } from "react";
import { Link } from "react-router-dom";
import { Button, Space, Typography, theme } from "antd";
import { PlusOutlined, ReloadOutlined, CalendarOutlined } from "@ant-design/icons";
import styles from '../../styles/users/users-page.module.css';

const { Title, Text } = Typography;

interface ScheduleHeaderProps {
  onRefetch?: () => void;
}

export const ScheduleHeader: FC<ScheduleHeaderProps> = ({ onRefetch }) => {
  const { token } = theme.useToken();

  return (
    <div className={styles.headerContainer} style={{ marginBottom: 12 }}>
      <div className={styles.headerContent}>
        <div className={styles.headerTitleSection}>
          <Title 
            level={3} 
            className={styles.title}
            style={{ color: token.colorText, marginBottom: 4 }}
          >
            <CalendarOutlined style={{ color: token.colorPrimary }} />
            График смен
          </Title>
          <Text type="secondary" className={styles.description} style={{ fontSize: 12 }}>
            Управление графиком работы сотрудников
          </Text>
        </div>
        
        <Space size="middle" wrap>
          {onRefetch && (
            <Button 
              icon={<ReloadOutlined />}
              onClick={onRefetch}
              size="middle"
            >
              Обновить
            </Button>
          )}
          <Link to="./create">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="middle"
            >
              Создать график
            </Button>
          </Link>
        </Space>
      </div>
    </div>
  );
};
