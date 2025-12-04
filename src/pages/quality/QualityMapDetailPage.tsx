import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Space, Spin, Alert, Button } from 'antd';
import { QualityMapDetailHeader, QualityMapInfo } from '../../components/EditQualityMap';
import QualityTableView from '../../components/QualityTableView';
import QualityCallsTableView from '../../components/QualityCallsTableView';
import { useGetQualityMapQuery } from '../../api/qualityApi';

const QualityMapDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qualityMapId = parseInt(id || '0');

  const { data: qualityMap, isLoading, error } = useGetQualityMapQuery(qualityMapId, {
    skip: !qualityMapId,
  });

  const handleBack = () => {
    navigate('/quality');
  };

  const handleEditMode = () => {
    navigate(`/quality/${qualityMapId}/edit`);
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
        <QualityMapDetailHeader 
          qualityMap={qualityMap}
          onBack={handleBack}
          onEditMode={handleEditMode}
        />

        {/* Информация о карте */}
        <QualityMapInfo qualityMap={qualityMap} mode="view" />

        {/* Таблица качества - Чаты (только чтение) */}
        <QualityTableView qualityMap={qualityMap} />

        {/* Таблица качества - Звонки (только чтение) */}
        {qualityMap.calls_count && qualityMap.calls_count > 0 && (
          <QualityCallsTableView qualityMap={qualityMap} />
        )}
      </Space>
    </div>
  );
};

export default QualityMapDetailPage;