import React from 'react';
import { List, Flex, Space, Button, Typography, Popconfirm, Tooltip, theme } from 'antd';
import { DownloadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ITicketAttachment } from '../../types/ticket.types';
import { formatFileSize, isImageFile, isPdfFile } from '../../utils/ticketUtils';
import { FileIcon } from './FileIcon';


const { Text } = Typography;

interface AttachmentsListProps {
  attachments: ITicketAttachment[];
  isDownloading: number | null;
  onDownload: (attachment: ITicketAttachment) => void;
  onDelete: (attachmentId: number) => void;
  onPreview: (attachment: ITicketAttachment) => void;
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  isDownloading,
  onDownload,
  onDelete,
  onPreview
}) => {
  const { token } = theme.useToken();
  return (
    <List
      size="small"
      dataSource={attachments}
      renderItem={(attachment) => (
        <List.Item style={{ padding: '12px 0', border: 'none' }}>
          <Flex justify="space-between" align="center" style={{ width: '100%' }}>
            <Flex align="center" gap={12} style={{ flex: 1 }}>
              <FileIconWrapper>
                <FileIcon 
                  fileName={attachment.original_name} 
                  mimeType={attachment.mime_type} 
                />
              </FileIconWrapper>
              <AttachmentInfo attachment={attachment} />
            </Flex>
            <AttachmentActions 
              attachment={attachment}
              isDownloading={isDownloading}
              onDownload={onDownload}
              onDelete={onDelete}
              onPreview={onPreview}
            />
          </Flex>
        </List.Item>
      )}
    />
  );
};

const FileIconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={fileIconStyle}>
    {children}
  </div>
);

const fileIconStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #87d068 0%, #52c41a 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '18px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
};

const AttachmentInfo: React.FC<{ attachment: ITicketAttachment }> = ({ attachment }) => (
  <div style={{ minWidth: 0, flex: 1 }}>
    <Text strong style={{ fontSize: '14px', display: 'block' }}>
      {attachment.original_name}
    </Text>
    <Text type="secondary" style={{ fontSize: '12px' }}>
      {formatFileSize(attachment.size)} • {new Date(attachment.created_at).toLocaleDateString('ru-RU')}
    </Text>
  </div>
);

const AttachmentActions: React.FC<{
  attachment: ITicketAttachment;
  isDownloading: number | null;
  onDownload: (attachment: ITicketAttachment) => void;
  onDelete: (attachmentId: number) => void;
  onPreview: (attachment: ITicketAttachment) => void;
}> = ({ attachment, isDownloading, onDownload, onDelete, onPreview }) => {
  const { token } = theme.useToken();
  return (
    <Space>
      <Tooltip 
        title={isImageFile(attachment) || isPdfFile(attachment) ? "Просмотреть" : "Скачать"}
        overlayInnerStyle={{ 
          backgroundColor: token.colorBgElevated,
          color: token.colorText,
          border: `1px solid ${token.colorBorder}`
        }}
      >
      <Button 
        type="text" 
        icon={isImageFile(attachment) || isPdfFile(attachment) ? <EyeOutlined /> : <DownloadOutlined />}
        size="small"
        onClick={() => (isImageFile(attachment) || isPdfFile(attachment)) ? onPreview(attachment) : onDownload(attachment)}
        style={{ color: '#1890ff' }}
        loading={isDownloading === attachment.id}
      />
    </Tooltip>
    <Popconfirm
      title="Удалить файл?"
      description="Вы уверены, что хотите удалить этот файл?"
      onConfirm={() => onDelete(attachment.id)}
      okText="Да"
      cancelText="Нет"
    >
      <Button 
        type="text" 
        icon={<DeleteOutlined />}
        size="small"
        danger
      />
      </Popconfirm>
    </Space>
  );
};