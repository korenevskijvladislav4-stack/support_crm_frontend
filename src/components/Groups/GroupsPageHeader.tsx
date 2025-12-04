import React from 'react';
import { Select, Button, Space, Typography } from 'antd';
import { TeamOutlined, PlusOutlined } from '@ant-design/icons';
import type { GroupStatusType } from '../../types/groups.types';
import styles from '../../styles/groups/groups-page.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface GroupsPageHeaderProps {
  filterStatus: string;
  onFilterChange: (status: string) => void;
  onCreateClick: () => void;
}

const GroupsPageHeader: React.FC<GroupsPageHeaderProps> = ({
  filterStatus,
  onFilterChange,
  onCreateClick
}) => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <div>
          <Title level={2} className={styles.title}>
            <TeamOutlined style={{ color: '#1890ff' }} />
            Группы технической поддержки
          </Title>
          <Text type="secondary" className={styles.description}>
            Управление группами поддержки и мониторинг качества обслуживания
          </Text>
        </div>
        
        <Space>
          <Select
            value={filterStatus}
            onChange={onFilterChange}
            style={{ width: 200 }}
            placeholder="Фильтр по статусу"
          >
            <Option value="all">Все группы</Option>
            <Option value="high-performance">Высокая эффективность</Option>
            <Option value="active">Активные</Option>
            <Option value="training">Обучение</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
            Создать группу
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default GroupsPageHeader;

