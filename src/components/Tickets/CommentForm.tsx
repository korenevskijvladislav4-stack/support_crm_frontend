import React, { memo, useCallback, useMemo } from 'react';
import { Card, Flex, Input, Button, Upload, Switch, Space, Tooltip, Typography, theme } from 'antd';
import { PaperClipOutlined, SendOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ITicketAttachment } from '../../types/ticket.types';
import { formatFileSize, isImageFile, isPdfFile } from '../../utils/ticketUtils';
import { FileIcon } from './FileIcon';

const { TextArea } = Input;
const { Text } = Typography;

interface CommentFormProps {
  commentText: string;
  setCommentText: (text: string) => void;
  isInternal: boolean;
  setIsInternal: (internal: boolean) => void;
  attachments: File[];
  isUploading: boolean;
  onAddComment: () => void;
  onFileUpload: (file: File) => boolean;
  onRemoveAttachment: (index: number) => void;
  onPreview: (file: File | ITicketAttachment) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const CommentForm: React.FC<CommentFormProps> = memo(({
  commentText,
  setCommentText,
  isInternal,
  setIsInternal,
  attachments,
  isUploading,
  onAddComment,
  onFileUpload,
  onRemoveAttachment,
  onPreview,
  onKeyPress
}) => {
  const hasContent = commentText.trim().length > 0 || attachments.length > 0;

  // Оптимизированные обработчики
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  }, [setCommentText]);

  const handleInternalChange = useCallback((checked: boolean) => {
    setIsInternal(checked);
  }, [setIsInternal]);

  // Мемоизированные значения
  const attachmentList = useMemo(() => (
    <AttachmentList 
      attachments={attachments}
      onRemove={onRemoveAttachment}
      onPreview={onPreview}
    />
  ), [attachments, onRemoveAttachment, onPreview]);

  const actionButtons = useMemo(() => (
    <ActionButtons 
      onFileUpload={onFileUpload}
      isUploading={isUploading}
      isInternal={isInternal}
      onInternalChange={handleInternalChange}
    />
  ), [onFileUpload, isUploading, isInternal, handleInternalChange]);

  const submitButton = useMemo(() => (
    <SubmitButton 
      hasContent={hasContent}
      isUploading={isUploading}
      onAddComment={onAddComment}
    />
  ), [hasContent, isUploading, onAddComment]);

  return (
    <Card 
      style={{ 
        marginBottom: 24,
        border: '1px solid #e8f4ff',
        borderRadius: '16px',
        background: '#fafdff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <Flex vertical gap={16}>
        <TextArea
          rows={4}
          placeholder="💬 Напишите ваш комментарий... (Ctrl+Enter для отправки)"
          value={commentText}
          onChange={handleTextChange}
          onKeyDown={onKeyPress}
          style={{ 
            border: '1px solid #d9d9d9',
            borderRadius: '12px',
            resize: 'vertical',
            fontSize: '15px',
            padding: '16px'
          }}
          autoSize={{ minRows: 3, maxRows: 8 }}
        />
        
        {attachmentList}

        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          {actionButtons}
          {submitButton}
        </Flex>

        {hasContent && (
          <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
            💡 Нажмите Ctrl+Enter для быстрой отправки
          </Text>
        )}
      </Flex>
    </Card>
  );
});

CommentForm.displayName = 'CommentForm';

// Вспомогательные компоненты также мемоизированы
const AttachmentList: React.FC<{
  attachments: File[];
  onRemove: (index: number) => void;
  onPreview: (file: File) => void;
}> = memo(({ attachments, onRemove, onPreview }) => {
  if (attachments.length === 0) return null;

  return (
    <div>
      <Text strong style={{ fontSize: '14px', marginBottom: 12, display: 'block', color: '#666' }}>
        📎 Прикрепленные файлы ({attachments.length}):
      </Text>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {attachments.map((file, index) => (
          <AttachmentItem
            key={`${file.name}-${index}-${file.size}`}
            file={file}
            index={index}
            onRemove={onRemove}
            onPreview={onPreview}
          />
        ))}
      </Space>
    </div>
  );
});

AttachmentList.displayName = 'AttachmentList';

const AttachmentItem: React.FC<{
  file: File;
  index: number;
  onRemove: (index: number) => void;
  onPreview: (file: File) => void;
}> = memo(({ file, index, onRemove, onPreview }) => {
  const { token } = theme.useToken();
  
  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  const handlePreview = useCallback(() => {
    onPreview(file);
  }, [onPreview, file]);

  const canPreview = isImageFile(file) || isPdfFile(file);

  const attachmentItemStyle: React.CSSProperties = {
    padding: '16px',
    background: token.colorBgContainer,
    borderRadius: '12px',
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: token.boxShadow
  };

  return (
    <Flex 
      justify="space-between" 
      align="center" 
      style={attachmentItemStyle}
    >
      <Flex align="center" gap={12} style={{ flex: 1 }}>
        <FileIcon fileName={file.name} mimeType={file.type} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: '14px', display: 'block', wordBreak: 'break-all' }}>
            {file.name}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {formatFileSize(file.size)}
          </Text>
        </div>
      </Flex>
      <Space>
        {canPreview && (
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            size="small"
            onClick={handlePreview}
            style={{ color: '#1890ff' }}
          >
            Просмотр
          </Button>
        )}
        <Button 
          type="text" 
          danger 
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleRemove}
        />
      </Space>
    </Flex>
  );
});

