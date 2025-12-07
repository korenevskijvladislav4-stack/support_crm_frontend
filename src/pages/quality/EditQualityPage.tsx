import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Button, Space } from 'antd';
import { QualityMapHeader, QualityMapInfo } from '../../components/EditQualityMap';
import QualityTable from '../../components/QualityTable/QualityTable';
import QualityCallsTable from '../../components/QualityTable/QualityCallsTable';
import { useGetQualityMapQuery } from '../../api/qualityApi';
import styles from '../../styles/users/users-page.module.css';

const EditQualityMapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qualityMapId = parseInt(id || '0');

  const { data: qualityMap, isLoading, error } = useGetQualityMapQuery(qualityMapId, {
    skip: !qualityMapId,
  });

  const handleBack = () => {
    navigate('/quality');
  };

  const handleToggleMode = () => {
    navigate(`/quality/${qualityMapId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer} style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" tip="Загрузка карты качества..." />
      </div>
    );
  }

  if (error || !qualityMap) {
    return (
      <div className={styles.pageContainer}>
        <Alert
          message="Ошибка загрузки"
          description="Не удалось загрузить карту качества. Проверьте правильность идентификатора или попробуйте обновить страницу."
          type="error"
          showIcon
          action={
            <Space>
              <Button onClick={() => window.location.reload()}>
                Обновить
              </Button>
              <Button type="primary" onClick={handleBack}>
                Вернуться к списку
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Заголовок с навигацией */}
      <QualityMapHeader 
        qualityMap={qualityMap}
        mode="edit"
        onBack={handleBack}
        onToggleMode={handleToggleMode}
      />

      {/* Информация о карте */}
      <div style={{ marginBottom: 16 }}>
        <QualityMapInfo qualityMap={qualityMap} mode="edit" />
      </div>

      {/* Таблица качества - Чаты */}
      <QualityTable qualityMap={qualityMap} />

      {/* Таблица качества - Звонки */}
      {qualityMap.progress?.calls.total > 0 && (
        <div style={{ marginTop: 16 }}>
          <QualityCallsTable qualityMap={qualityMap} />
        </div>
      )}
    </div>
  );
};

export default EditQualityMapPage;
