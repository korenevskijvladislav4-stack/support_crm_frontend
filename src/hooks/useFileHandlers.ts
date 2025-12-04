import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { ITicketAttachment } from '../types/ticket.types';
import { isImageFile, isPdfFile } from '../utils/ticketUtils';

interface PreviewState {
  visible: boolean;
  image: string;
  title: string;
  isPdf: boolean;
}

export const useFileHandlers = () => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewState, setPreviewState] = useState<PreviewState>({
    visible: false,
    image: '',
    title: '',
    isPdf: false
  });
  const [isDownloading, setIsDownloading] = useState<number | null>(null);

  const handleFileUpload = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      message.error('Файл слишком большой. Максимальный размер: 10MB');
      return false;
    }
    
    setAttachments(prev => [...prev, file]);
    message.success(`Файл "${file.name}" добавлен`);
    return false;
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handlePreview = useCallback(async (
    file: File | ITicketAttachment, 
    previewAttachment?: (id: number) => Promise<Blob>
  ) => {
    try {
      if (file instanceof File) {
        // Превью для новых файлов
        if (isImageFile(file)) {
          const url = URL.createObjectURL(file);
          setPreviewState({
            visible: true,
            image: url,
            title: file.name,
            isPdf: false
          });
        } else if (isPdfFile(file)) {
          const url = URL.createObjectURL(file);
          window.open(url, '_blank');
        } else {
          message.info('Превью доступно только для изображений и PDF');
        }
      } else {
        // Превью для существующих файлов с сервера
        if (isImageFile(file)) {
          const blob = await previewAttachment!(file.id);
          const url = URL.createObjectURL(blob);
          setPreviewState({
            visible: true,
            image: url,
            title: file.original_name,
            isPdf: false
          });
        } else if (isPdfFile(file)) {
          const blob = await previewAttachment!(file.id);
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        } else {
          message.info('Превью доступно только для изображений и PDF');
        }
      }
    } catch (err) {
      console.error('Failed to preview attachment:', err);
      message.error('Ошибка при просмотре файла');
    }
  }, []);

  const closePreview = useCallback(() => {
    setPreviewState(prev => ({
      ...prev,
      visible: false
    }));
    
    // Очищаем URL объекта когда закрываем превью
    if (previewState.image) {
      URL.revokeObjectURL(previewState.image);
    }
  }, [previewState.image]);

  return {
    attachments,
    setAttachments,
    previewVisible: previewState.visible,
    previewImage: previewState.image,
    previewTitle: previewState.title,
    isPdf: previewState.isPdf,
    isDownloading,
    setIsDownloading,
    handleFileUpload,
    handleRemoveAttachment,
    handlePreview,
    closePreview
  };
};