AttachmentItem.displayName = 'AttachmentItem';

const ActionButtons: React.FC<{
  onFileUpload: (file: File) => boolean;
  isUploading: boolean;
  isInternal: boolean;
  onInternalChange: (checked: boolean) => void;
}> = memo(({ onFileUpload, isUploading, isInternal, onInternalChange }) => {
  const { token } = theme.useToken();
  const handleInternalSwitch = useCallback((checked: boolean) => {
    onInternalChange(checked);
  }, [onInternalChange]);

  return (
    <Space size={16} wrap>
      <Upload
        accept="*/*"
        showUploadList={false}
        beforeUpload={onFileUpload}
        multiple
        disabled={isUploading}
      >
        <Button 
          icon={<PaperClipOutlined />} 
          type="dashed"
          disabled={isUploading}
          style={{ borderRadius: '8px' }}
        >
          Прикрепить файл
        </Button>
      </Upload>

      <Tooltip 
        title="Внутренний комментарий виден только сотрудникам"
        overlayInnerStyle={{ 
          backgroundColor: token.colorBgElevated,
          color: token.colorText,
          border: `1px solid ${token.colorBorder}`
        }}
      >
        <Flex align="center" gap={8}>
          <Switch 
            size="small" 
            checked={isInternal}
            onChange={handleInternalSwitch}
            disabled={isUploading}
          />
          <Text style={{ fontSize: '14px', color: '#666' }}>
            Внутренний
          </Text>
        </Flex>
      </Tooltip>
    </Space>
  );
});

ActionButtons.displayName = 'ActionButtons';

const SubmitButton: React.FC<{
  hasContent: boolean;
  isUploading: boolean;
  onAddComment: () => void;
}> = memo(({ hasContent, isUploading, onAddComment }) => {
  return (
    <Button 
      type="primary" 
      icon={<SendOutlined />}
      onClick={onAddComment}
      disabled={!hasContent || isUploading}
      loading={isUploading}
      size="large"
      style={submitButtonStyle}
    >
      {isUploading ? 'Отправка...' : 'Отправить'}
    </Button>
  );
});

SubmitButton.displayName = 'SubmitButton';

const submitButtonStyle: React.CSSProperties = {
  borderRadius: '12px',
  fontWeight: 600,
  padding: '12px 24px',
  height: 'auto',
  minWidth: 140,
  fontSize: '15px'
};