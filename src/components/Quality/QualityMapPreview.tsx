import React from 'react';
import { Card, Descriptions, Avatar, Space, Tag, Typography, Statistic, Alert } from 'antd';
import { FileTextOutlined, TeamOutlined, UserOutlined, CalendarOutlined, MessageOutlined, SafetyCertificateOutlined, StarOutlined, FolderOutlined } from '@ant-design/icons';
import type { Team, User } from '../../types/quality.types';
import type { IQualityCriteria } from '../../types/quality-criteria.types';
import dayjs from 'dayjs';
import styles from '../../styles/quality/create-quality-map.module.css';

const { Title, Text } = Typography;

interface QualityMapPreviewProps {
  selectedTeamData?: Team;
  selectedUser?: User;
  formValues?: {
    dates?: [dayjs.Dayjs, dayjs.Dayjs];
    chat_count?: number;
    calls_count?: number;
  };
  selectedTeam: number | null;
  teamCriteria: IQualityCriteria[];
}

const QualityMapPreview: React.FC<QualityMapPreviewProps> = ({
  selectedTeamData,
  selectedUser,
  formValues,
  selectedTeam,
  teamCriteria
}) => {
  return (
    <>
      <Card 
        title="Предпросмотр карты"
        className={styles.previewCard}
      >
        <div className={styles.avatarContainer}>
          <Avatar 
            size={80} 
            icon={<FileTextOutlined />}
            className={styles.avatar}
          />
          <Title level={4} className={styles.title}>
            Карта качества
          </Title>
          <Text type="secondary">Новая проверка</Text>
        </div>

        <Descriptions column={1} size="small">
          <Descriptions.Item label="Команда">
            {selectedTeamData ? (
              <Tag color="blue" icon={<TeamOutlined />}>
                {selectedTeamData.name}
              </Tag>
            ) : (
              <Text type="secondary">Не выбрана</Text>
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label="Сотрудник">
            {selectedUser ? (
              <Space>
                <UserOutlined />
                {selectedUser.name}
              </Space>
            ) : (
              <Text type="secondary">Не выбран</Text>
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label="Период">
            {formValues?.dates ? (
              <Space>
                <CalendarOutlined />
                {formValues.dates[0].format('DD.MM.YYYY')} - {formValues.dates[1].format('DD.MM.YYYY')}
              </Space>
            ) : (
              <Text type="secondary">Не указан</Text>
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label="Чаты для проверки">
            {formValues?.chat_count ? (
              <Tag color="purple" icon={<MessageOutlined />}>
                {formValues.chat_count} чатов
              </Tag>
            ) : (
              <Text type="secondary">Не указано</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Звонки для проверки">
            {formValues?.calls_count && formValues.calls_count > 0 ? (
              <Tag color="cyan" icon={<MessageOutlined />}>
                {formValues.calls_count} звонков
              </Tag>
            ) : (
              <Text type="secondary">Не указано</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Критерии оценки">
            <div className={styles.criteriaContainer}>
              {selectedTeam ? (
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  <Text strong>{teamCriteria.length} критериев</Text>
                  {(() => {
                    // Группируем критерии по категориям
                    const grouped = new Map<string, typeof teamCriteria>();
                    teamCriteria.forEach(criterion => {
                      const categoryKey = criterion.category?.id?.toString() || 'no_category';
                      if (!grouped.has(categoryKey)) {
                        grouped.set(categoryKey, []);
                      }
                      grouped.get(categoryKey)!.push(criterion);
                    });

                    const sortedCategories = Array.from(grouped.entries()).sort((a, b) => {
                      if (a[0] === 'no_category') return 1;
                      if (b[0] === 'no_category') return -1;
                      const categoryA = teamCriteria.find(c => c.category?.id?.toString() === a[0])?.category;
                      const categoryB = teamCriteria.find(c => c.category?.id?.toString() === b[0])?.category;
                      return (categoryA?.name || '').localeCompare(categoryB?.name || '');
                    });

                    return sortedCategories.map(([categoryKey, criteria]) => {
                      const categoryName = criteria[0]?.category?.name || 'Без категории';
                      const displayCriteria = criteria.slice(0, 3);
                      const remainingCount = criteria.length - 3;

                      return (
                        <div key={categoryKey} style={{ 
                          marginBottom: 6,
                          padding: '6px 8px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          border: '1px solid #e8e8e8'
                        }}>
                          <div style={{ 
                            marginBottom: 6,
                            fontSize: '11px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <FolderOutlined style={{ fontSize: 10 }} />
                            <span style={{ fontWeight: 500 }}>{categoryName}</span>
                          </div>
                          <div>
                            {displayCriteria.map(criterion => (
                              <Tag 
                                key={criterion.id}
                                color={criterion.is_global ? "purple" : "blue"}
                                icon={criterion.is_global ? <SafetyCertificateOutlined /> : <StarOutlined />}
                                className={styles.criterionTag}
                                style={{ marginBottom: 4, marginRight: 4 }}
                              >
                                {criterion.name}
                              </Tag>
                            ))}
                            {remainingCount > 0 && (
                              <Tag className={styles.moreTag} style={{ marginBottom: 4 }}>
                                +{remainingCount} еще
                              </Tag>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </Space>
              ) : (
                <Text type="secondary">Выберите команду</Text>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className={styles.statsCard}>
        <Statistic
          title="Критериев оценки"
          value={teamCriteria.length}
          prefix={<StarOutlined />}
          valueStyle={{ color: '#faad14' }}
        />
      </Card>

      <Alert
        message="Информация о создании"
        description="После создания карты качества вы перейдете в режим редактирования для настройки ID чатов и добавления снятий баллов."
        type="info"
        showIcon
      />
    </>
  );
};

export default QualityMapPreview;

