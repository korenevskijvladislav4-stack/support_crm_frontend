import React, { useState, useCallback, useMemo } from 'react';
import { Row, Col, Alert, Button, Space, Spin, Flex, Typography, Modal, Image, FloatButton, message } from 'antd';
import { ReloadOutlined, CloseOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

// API хуки
import { 
  useGetTicketQuery, 
  useCreateCommentMutation,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
  useUpdateTicketStatusMutation,
  useGetTicketStatusesQuery,
  useDownloadAttachmentMutation,
  usePreviewAttachmentMutation
} from '../../api/ticketsApi';

// Компоненты
import { HeaderSection } from '../../components/Tickets/HeaderSection';
import { CommentForm } from '../../components/Tickets/CommentForm';
import { TicketManagement } from '../../components/Tickets/TicketManagement';
import { TicketInfo } from '../../components/Tickets';
import { CustomFieldsTable } from '../../components/Tickets/CustomFieldsTable';
import { CommentsList } from '../../components/Tickets/CommentsList';

// Хуки и утилиты
import { useFileHandlers } from '../../hooks/useFileHandlers';
import type { ITicketAttachment } from '../../types/ticket.types';

const { Text } = Typography;

export const TicketViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // API хуки
  const { 
    data: ticket, 
    isLoading, 
    error, 
    refetch 
  } = useGetTicketQuery(Number(id));
  
  const { data: statuses = [] } = useGetTicketStatusesQuery();
  const [createComment] = useCreateCommentMutation();
  const [uploadAttachment] = useUploadAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();
  const [updateTicketStatus] = useUpdateTicketStatusMutation();
  const [downloadAttachment] = useDownloadAttachmentMutation();
  const [previewAttachment] = usePreviewAttachmentMutation();

  // Состояния
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Хук для работы с файлами
  const {
    attachments,
    setAttachments,
    previewVisible,
    previewImage,
    previewTitle,
    isDownloading,
    setIsDownloading,
    handleFileUpload,
    handleRemoveAttachment,
    handlePreview,
    closePreview
  } = useFileHandlers();

  // Обработчик добавления комментария
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() && attachments.length === 0) {
      message.warning('Добавьте текст комментария или прикрепите файл');
      return;
    }

    if (!ticket) return;

    setIsUploading(true);

    try {
      const promises = [];

      // Добавление комментария
      if (commentText.trim()) {
        promises.push(
          createComment({
            ticketId: ticket.id,
            data: { 
              content: commentText, 
              is_internal: isInternal 
            },
          }).unwrap()
        );
      }

      // Загрузка файлов
      if (attachments.length > 0) {
        const uploadPromises = attachments.map(file =>
          uploadAttachment({ 
            ticketId: ticket.id, 
            file 
          }).unwrap()
        );
        promises.push(...uploadPromises);
      }

      await Promise.all(promises);
      
      // Сообщение об успехе
      const successMessage = getSuccessMessage(commentText, attachments.length);
      message.success(successMessage);
      
      // Сброс формы
      setCommentText('');
      setIsInternal(false);
      setAttachments([]);
      
      // Обновление данных
      refetch();
      
    } catch (err: unknown) {
      console.error('Failed to add comment or attachment:', err);
      message.error(err?.data?.message || 'Ошибка при добавлении комментария');
    } finally {
      setIsUploading(false);
    }
  }, [
    commentText, 
    attachments, 
    isInternal, 
    ticket, 
    createComment, 
    uploadAttachment, 
    refetch,
    setAttachments
  ]);

  // Обработчик клавиш для комментария
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isUploading) {
      e.preventDefault();
      handleAddComment();
    }
  }, [handleAddComment, isUploading]);

  // Обработчик скачивания файла
  const handleDownloadAttachment = useCallback(async (attachment: ITicketAttachment) => {
    setIsDownloading(attachment.id);
    try {
      const blob = await downloadAttachment(attachment.id).unwrap();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.original_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('Файл скачивается');
    } catch (err: unknown) {
      console.error('Failed to download attachment:', err);
      message.error(err?.data?.message || 'Ошибка при скачивании файла');
    } finally {
      setIsDownloading(null);
    }
  }, [downloadAttachment, setIsDownloading]);

  // Обработчик удаления файла
  const handleDeleteAttachment = useCallback(async (attachmentId: number) => {
    try {
      await deleteAttachment(attachmentId).unwrap();
      message.success('Файл удален');
      refetch();
    } catch (err: unknown) {
      console.error('Failed to delete attachment:', err);
      message.error(err?.data?.message || 'Ошибка при удалении файла');
    }
  }, [deleteAttachment, refetch]);

  // Обработчик изменения статуса
  const handleStatusChange = useCallback(async (newStatusId: number) => {
    if (!ticket) return;
    
    setIsChangingStatus(true);
    try {
      await updateTicketStatus({
        id: ticket.id,
        statusId: newStatusId
      }).unwrap();
      message.success('Статус обновлен');
      refetch();
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
      message.error(err?.data?.message || 'Ошибка при обновлении статуса');
    } finally {
      setIsChangingStatus(false);
    }
  }, [ticket, updateTicketStatus, refetch]);

  // Обработчик превью с API
  const handlePreviewWithApi = useCallback(async (file: File | ITicketAttachment) => {
    if (file instanceof File) {
      handlePreview(file);
    } else {
      try {
        const blob = await previewAttachment(file.id).unwrap();
        handlePreview(file, () => Promise.resolve(blob));
      } catch (err: unknown) {
        console.error('Failed to preview attachment:', err);
        message.error(err?.data?.message || 'Ошибка при просмотре файла');
      }
    }
  }, [handlePreview, previewAttachment]);

  // Пропсы для формы комментариев
  // В главном компоненте TicketViewPage обновите создание пропсов:
