import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Space, Spin, Alert, Button } from 'antd';
import { QualityMapHeader, QualityMapInfo } from '../../components/EditQualityMap';
import QualityTable from '../../components/QualityTable/QualityTable';
import QualityCallsTable from '../../components/QualityTable/QualityCallsTable';
import { useGetQualityMapQuery } from '../../api/qualityApi';

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

  const handleViewMode = () => {
    navigate(`/quality/${qualityMapId}`);
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: 'clamp(12px, 2vw, 24px)', 
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
      <div style={{ padding: 'clamp(12px, 2vw, 24px)', maxWidth: '100%', margin: '0 auto' }}>
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
    <div style={{ padding: 'clamp(12px, 2vw, 24px)', maxWidth: '100%', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Заголовок с навигацией */}
        <QualityMapHeader 
          qualityMap={qualityMap}
          onBack={handleBack}
          onViewMode={handleViewMode}
        />

        {/* Информация о карте */}
        <QualityMapInfo qualityMap={qualityMap} />

        {/* Таблица качества - Чаты */}
        <QualityTable qualityMap={qualityMap} />

        {/* Таблица качества - Звонки */}
        {qualityMap.calls_count && qualityMap.calls_count > 0 && (
          <QualityCallsTable qualityMap={qualityMap} />
        )}
      </Space>
    </div>
  );
};

export default EditQualityMapPage;