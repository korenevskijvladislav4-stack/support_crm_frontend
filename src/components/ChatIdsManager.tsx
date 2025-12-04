// components/ChatIdsManager.tsx
import React, { useState } from 'react';
import { Card, Input, Button, Tag, message, Space } from 'antd';
import { PlusOutlined} from '@ant-design/icons';
import { useUpdateQualityMapChatIdsMutation } from '../api/qualityApi';

interface ChatIdsManagerProps {
  qualityMapId: number;
  currentChatIds: string[];
  onChatIdsUpdated: (chatIds: string[]) => void;
}

const ChatIdsManager: React.FC<ChatIdsManagerProps> = ({ 
  qualityMapId, 
  currentChatIds, 
  onChatIdsUpdated 
}) => {
  const [updateChatIds, { isLoading }] = useUpdateQualityMapChatIdsMutation();
  const [newChatId, setNewChatId] = useState<string>('');
  const [chatIds, setChatIds] = useState<string[]>(currentChatIds);

  const handleAddChatId = () => {
    if (newChatId.trim() && !chatIds.includes(newChatId.trim())) {
      const updatedChatIds = [...chatIds, newChatId.trim()];
      setChatIds(updatedChatIds);
      setNewChatId('');
    }
  };

  const handleRemoveChatId = (chatIdToRemove: string) => {
    const updatedChatIds = chatIds.filter(chatId => chatId !== chatIdToRemove);
    setChatIds(updatedChatIds);
  };

  const handleSaveChatIds = async () => {
    try {
      await updateChatIds({
        id: qualityMapId,
        data: { chat_ids: chatIds }
      }).unwrap();

      onChatIdsUpdated(chatIds);
      message.success('ID чатов обновлены');
    } catch {
      message.error('Ошибка при обновлении ID чатов');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChatId();
    }
  };

  return (
    <Card title="Управление ID чатов" size="small">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Введите ID чата"
            value={newChatId}
            onChange={(e) => setNewChatId(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddChatId}
            disabled={!newChatId.trim()}
          >
            Добавить
          </Button>
        </Space.Compact>

        <div>
          {chatIds.map(chatId => (
            <Tag
              key={chatId}
              closable
              onClose={() => handleRemoveChatId(chatId)}
              style={{ marginBottom: 8 }}
            >
              {chatId}
            </Tag>
          ))}
          {chatIds.length === 0 && (
            <div style={{ color: '#999' }}>ID чатов не добавлены</div>
          )}
        </div>

        <Button 
          type="primary" 
          onClick={handleSaveChatIds}
          loading={isLoading}
          disabled={chatIds.length === 0}
        >
          Сохранить ID чатов
        </Button>
      </Space>
    </Card>
  );
};

export default ChatIdsManager;