const commentFormProps = useMemo(() => ({
  commentText,
  setCommentText,
  isInternal,
  setIsInternal,
  attachments,
  isUploading,
  onAddComment: handleAddComment,
  onFileUpload: handleFileUpload,
  onRemoveAttachment: handleRemoveAttachment,
  onPreview: handlePreviewWithApi,
  onKeyPress: handleKeyPress
}), [
  commentText,
  isInternal,
  attachments,
  isUploading,
  handleAddComment,
  handleFileUpload,
  handleRemoveAttachment,
  handlePreviewWithApi,
  handleKeyPress
]);

  // Пропсы для управления тикетом
  const ticketManagementProps = useMemo(() => ({
    ticket: ticket!,
    statuses,
    isChangingStatus,
    isDownloading,
    onStatusChange: handleStatusChange,
    onDownload: handleDownloadAttachment,
    onDelete: handleDeleteAttachment,
    onPreview: handlePreviewWithApi
  }), [
    ticket,
    statuses,
    isChangingStatus,
    isDownloading,
    handleStatusChange,
    handleDownloadAttachment,
    handleDeleteAttachment,
    handlePreviewWithApi
  ]);

  // Состояние загрузки
  if (isLoading) {
    return <LoadingState />;
  }

  // Состояние ошибки
  if (error || !ticket) {
    return (
      <ErrorState 
        onRetry={refetch} 
        onNavigate={() => navigate('/tickets')} 
      />
    );
  }

  return (
    <div style={{ padding: 'clamp(12px, 2vw, 24px)', maxWidth: '100%', margin: '0 auto' }}>
      {/* Шапка с основной информацией */}
      <HeaderSection ticket={ticket} />

      <Row gutter={[24, 24]}>
        {/* Основная колонка */}
        <Col xs={24} lg={16}>
          <TicketInfo ticket={ticket} />
          <CustomFieldsTable ticket={ticket} />
          <CommentsList 
            ticket={ticket} 
            commentForm={<CommentForm {...commentFormProps} />} 
          />
        </Col>

        {/* Боковая колонка */}
        <Col xs={24} lg={8}>
          <TicketManagement {...ticketManagementProps} />
        </Col>
      </Row>

      {/* Модальное окно превью */}
      <PreviewModal 
        visible={previewVisible}
        image={previewImage}
        title={previewTitle}
        onClose={closePreview}
      />

      {/* Плавающая кнопка обновления */}
      <FloatButton
        icon={<ReloadOutlined />}
        tooltip="Обновить данные"
        onClick={() => refetch()}
        style={{ right: 24, bottom: 24 }}
      />
    </div>
  );
};

// Вспомогательные функции
const getSuccessMessage = (commentText: string, attachmentCount: number): string => {
  if (commentText.trim() && attachmentCount > 0) {
    return `Комментарий и ${attachmentCount} файл(ов) добавлены`;
  } else if (commentText.trim()) {
    return 'Комментарий добавлен';
  } else {
    return `${attachmentCount} файл(ов) добавлены`;
  }
};

// Компонент состояния загрузки
const LoadingState: React.FC = () => (
  <Flex justify="center" align="center" style={{ height: '50vh' }} vertical gap={16}>
    <Spin size="large" />
    <Text style={{ fontSize: '16px', color: '#666' }}>Загрузка тикета...</Text>
  </Flex>
);

// Компонент состояния ошибки
const ErrorState: React.FC<{ 
  onRetry: () => void; 
  onNavigate: () => void; 
}> = ({ onRetry, onNavigate }) => (
  <div style={{ padding: '24px', maxWidth: 600, margin: '0 auto' }}>
    <Alert
      message="Ошибка загрузки тикета"
      description="Не удалось загрузить данные тикета. Возможно, он был удален или у вас нет доступа."
      type="error"
      showIcon
      action={
        <Space>
          <Button onClick={onRetry} icon={<ReloadOutlined />}>
            Попробовать снова
          </Button>
          <Button onClick={onNavigate} type="primary">
            Вернуться к списку
          </Button>
        </Space>
      }
    />
  </div>
);

// Компонент модального окна превью
const PreviewModal: React.FC<{
  visible: boolean;
  image: string;
  title: string;
  onClose: () => void;
}> = ({ visible, image, title, onClose }) => (
  <Modal
    open={visible}
    title={title}
    footer={null}
    onCancel={onClose}
    width="80vw"
    style={{ top: 20 }}
    closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
  >
    <Image
      wrapperStyle={{ width: '100%', textAlign: 'center' }}
      src={image}
      alt={title}
    />
  </Modal>
);

export default TicketViewPage;