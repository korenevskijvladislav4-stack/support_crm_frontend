import { useState } from 'react';
import { Card, Tabs } from 'antd';
import CreateQualityMap from './CreateQualityMapPage';
import QualityTable from '../../components/QualityTable/QualityTable';
import { useGetQualityMapQuery } from '../../api/qualityApi';

const QualityControlPage = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [currentMapId, setCurrentMapId] = useState(null);
  
  const { data: qualityMap } = useGetQualityMapQuery(currentMapId, {
    skip: !currentMapId,
  });

  const handleMapCreated = (mapId) => {
    setCurrentMapId(mapId);
    setActiveTab('view');
  };

  const tabs = [
    {
      key: 'create',
      label: 'Создание карты',
      children: <CreateQualityMap onSuccess={handleMapCreated} />,
    },
    ...(currentMapId ? [{
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