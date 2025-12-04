import React from 'react';
import { Space, Button, Tooltip, Popconfirm, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const { Text } = Typography;
const { useToken } = theme;

interface SettingsActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string | React.ReactNode;
  recordName?: string;
  isDeleting?: boolean;
  editTooltip?: string;
  deleteTooltip?: string;
}

const SettingsActionButtons: React.FC<SettingsActionButtonsProps> = ({
  onEdit,
  onDelete,
  deleteConfirmTitle = 'Удаление',
  deleteConfirmDescription,
  recordName,
  isDeleting = false,
  editTooltip = 'Редактировать',
  deleteTooltip = 'Удалить',
}) => {
  const { token } = useToken();

  return (
    <Space size="small">
      {onEdit && (
        <Tooltip 
          title={editTooltip}
          overlayInnerStyle={{
            backgroundColor: token.colorBgSpotlight,
            color: token.colorText,
          }}
        >
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined />}
            style={{ color: token.colorPrimary }}
            onClick={onEdit}
          />
        </Tooltip>
      )}
      
      {onDelete && (
        <Tooltip 
          title={deleteTooltip}
          overlayInnerStyle={{
            backgroundColor: token.colorBgSpotlight,
            color: token.colorText,
          }}
        >
          <Popconfirm
            title={deleteConfirmTitle}
            description={
              deleteConfirmDescription || (
                <div>
                  <div>
                    Вы уверены, что хотите удалить <Text strong>"{recordName}"</Text>?
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Это действие нельзя отменить
                  </Text>
                </div>
              )
            }
            icon={<ExclamationCircleOutlined style={{ color: token.colorError }} />}
            onConfirm={onDelete}
            okText="Да, удалить"
            cancelText="Отмена"
            okType="danger"
          >
            <Button 
              type="text" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
            />
          </Popconfirm>
        </Tooltip>
      )}
    </Space>
  );
};

export default SettingsActionButtons;

