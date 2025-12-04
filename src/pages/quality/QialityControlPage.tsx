import { useState } from 'react';
import { Card, Tabs } from 'antd';
import CreateQualityMap from './CreateQualityMapPage';
import QualityTable from '../../components/QualityTable/QualityTable';
import { useGetQualityMapQuery } from '../../api/qualityApi';
import { skipToken } from '@reduxjs/toolkit/query';

const QualityControlPage = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [currentMapId, setCurrentMapId] = useState<number | null>(null);
  
  const { data: qualityMap } = useGetQualityMapQuery(currentMapId ?? skipToken, {
    skip: !currentMapId,
  });

  const handleMapCreated = (mapId: number) => {
    setCurrentMapId(mapId);
    setActiveTab('view');
  };

  const tabs = [
    {
      key: 'create',
      label: 'Создание карты',
      children: <CreateQualityMap onSuccess={handleMapCreated} />,
    },
    ...(currentMapId && qualityMap ? [{
      key: 'view',
      label: 'Текущая карта',
      children: <QualityTable qualityMap={qualityMap} />,
    }] : []),
  ];

  return (
    <Card title="Контроль качества сотрудников">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />
    </Card>
  );
};

export default QualityControlPage;