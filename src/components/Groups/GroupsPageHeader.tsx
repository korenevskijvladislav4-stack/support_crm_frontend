import React from 'react';
import { Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import styles from '../../styles/groups/groups-page.module.css';

const { Title, Text } = Typography;

interface GroupsPageHeaderProps {
  title?: string;
  description?: string;
}

const GroupsPageHeader: React.FC<GroupsPageHeaderProps> = ({
  title = 'Группы технической поддержки',
  description = 'Управление группами поддержки и мониторинг качества обслуживания',
}) => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <div>
          <Title level={2} className={styles.title}>
            <TeamOutlined style={{ color: '#1890ff' }} />
            {title}
          </Title>
          <Text type="secondary" className={styles.description}>
            {description}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default GroupsPageHeader;

